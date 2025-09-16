import { useReducer, useCallback, useMemo } from 'react';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState, ScoreInfo } from '@/core/types/game';
import { GameState, createInitialState, handleCellClick as handleCellClickCore, Player, WinCondition, setWinCondition, Move } from './core';
import { useGameStateLogger } from '@/core/hooks/useGameStateLogger';

// はさみ将棋固有の状態をBaseGameStateに適合させる
interface HasamiShogiGameState extends BaseGameState {
  board: GameState['board'];
  currentPlayer: Player;
  gameStatus: GameState['gameStatus'];
  winner: Player | null;
  selectedPiece: GameState['selectedPiece'];
  validMoves: GameState['validMoves'];
  potentialCaptures: GameState['potentialCaptures'];
  capturedPieces: GameState['capturedPieces'];
  winCondition: GameState['winCondition'];
  // ヒント関連
  hintsEnabled: boolean;
}

type HasamiShogiAction = 
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean }
  | { type: 'SET_WIN_CONDITION'; winCondition: WinCondition };

function createInitialHasamiShogiState(): HasamiShogiGameState {
  const coreState = createInitialState();
  return {
    ...coreState,
    // BaseGameState required fields
    status: 'waiting' as GameStatus,
    winner: null,
    // ヒント関連
    hintsEnabled: false,
  };
}

function hasamiShogiReducer(state: HasamiShogiGameState, action: HasamiShogiAction): HasamiShogiGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        gameStatus: state.gameStatus,
        winner: state.winner,
        selectedPiece: state.selectedPiece,
        validMoves: state.validMoves,
        potentialCaptures: state.potentialCaptures,
        capturedPieces: state.capturedPieces,
        winCondition: state.winCondition,
      };
      
      const newCoreState = handleCellClickCore(coreState, action.row, action.col);
      
      return {
        ...state,
        ...newCoreState,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.gameStatus === 'GAME_OVER' ? 'ended' : 'playing',
        currentPlayer: newCoreState.currentPlayer,
        winner: newCoreState.winner,
      };
    }
    
    case 'RESET_GAME':
      return createInitialHasamiShogiState();
    
    case 'SET_HINTS_ENABLED':
      return {
        ...state,
        hintsEnabled: action.enabled,
      };
    
    case 'SET_WIN_CONDITION': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        gameStatus: state.gameStatus,
        winner: state.winner,
        selectedPiece: state.selectedPiece,
        validMoves: state.validMoves,
        potentialCaptures: state.potentialCaptures,
        capturedPieces: state.capturedPieces,
        winCondition: state.winCondition,
      };
      
      const newCoreState = setWinCondition(coreState, action.winCondition);
      
      return {
        ...state,
        ...newCoreState,
        status: 'playing',
        // BaseGameState必須フィールドを明示的に更新
        currentPlayer: newCoreState.currentPlayer,
        winner: newCoreState.winner,
      };
    }
    
    default:
      return state;
  }
}

export type HasamiShogiController = BaseGameController<HasamiShogiGameState, HasamiShogiAction> & 
  HintableGameController<HasamiShogiGameState, HasamiShogiAction> & {
    // はさみ将棋固有のメソッド
    makeMove: (row: number, col: number) => void;
    setWinCondition: (winCondition: WinCondition) => void;
    // 状態アクセサー
    getValidMoves: () => Map<string, Move>;
    getCurrentPlayer: () => Player;
    getCapturedPieces: () => { PLAYER1: number; PLAYER2: number };
    getWinCondition: () => WinCondition;
    getSelectedPiece: () => { r: number; c: number } | null;
    getPotentialCaptures: () => [number, number][];
    isGameStarted: () => boolean;
    // スコア情報
    getScoreInfo: () => ScoreInfo | null;
  };

