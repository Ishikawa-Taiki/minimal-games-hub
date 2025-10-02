import { useReducer, useCallback, useMemo } from 'react';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState } from '@/core/types/game';
import { GameState, createInitialState, handleCellClick as handleCellClickCore, Player, WinCondition, setWinCondition, Move, Board } from './core';
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
  lastMove: GameState['lastMove'];
  justCapturedPieces: GameState['justCapturedPieces'];
  // ヒント関連
  hintsEnabled: boolean;
}

type HasamiShogiAction =
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'ANIMATION_END' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean }
  | { type: 'SET_WIN_CONDITION'; winCondition: WinCondition }
  | { type: 'RESET_WITH_BOARD'; board: Board };

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
      const newCoreState = handleCellClickCore(state, action.row, action.col);
      return {
        ...state,
        ...newCoreState,
        status: newCoreState.gameStatus === 'GAME_OVER' ? 'ended' : 'playing',
        winner: newCoreState.winner,
      };
    }
    
    case 'RESET_GAME':
      return createInitialHasamiShogiState();

    case 'ANIMATION_END':
      return {
        ...state,
        lastMove: null,
        justCapturedPieces: [],
      };
    
    case 'SET_HINTS_ENABLED':
      return {
        ...state,
        hintsEnabled: action.enabled,
      };
    
    case 'SET_WIN_CONDITION': {
      const newCoreState = setWinCondition(state, action.winCondition);
      return {
        ...state,
        ...newCoreState,
        status: 'playing',
        winner: newCoreState.winner,
      };
    }

    case 'RESET_WITH_BOARD': {
      const coreState = createInitialState();
      return {
        ...state,
        ...coreState,
        board: action.board,
        status: 'playing',
        winner: null,
        selectedPiece: null,
        validMoves: new Map(),
        potentialCaptures: [],
        lastMove: null,
        justCapturedPieces: [],
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
    onAnimationEnd: () => void;
    setWinCondition: (winCondition: WinCondition) => void;
    // 状態アクセサー
    getValidMoves: () => Map<string, Move>;
    getCurrentPlayer: () => Player;
    getCapturedPieces: () => { PLAYER1: number; PLAYER2: number };
    getWinCondition: () => WinCondition;
    getSelectedPiece: () => { r: number; c: number } | null;
    getPotentialCaptures: () => [number, number][];
    isGameStarted: () => boolean;
    // Test helpers
    getInitialBoard: () => Board;
    resetGameWithBoard: (board: Board) => void;
  };

export function useHasamiShogi(): HasamiShogiController {
  const [gameState, dispatch] = useReducer(hasamiShogiReducer, createInitialHasamiShogiState());
  
  const logger = useGameStateLogger('useHasamiShogi', gameState, {
    hintsEnabled: gameState.hintsEnabled,
    validMovesCount: gameState.validMoves.size,
    capturedPieces: gameState.capturedPieces,
    winCondition: gameState.winCondition,
    lastMove: gameState.lastMove,
    justCapturedPieces: gameState.justCapturedPieces,
  });

  const resetGame = useCallback(() => {
    logger.log('RESET_GAME_CALLED', {});
    dispatch({ type: 'RESET_GAME' });
  }, [logger]);

  const makeMove = useCallback((row: number, col: number) => {
    logger.log('MAKE_MOVE_CALLED', { row, col });
    dispatch({ type: 'MAKE_MOVE', row, col });
  }, [logger]);

  const onAnimationEnd = useCallback(() => {
    logger.log('ANIMATION_END_CALLED', {});
    dispatch({ type: 'ANIMATION_END' });
  }, [logger]);

  const setWinCondition = useCallback((winCondition: WinCondition) => {
    logger.log('SET_WIN_CONDITION_CALLED', { winCondition });
    dispatch({ type: 'SET_WIN_CONDITION', winCondition });
  }, [logger]);

  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
    highlightedCells: gameState.selectedPiece ? Array.from(gameState.validMoves.keys()).map(key => {
      const [row, col] = key.split(',').map(Number);
      const moveData = gameState.validMoves.get(key);
      const isUnsafe = moveData?.isUnsafe ?? false;
      const color = isUnsafe ? '#feb2b2' : '#9ae6b4';
      return { row, col, color };
    }) : [],
    selectedCell: gameState.selectedPiece ? { row: gameState.selectedPiece.r, col: gameState.selectedPiece.c } : null
  }), [gameState.hintsEnabled, gameState.validMoves, gameState.selectedPiece]);

  const setHints = useCallback((enabled: boolean) => {
    logger.log('SET_HINTS_CALLED', { enabled });
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [logger]);

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

  // E2Eテスト用のヘルパー
  const getInitialBoard = useCallback(() => {
    return createInitialState().board;
  }, []);

  const resetGameWithBoard = useCallback((board: Board) => {
    logger.log('RESET_GAME_WITH_BOARD_CALLED', { board });
    dispatch({ type: 'RESET_WITH_BOARD', board });
  }, [logger]);

  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    onAnimationEnd,
    setWinCondition,
    getValidMoves,
    getCurrentPlayer,
    getCapturedPieces,
    getWinCondition,
    getSelectedPiece,
    getPotentialCaptures,
    isGameStarted,
    hintState,
    setHints,
    getInitialBoard,
    resetGameWithBoard,
    isTurnOnly: useMemo(() => (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner, [gameState.status, gameState.winner]),
    displayInfo: useMemo(() => {
      if (gameState.winner) {
        return { statusText: `勝者: 「${gameState.winner === 'PLAYER1' ? '歩' : 'と'}」` };
      }
      if (gameState.status === 'ended') return { statusText: 'ゲーム終了' };
      if (gameState.currentPlayer) return { statusText: `「${gameState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」のばん` };
      return { statusText: 'ゲーム開始' };
    }, [gameState.winner, gameState.status, gameState.currentPlayer]),
  };
}