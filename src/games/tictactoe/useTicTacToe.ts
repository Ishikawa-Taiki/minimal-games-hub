import { useCallback, useMemo } from 'react';
import { useGameEngine } from '@/core/hooks/useGameEngine';
import { HintableGameController, HintState, GameManifest, HintDefinition } from '@/core/types/game';
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
export function useTicTacToe(manifest?: GameManifest): TicTacToeController {
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

  // ヒント状態の管理
  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintLevel > 0,
  }), [gameState.hintLevel]);

  const isTurnOnly = useMemo(() => {
    return (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner && !gameState.isDraw;
  }, [gameState.status, gameState.winner, gameState.isDraw]);

  const displayInfo = useMemo(() => {
    if (gameState.winner) {
      const winnerMark = gameState.winner === 'O' ? '○' : '×';
      return { statusText: `${winnerMark}のかち！` };
    }
    if (gameState.isDraw) {
      return { statusText: 'ひきわけ！' };
    }
    if (gameState.status === 'playing' && gameState.currentPlayer) {
      const playerMark = gameState.currentPlayer === 'O' ? '○' : '×';
      return { statusText: `${playerMark}のばん` };
    }
    return { statusText: 'ゲーム開始' };
  }, [gameState]);

  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    setHints,
    hintState,
    isTurnOnly,
    displayInfo,
    getCurrentHint: useCallback((): HintDefinition | null => {
      if (!manifest || !manifest.hints || manifest.hints.length === 0) {
        return null;
      }
      // ヒントが有効な場合
      if (gameState.hintLevel > 0) {
        // 複数の戦略的ヒントがあるが、代表としてリーチマスを返す
        return manifest.hints.find(h => h.id === 'reach-squares') || null;
      }
      // ヒントが無効な場合は何も表示しない
      return null;
    }, [gameState.hintLevel, manifest]),
  };
}
