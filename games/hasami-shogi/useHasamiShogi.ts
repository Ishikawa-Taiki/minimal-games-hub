import { useReducer, useState, useCallback, useMemo } from 'react';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState, ScoreInfo } from '../../types/game';
import { GameState, createInitialState, handleCellClick as handleCellClickCore, Player, WinCondition, setWinCondition, Difficulty } from './core';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';

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
  difficulty: Difficulty;
  // ヒント関連
  hintLevel: 'off' | 'on';
}

type HasamiShogiAction = 
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_HINT' }
  | { type: 'SET_WIN_CONDITION'; winCondition: WinCondition }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty };

function createInitialHasamiShogiState(difficulty: Difficulty = 'normal'): HasamiShogiGameState {
  const coreState = createInitialState(difficulty);
  return {
    ...coreState,
    // BaseGameState required fields
    status: 'playing' as GameStatus,
    winner: null,
    // ヒント関連
    hintLevel: 'off',
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
        difficulty: state.difficulty,
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
      return createInitialHasamiShogiState(state.difficulty);
    
    case 'TOGGLE_HINT':
      return {
        ...state,
        hintLevel: state.hintLevel === 'off' ? 'on' : 'off',
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
        difficulty: state.difficulty,
      };
      
      const newCoreState = setWinCondition(coreState, action.winCondition);
      
      return {
        ...state,
        ...newCoreState,
        // BaseGameState必須フィールドを明示的に更新
        currentPlayer: newCoreState.currentPlayer,
        winner: newCoreState.winner,
      };
    }

    case 'SET_DIFFICULTY':
      return createInitialHasamiShogiState(action.difficulty);
    
    default:
      return state;
  }
}

export type HasamiShogiController = BaseGameController<HasamiShogiGameState, HasamiShogiAction> & 
  HintableGameController<HasamiShogiGameState, HasamiShogiAction> & {
    // はさみ将棋固有のメソッド
    makeMove: (row: number, col: number) => void;
    setWinCondition: (winCondition: WinCondition) => void;
    setDifficulty: (difficulty: Difficulty) => void;
    // 状態アクセサー
    getValidMoves: () => Map<string, any>;
    getCurrentPlayer: () => Player;
    getCapturedPieces: () => { PLAYER1: number; PLAYER2: number };
    getWinCondition: () => WinCondition;
    getSelectedPiece: () => { r: number; c: number } | null;
    getPotentialCaptures: () => [number, number][];
    getDifficulty: () => Difficulty;
    isGameStarted: () => boolean;
    // ヒント関連
    getHintLevel: () => 'off' | 'on';
    // 状態表示
    getDisplayStatus: () => string;
    // スコア情報
    getScoreInfo: () => ScoreInfo | null;
  };

export function useHasamiShogi(initialDifficulty: Difficulty = 'normal'): HasamiShogiController {
  const [gameState, dispatch] = useReducer(hasamiShogiReducer, createInitialHasamiShogiState(initialDifficulty));
  
  // ログ機能
  const logger = useGameStateLogger('useHasamiShogi', gameState, {
    hintLevel: gameState.hintLevel,
    validMovesCount: gameState.validMoves.size,
    capturedPieces: gameState.capturedPieces,
    winCondition: gameState.winCondition,
    difficulty: gameState.difficulty,
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
      hintLevel: gameState.hintLevel,
      hasSelectedPiece: !!gameState.selectedPiece
    });
    dispatch({ type: 'MAKE_MOVE', row, col });
  }, [gameState.currentPlayer, gameState.hintLevel, gameState.selectedPiece, logger]);

  const setWinCondition = useCallback((winCondition: WinCondition) => {
    logger.log('SET_WIN_CONDITION_CALLED', { winCondition });
    dispatch({ type: 'SET_WIN_CONDITION', winCondition });
  }, [logger]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    logger.log('SET_DIFFICULTY_CALLED', { difficulty });
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, [logger]);

  // ヒント関連
  const hintState: HintState = useMemo(() => ({
    level: gameState.hintLevel === 'off' ? 'off' : 'basic',
    highlightedCells: gameState.selectedPiece ? Array.from(gameState.validMoves.keys()).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    }) : [],
    selectedCell: gameState.selectedPiece ? 
      { row: gameState.selectedPiece.r, col: gameState.selectedPiece.c } : null
  }), [gameState.hintLevel, gameState.validMoves, gameState.selectedPiece]);

  const toggleHints = useCallback(() => {
    logger.log('TOGGLE_HINTS_CALLED', { currentLevel: gameState.hintLevel });
    dispatch({ type: 'TOGGLE_HINT' });
  }, [gameState.hintLevel, logger]);

  // アクセサーメソッド
  const getValidMoves = useCallback(() => gameState.validMoves, [gameState.validMoves]);
  const getCurrentPlayer = useCallback(() => gameState.currentPlayer, [gameState.currentPlayer]);
  const getCapturedPieces = useCallback(() => gameState.capturedPieces, [gameState.capturedPieces]);
  const getWinCondition = useCallback(() => gameState.winCondition, [gameState.winCondition]);
  const getSelectedPiece = useCallback(() => gameState.selectedPiece, [gameState.selectedPiece]);
  const getPotentialCaptures = useCallback(() => gameState.potentialCaptures, [gameState.potentialCaptures]);
  const getHintLevel = useCallback(() => gameState.hintLevel, [gameState.hintLevel]);
  const getDifficulty = useCallback(() => gameState.difficulty, [gameState.difficulty]);

  const isGameStarted = useCallback(() => {
    const initialState = createInitialState(gameState.difficulty);
    return JSON.stringify(initialState.board) !== JSON.stringify(gameState.board) ||
           gameState.capturedPieces.PLAYER1 > 0 ||
           gameState.capturedPieces.PLAYER2 > 0;
  }, [gameState.board, gameState.capturedPieces, gameState.difficulty]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      if (gameState.winner === 'PLAYER1') {
        return '勝者: 「歩」';
      } else if (gameState.winner === 'PLAYER2') {
        return '勝者: 「と」';
      }
      return 'ゲーム終了'; // その他の勝者の場合
    } else if (gameState.gameStatus === 'GAME_OVER') {
      return 'ゲーム終了';
    } else if (gameState.gameStatus === 'PLAYING' && gameState.currentPlayer) {
      return `「${gameState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」の番`;
    } else if (gameState.status === 'ended') {
      return 'ゲーム終了';
    } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      return `「${gameState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」の番`;
    } else {
      return 'ゲーム開始';
    }
  }, [gameState]);

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
    setDifficulty,
    getValidMoves,
    getCurrentPlayer,
    getCapturedPieces,
    getWinCondition,
    getSelectedPiece,
    getPotentialCaptures,
    getHintLevel,
    getDifficulty,
    isGameStarted,
    getDisplayStatus,
    getScoreInfo,
    // HintableGameController
    hintState,
    toggleHints,
  };
}