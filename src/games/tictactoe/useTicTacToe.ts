import { useCallback, useMemo } from 'react';
import { useGameEngine } from '@/core/hooks/useGameEngine';
import { HintableGameController, HintState } from '@/core/types/game';
import { 
  TicTacToeGameState, 
  TicTacToeAction, 
  ticTacToeReducer, 
  createInitialTicTacToeState 
} from './reducer';

/**
 * TicTacToeコントローラーの型定義
 * 既存のインターフェースとの互換性を保持
 */
export type TicTacToeController = HintableGameController<TicTacToeGameState, TicTacToeAction> & {
  makeMove: (row: number, col: number) => void;
};

/**
 * useGameEngineを使用したTicTacToeフック
 * 
 * 既存のuseTicTacToeと同じインターフェースを提供しつつ、
 * 内部的にはuseGameEngineによる「初期状態 + アクション列の合成」を使用。
 * 
 * @returns TicTacToeController - ゲーム操作用のコントローラー
 */
export function useTicTacToe(): TicTacToeController {
  // useGameEngineを使用して状態管理
  const {
    gameState,
    dispatch,
    reset,
  } = useGameEngine(ticTacToeReducer, createInitialTicTacToeState());

  // ゲームリセット機能
  const resetGame = useCallback(() => {
    reset();
  }, [reset]);

  // セルクリック（移動）機能
  const makeMove = useCallback((row: number, col: number) => {
    dispatch({ type: 'MAKE_MOVE', row, col });
  }, [dispatch]);

  // ヒント機能のON/OFF切り替え
  const setHints = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [dispatch]);

  // 状態表示メッセージの生成
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

  // ヒント状態の管理
  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintLevel > 0,
  }), [gameState.hintLevel]);

  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    setHints,
    getDisplayStatus,
    hintState,
  };
}
