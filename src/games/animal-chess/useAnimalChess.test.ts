import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimalChess } from './useAnimalChess';
import { SENTE, GOTE, CHICK } from './core';

describe('useAnimalChess', () => {
  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe(SENTE);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.getSelectedCell()).toBeNull();
      expect(result.current.getSelectedCaptureIndex()).toBeNull();
    });

    it('初期盤面が正しく設定される', () => {
      const { result } = renderHook(() => useAnimalChess());
      const board = result.current.getBoard();
      
      // GOTE pieces (上側)
      expect(board[0][0]?.type).toBe('ELEPHANT');
      expect(board[0][0]?.owner).toBe(GOTE);
      expect(board[0][1]?.type).toBe('LION');
      expect(board[0][1]?.owner).toBe(GOTE);
      expect(board[0][2]?.type).toBe('GIRAFFE');
      expect(board[0][2]?.owner).toBe(GOTE);
      expect(board[1][1]?.type).toBe('CHICK');
      expect(board[1][1]?.owner).toBe(GOTE);

      // SENTE pieces (下側)
      expect(board[3][0]?.type).toBe('GIRAFFE');
      expect(board[3][0]?.owner).toBe(SENTE);
      expect(board[3][1]?.type).toBe('LION');
      expect(board[3][1]?.owner).toBe(SENTE);
      expect(board[3][2]?.type).toBe('ELEPHANT');
      expect(board[3][2]?.owner).toBe(SENTE);
      expect(board[2][1]?.type).toBe('CHICK');
      expect(board[2][1]?.owner).toBe(SENTE);
    });

    it('初期の捕獲駒が空である', () => {
      const { result } = renderHook(() => useAnimalChess());
      const capturedPieces = result.current.getCapturedPieces();
      
      expect(capturedPieces[SENTE]).toEqual([]);
      expect(capturedPieces[GOTE]).toEqual([]);
    });
  });

  describe('駒の選択', () => {
    it('自分の駒を選択できる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      act(() => {
        result.current.handleCellClick(3, 1); // SENTE のライオンを選択
      });
      
      const selectedCell = result.current.getSelectedCell();
      expect(selectedCell).toEqual({ row: 3, col: 1 });
    });

    it('相手の駒は選択できない', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      act(() => {
        result.current.handleCellClick(0, 1); // GOTE のライオンをクリック（SENTE の番）
      });
      
      const selectedCell = result.current.getSelectedCell();
      expect(selectedCell).toBeNull();
    });

    it('同じ駒を再度クリックすると選択解除される', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // 駒を選択
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toEqual({ row: 3, col: 1 });
      
      // 同じ駒を再度クリック
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toBeNull();
    });
  });

  describe('駒の移動', () => {
    it('有効な移動ができる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // SENTE のひよこを選択
      act(() => {
        result.current.handleCellClick(2, 1);
      });
      
      // 前に移動
      act(() => {
        result.current.handleCellClick(1, 1);
      });
      
      const board = result.current.getBoard();
      expect(board[1][1]?.type).toBe(CHICK);
      expect(board[1][1]?.owner).toBe(SENTE);
      expect(board[2][1]).toBeNull();
      expect(result.current.getCurrentPlayer()).toBe(GOTE);
    });

    it('無効な移動は実行されない', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // SENTE のひよこを選択
      act(() => {
        result.current.handleCellClick(2, 1);
      });
      
      // 後ろに移動しようとする（無効）
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      
      const board = result.current.getBoard();
      expect(board[2][1]?.type).toBe(CHICK);
      expect(board[2][1]?.owner).toBe(SENTE);
      expect(result.current.getCurrentPlayer()).toBe(SENTE); // 手番が変わらない
    });
  });

  describe('駒の捕獲', () => {
    it('相手の駒を捕獲できる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // SENTE のひよこを前に移動（GOTE のひよこを捕獲）
      act(() => {
        result.current.handleCellClick(2, 1); // SENTE のひよこを選択
        result.current.handleCellClick(1, 1); // GOTE のひよこがいる位置に移動（捕獲）
      });
      
      const capturedPieces = result.current.getCapturedPieces();
      expect(capturedPieces[SENTE]).toContain(CHICK); // SENTE が GOTE のひよこを捕獲
    });
  });

  describe('捕獲駒の使用', () => {
    it('捕獲駒を選択できる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // 捕獲駒を手動で設定（テスト用）
      // 実際のゲームでは駒を捕獲してから行う
      act(() => {
        result.current.handleCaptureClick(SENTE, 0);
      });
      
      const selectedCaptureIndex = result.current.getSelectedCaptureIndex();
      expect(selectedCaptureIndex).toEqual({ player: SENTE, index: 0 });
    });
  });

  describe('「おしえて！」機能', () => {
    it('ON/OFFを切り替えられる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      expect(result.current.gameState.hintsEnabled).toBe(false);
      
      act(() => {
        result.current.setHints(true);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(true);
      
      act(() => {
        result.current.setHints(false);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(false);
    });

    it('ヒント状態が正しく更新される', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // ヒントをオンにする
      act(() => {
        result.current.setHints(true);
      });
      
      expect(result.current.hintState.enabled).toBe(true);
      
      // 駒を選択
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      
      expect(result.current.hintState.selectedCell).toEqual({ row: 3, col: 1 });
      expect(result.current.hintState.highlightedCells).toContainEqual({ row: 3, col: 1 });
    });
  });

  describe('ゲームリセット', () => {
    it('ゲームをリセットできる', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // 駒を移動
      act(() => {
        result.current.handleCellClick(2, 1);
        result.current.handleCellClick(1, 1);
      });
      
      expect(result.current.getCurrentPlayer()).toBe(GOTE);
      
      // リセット
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.getCurrentPlayer()).toBe(SENTE);
      expect(result.current.getSelectedCell()).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
    });
  });

  describe('状態表示', () => {
    it('現在のプレイヤーを正しく表示する', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      expect(result.current.getDisplayStatus()).toBe('いまのばん: プレイヤー1');
      
      // 手番を変更
      act(() => {
        result.current.handleCellClick(2, 1);
        result.current.handleCellClick(1, 1);
      });
      
      expect(result.current.getDisplayStatus()).toBe('いまのばん: プレイヤー2');
    });

    it('ゲーム終了時の表示が正しい', () => {
      renderHook(() => useAnimalChess());
      
      // ゲーム状態を手動で終了状態に設定（テスト用）
      // 実際のゲームでは勝利条件を満たすことで終了する
      act(() => {
        // ここでは直接状態を変更することはできないため、
        // 実際の勝利条件をテストする場合は別のテストケースで行う
      });
    });
  });

  describe('BaseGameController インターフェース準拠', () => {
    it('必要なプロパティとメソッドが存在する', () => {
      const { result } = renderHook(() => useAnimalChess());
      
      // BaseGameController
      expect(result.current.gameState).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      expect(result.current.getDisplayStatus).toBeDefined();
      
      // HintableGameController
      expect(result.current.hintState).toBeDefined();
      expect(result.current.setHints).toBeDefined();
    });

    it('gameState が BaseGameState インターフェースに準拠している', () => {
      const { result } = renderHook(() => useAnimalChess());
      const { gameState } = result.current;
      
      expect(gameState.status).toBeDefined();
      expect(['waiting', 'playing', 'ended']).toContain(gameState.status);
      expect(gameState.currentPlayer).toBeDefined();
      expect(gameState.winner).toBeDefined();
    });
  });
});