export function useHasamiShogi(): HasamiShogiController {
  const [gameState, dispatch] = useReducer(hasamiShogiReducer, createInitialHasamiShogiState());
  
  // ログ機能
  const logger = useGameStateLogger('useHasamiShogi', gameState, {
    hintsEnabled: gameState.hintsEnabled,
    validMovesCount: gameState.validMoves.size,
    capturedPieces: gameState.capturedPieces,
    winCondition: gameState.winCondition,
  });

  const resetGame = useCallback(() => {
    logger.log('RESET_GAME_CALLED', {});
    dispatch({ type: 'RESET_GAME' });
  }, [logger]);

  const makeMove = useCallback((row: number, col: number) => {
    logger.log('MAKE_MOVE_CALLED', { 
      row, 
      col, 
      currentPlayer: gameState.currentPlayer, 
      hintsEnabled: gameState.hintsEnabled,
      hasSelectedPiece: !!gameState.selectedPiece
    });
    dispatch({ type: 'MAKE_MOVE', row, col });
  }, [gameState.currentPlayer, gameState.hintsEnabled, gameState.selectedPiece, logger]);

  const setWinCondition = useCallback((winCondition: WinCondition) => {
    logger.log('SET_WIN_CONDITION_CALLED', { winCondition });
    dispatch({ type: 'SET_WIN_CONDITION', winCondition });
  }, [logger]);

  // ヒント関連
  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
    highlightedCells: gameState.selectedPiece ? Array.from(gameState.validMoves.keys()).map(key => {
      const [row, col] = key.split(',').map(Number);
      const isCapture = (gameState.validMoves.get(key)?.captures.length ?? 0) > 0;
      const color = isCapture ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'; // Red for capture, Green for move
      return { row, col, color };
    }) : [],
    selectedCell: gameState.selectedPiece ? 
      { row: gameState.selectedPiece.r, col: gameState.selectedPiece.c } : null
  }), [gameState.hintsEnabled, gameState.validMoves, gameState.selectedPiece]);

  const setHints = useCallback((enabled: boolean) => {
    logger.log('SET_HINTS_CALLED', { enabled });
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [logger]);

  // アクセサーメソッド
  const getValidMoves = useCallback(() => gameState.validMoves, [gameState.validMoves]);
  const getCurrentPlayer = useCallback(() => gameState.currentPlayer, [gameState.currentPlayer]);
  const getCapturedPieces = useCallback(() => gameState.capturedPieces, [gameState.capturedPieces]);
  const getWinCondition = useCallback(() => gameState.winCondition, [gameState.winCondition]);
  const getSelectedPiece = useCallback(() => gameState.selectedPiece, [gameState.selectedPiece]);
  const getPotentialCaptures = useCallback(() => gameState.potentialCaptures, [gameState.potentialCaptures]);

  const isGameStarted = useCallback(() => {
    const initialState = createInitialState();
    return JSON.stringify(initialState.board) !== JSON.stringify(gameState.board) ||
           gameState.capturedPieces.PLAYER1 > 0 ||
           gameState.capturedPieces.PLAYER2 > 0;
  }, [gameState.board, gameState.capturedPieces]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    return {
      title: '捕獲数',
      items: [
        { label: '「歩」', value: gameState.capturedPieces.PLAYER2 },
        { label: '「と」', value: gameState.capturedPieces.PLAYER1 }
      ]
    };
  }, [gameState.capturedPieces]);

  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    setWinCondition,
    getValidMoves,
    getCurrentPlayer,
    getCapturedPieces,
    getWinCondition,
    getSelectedPiece,
    getPotentialCaptures,
    isGameStarted,
    getScoreInfo,
    // HintableGameController
    hintState,
    setHints,
    isTurnOnly: useMemo(() => {
      return (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner;
    }, [gameState.status, gameState.winner]),
    displayInfo: useMemo(() => {
      if (gameState.winner) {
        if (gameState.winner === 'PLAYER1') {
          return { statusText: '勝者: 「歩」' };
        } else if (gameState.winner === 'PLAYER2') {
          return { statusText: '勝者: 「と」' };
        }
        return { statusText: 'ゲーム終了' }; // その他の勝者の場合
      } else if (gameState.gameStatus === 'GAME_OVER') {
        return { statusText: 'ゲーム終了' };
      } else if (gameState.gameStatus === 'PLAYING' && gameState.currentPlayer) {
        return { statusText: `「${gameState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」の番` };
      } else if (gameState.status === 'ended') {
        return { statusText: 'ゲーム終了' };
      } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
        return { statusText: `「${gameState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」の番` };
      } else {
        return { statusText: 'ゲーム開始' };
      }
    }, [gameState]),
  };
}