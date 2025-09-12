import { useState, useCallback, useMemo } from 'react';
import { HintableGameController, BaseGameState, HintState } from '@/core/types/game';
import { GameState as CoreGameState, createInitialState, handleCellClick, Player, Board } from './core';

// 1. 統一された新しいゲーム状態の定義
export interface TicTacToeGameState extends BaseGameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  winningLines: number[][] | null;
  reachingLines: { player: Player; index: number }[];
  hintLevel: number; // 0: none, 1: enabled
}

// 2. アクションの型定義
export type TicTacToeAction =
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean };

// 3. 初期状態を生成する関数
function createInitialTicTacToeState(): TicTacToeGameState {
  const coreState = createInitialState();
  return {
    ...coreState,
    // BaseGameStateの必須フィールド
    status: 'playing',
    winner: null,
  };
}

// 4. Reducer関数
function ticTacToeReducer(state: TicTacToeGameState, action: TicTacToeAction): TicTacToeGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const coreState: CoreGameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        winner: state.winner,
        isDraw: state.isDraw,
        winningLines: state.winningLines,
        reachingLines: state.reachingLines,
        hintLevel: state.hintLevel,
      };
      const newCoreState = handleCellClick(coreState, action.row, action.col);
      if (!newCoreState) {
        return state;
      }
      return {
        ...state,
        ...newCoreState,
        status: newCoreState.winner || newCoreState.isDraw ? 'ended' : 'playing',
        winner: newCoreState.winner,
      };
    }
    case 'RESET_GAME':
      return createInitialTicTacToeState();
    case 'SET_HINTS_ENABLED':
      return { ...state, hintLevel: action.enabled ? 1 : 0 };
    default:
      return state;
  }
}

// 5. Controllerの型定義
export type TicTacToeController = HintableGameController<TicTacToeGameState, TicTacToeAction> & {
  makeMove: (row: number, col: number) => void;
};

// 6. useTicTacToe フックの実装
export function useTicTacToe(): TicTacToeController {
  const [history, setHistory] = useState<TicTacToeGameState[]>([createInitialTicTacToeState()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const gameState = history[historyIndex];

  const resetGame = useCallback(() => {
    const initialState = createInitialTicTacToeState();
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  const makeMove = useCallback((row: number, col: number) => {
    const newState = ticTacToeReducer(gameState, { type: 'MAKE_MOVE', row, col });
    // 状態が変化しない場合は何もしない
    if (newState === gameState) {
      return;
    }
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [gameState, history, historyIndex]);

  const setHints = useCallback((enabled: boolean) => {
    const action = { type: 'SET_HINTS_ENABLED', enabled } as const;
    setHistory(prevHistory => {
        const currentGameState = prevHistory[historyIndex];
        const newGameState = ticTacToeReducer(currentGameState, action);
        const newHistory = [...prevHistory];
        newHistory[historyIndex] = newGameState;
        return newHistory;
    });
  }, [historyIndex]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      const winnerMark = gameState.winner === 'O' ? '○' : '×';
      return `${winnerMark}のかち！`;
    }
    if (gameState.isDraw) {
      return 'ひきわけ！';
    }
    if (gameState.status === 'playing' && gameState.currentPlayer) {
      const playerMark = gameState.currentPlayer === 'O' ? '○' : '×';
      return `${playerMark}のばん`;
    }
    return 'ゲーム開始';
  }, [gameState]);

  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintLevel > 0,
  }), [gameState.hintLevel]);

  return {
    gameState,
    dispatch: () => {}, // dispatchは直接使用しない
    resetGame,
    makeMove,
    setHints,
    getDisplayStatus,
    hintState,
  };
}
