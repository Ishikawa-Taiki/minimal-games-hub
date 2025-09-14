import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTicTacToe } from '../useTicTacToe';

describe('useTicTacToe (新実装)', () => {
  describe('初期状態', () => {
    it('正しい初期状態を返す', () => {
      const { result } = renderHook(() => useTicTacToe());

      expect(result.current.gameState.currentPlayer).toBe('O');
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.isDraw).toBe(false);
      expect(result.current.hintState.enabled).toBe(false);
    });

    it('必要なメソッドが全て提供される', () => {
      const { result } = renderHook(() => useTicTacToe());

      expect(typeof result.current.makeMove).toBe('function');
      expect(typeof result.current.resetGame).toBe('function');
      expect(typeof result.current.setHints).toBe('function');
      expect(typeof result.current.getDisplayStatus).toBe('function');
      expect(typeof result.current.dispatch).toBe('function');
    });
  });

  describe('makeMove機能', () => {
    it('有効な移動で状態が更新される', () => {
      const { result } = renderHook(() => useTicTacToe());

      act(() => {
        result.current.makeMove(0, 0);
      });

      expect(result.current.gameState.board[0][0]).toBe('O');
      expect(result.current.gameState.currentPlayer).toBe('X');
    });

    it('無効な移動では状態が変更されない', () => {
      const { result } = renderHook(() => useTicTacToe());

      act(() => {
        result.current.makeMove(0, 0);
      });

      const stateAfterFirstMove = result.current.gameState;

      act(() => {
        result.current.makeMove(0, 0); // 同じセルに再度移動を試行
      });

      expect(result.current.gameState).toEqual(stateAfterFirstMove);
    });

    it('勝利条件を正しく検出する', () => {
      const { result } = renderHook(() => useTicTacToe());

      act(() => {
        // O の勝利パターン (上段横一列)
        result.current.makeMove(0, 0); // O
        result.current.makeMove(1, 0); // X
        result.current.makeMove(0, 1); // O
        result.current.makeMove(1, 1); // X
        result.current.makeMove(0, 2); // O (勝利)
      });

      expect(result.current.gameState.winner).toBe('O');
      expect(result.current.gameState.status).toBe('ended');
    });
  });

  describe('resetGame機能', () => {
    it('ゲームを初期状態にリセットする', () => {
      const { result } = renderHook(() => useTicTacToe());

      // いくつかの移動を実行
      act(() => {
        result.current.makeMove(0, 0);
        result.current.makeMove(1, 1);
        result.current.setHints(true);
      });

      // リセット
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.currentPlayer).toBe('O');
      expect(result.current.gameState.board[0][0]).toBeNull();
      expect(result.current.gameState.board[1][1]).toBeNull();
      expect(result.current.hintState.enabled).toBe(false);
    });
  });

  describe('setHints機能', () => {
    it('ヒント機能を有効/無効にできる', () => {
      const { result } = renderHook(() => useTicTacToe());

      // ヒントを有効にする
      act(() => {
        result.current.setHints(true);
      });

      expect(result.current.hintState.enabled).toBe(true);
      expect(result.current.gameState.hintLevel).toBe(1);

      // ヒントを無効にする
      act(() => {
        result.current.setHints(false);
      });

      expect(result.current.hintState.enabled).toBe(false);
      expect(result.current.gameState.hintLevel).toBe(0);
    });
  });

  describe('getDisplayStatus機能', () => {
    it('正しい状態メッセージを返す', () => {
      const { result } = renderHook(() => useTicTacToe());

      // 初期状態
      expect(result.current.getDisplayStatus()).toBe('○のばん');

      // 移動後
      act(() => {
        result.current.makeMove(0, 0);
      });

      expect(result.current.getDisplayStatus()).toBe('×のばん');

      // 勝利状態
      act(() => {
        result.current.makeMove(1, 0); // X
        result.current.makeMove(0, 1); // O
        result.current.makeMove(1, 1); // X
        result.current.makeMove(0, 2); // O (勝利)
      });

      expect(result.current.getDisplayStatus()).toBe('○のかち！');
    });

    it('引き分け状態を正しく表示する', () => {
      const { result } = renderHook(() => useTicTacToe());

      act(() => {
        // 引き分けパターンを作成
        const moves = [
          [0, 0], // O
          [0, 1], // X
          [0, 2], // O
          [1, 0], // X
          [1, 2], // O
          [1, 1], // X
          [2, 0], // O
          [2, 2], // X
          [2, 1], // O
        ];

        moves.forEach(([row, col]) => {
          result.current.makeMove(row, col);
        });
      });

      expect(result.current.getDisplayStatus()).toBe('ひきわけ！');
    });
  });

  describe('useGameEngineとの統合', () => {
    it('dispatchメソッドが提供される', () => {
      const { result } = renderHook(() => useTicTacToe());

      expect(typeof result.current.dispatch).toBe('function');

      // dispatchを直接使用してアクションを実行
      act(() => {
        result.current.dispatch({ type: 'MAKE_MOVE', row: 1, col: 1 });
      });

      expect(result.current.gameState.board[1][1]).toBe('O');
    });

    it('関数の参照安定性が保たれる', () => {
      const { result, rerender } = renderHook(() => useTicTacToe());

      const firstMakeMove = result.current.makeMove;
      const firstResetGame = result.current.resetGame;
      const firstSetHints = result.current.setHints;

      rerender();

      expect(result.current.makeMove).toBe(firstMakeMove);
      expect(result.current.resetGame).toBe(firstResetGame);
      expect(result.current.setHints).toBe(firstSetHints);
    });
  });

  describe('複雑なゲームシーケンス', () => {
    it('複数の操作を組み合わせて正常に動作する', () => {
      const { result } = renderHook(() => useTicTacToe());

      act(() => {
        // ヒントを有効にする
        result.current.setHints(true);
        
        // ゲームを進行
        result.current.makeMove(1, 1); // O
        result.current.makeMove(0, 0); // X
        result.current.makeMove(0, 1); // O
        result.current.makeMove(2, 1); // X
        
        // ゲームをリセット
        result.current.resetGame();
        
        // 新しいゲームを開始
        result.current.makeMove(2, 2); // O
      });

      expect(result.current.gameState.board[2][2]).toBe('O');
      expect(result.current.gameState.currentPlayer).toBe('X');
      expect(result.current.hintState.enabled).toBe(false); // リセット後は無効
      expect(result.current.gameState.board[1][1]).toBeNull(); // リセット後は空
    });
  });
});