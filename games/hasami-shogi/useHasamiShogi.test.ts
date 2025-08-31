import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHasamiShogi } from './useHasamiShogi';
import { WinCondition } from './core';

describe('useHasamiShogi', () => {
  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe('PLAYER1');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.getWinCondition()).toBe('standard');
      expect(result.current.getCapturedPieces()).toEqual({ PLAYER1: 0, PLAYER2: 0 });
    });

    it('初期ボード状態が正しい', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      const board = result.current.gameState.board;
      
      // 上段（0行目）はPLAYER2の駒
      for (let c = 0; c < 9; c++) {
        expect(board[0][c]).toBe('PLAYER2');
      }
      
      // 下段（8行目）はPLAYER1の駒
      for (let c = 0; c < 9; c++) {
        expect(board[8][c]).toBe('PLAYER1');
      }
      
      // 中間の行は空
      for (let r = 1; r < 8; r++) {
        for (let c = 0; c < 9; c++) {
          expect(board[r][c]).toBeNull();
        }
      }
    });
  });

  describe('ゲームリセット', () => {
    it('resetGameで初期状態に戻る', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // ヒントをオンにして状態を変更
      act(() => {
        result.current.setHints(true);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(true);
      
      // リセット実行
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe('PLAYER1');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.getCapturedPieces()).toEqual({ PLAYER1: 0, PLAYER2: 0 });
    });
  });

  describe('「おしえて！」機能', () => {
    it('ON/OFFで切り替わる', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.hintState.enabled).toBe(false);
      
      act(() => {
        result.current.setHints(true);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(true);
      expect(result.current.hintState.enabled).toBe(true);
      
      act(() => {
        result.current.setHints(false);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.hintState.enabled).toBe(false);
    });

    it('駒を選択するとヒント情報が更新される', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // ヒントをオンにする
      act(() => {
        result.current.setHints(true);
      });
      
      // PLAYER1の駒を選択（8行目の任意の駒）
      act(() => {
        result.current.makeMove(8, 0);
      });
      
      const selectedPiece = result.current.getSelectedPiece();
      expect(selectedPiece).toEqual({ r: 8, c: 0 });
      
      // ヒント状態に選択されたセルが反映される
      expect(result.current.hintState.selectedCell).toEqual({ row: 8, col: 0 });
      
      // 有効な移動先がハイライトされる
      expect(result.current.hintState.highlightedCells).toBeDefined();
      expect(result.current.hintState.highlightedCells!.length).toBeGreaterThan(0);
    });
  });

  describe('勝利条件設定', () => {
    it('setWinConditionで勝利条件が変更される', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      expect(result.current.getWinCondition()).toBe('standard');
      
      act(() => {
        result.current.setWinCondition('five_captures');
      });
      
      expect(result.current.getWinCondition()).toBe('five_captures');
      
      act(() => {
        result.current.setWinCondition('total_capture');
      });
      
      expect(result.current.getWinCondition()).toBe('total_capture');
    });
  });

  describe('移動処理', () => {
    it('有効な移動が実行される', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // PLAYER1の駒を選択
      act(() => {
        result.current.makeMove(8, 0);
      });
      
      expect(result.current.getSelectedPiece()).toEqual({ r: 8, c: 0 });
      expect(result.current.gameState.currentPlayer).toBe('PLAYER1');
      
      // 有効な移動先に移動
      act(() => {
        result.current.makeMove(7, 0);
      });
      
      // 移動が実行され、手番が変わる
      expect(result.current.gameState.currentPlayer).toBe('PLAYER2');
      expect(result.current.getSelectedPiece()).toBeNull();
      
      // ボード状態が更新される
      expect(result.current.gameState.board[8][0]).toBeNull();
      expect(result.current.gameState.board[7][0]).toBe('PLAYER1');
    });

    it('無効な移動は実行されない', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      const initialPlayer = result.current.gameState.currentPlayer;
      
      // 空のセルをクリック（無効な操作）
      act(() => {
        result.current.makeMove(4, 4);
      });
      
      // 状態が変わらない
      expect(result.current.gameState.currentPlayer).toBe(initialPlayer);
      expect(result.current.getSelectedPiece()).toBeNull();
    });
  });

  describe('アクセサーメソッド', () => {
    it('各アクセサーメソッドが正しい値を返す', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      expect(result.current.getCurrentPlayer()).toBe('PLAYER1');
      expect(result.current.getCapturedPieces()).toEqual({ PLAYER1: 0, PLAYER2: 0 });
      expect(result.current.getWinCondition()).toBe('standard');
      expect(result.current.getSelectedPiece()).toBeNull();
      expect(result.current.getPotentialCaptures()).toEqual([]);
      expect(result.current.getValidMoves()).toBeInstanceOf(Map);
    });

    it('getDisplayStatusが正しい状態表示を返す', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // 初期状態
      expect(result.current.getDisplayStatus()).toBe('「歩」の番');
      
      // 移動後の状態変化をテスト
      act(() => {
        result.current.makeMove(8, 0); // 駒を選択
      });
      
      act(() => {
        result.current.makeMove(7, 0); // 移動実行
      });
      
      // 手番が変わったことを確認
      expect(result.current.getDisplayStatus()).toBe('「と」の番');
    });
  });

  describe('GameControllerインターフェース準拠', () => {
    it('BaseGameControllerの必須プロパティが存在する', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // BaseGameController必須プロパティ
      expect(result.current.gameState).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      
      // BaseGameStateの必須プロパティ
      expect(result.current.gameState.status).toBeDefined();
      expect(result.current.gameState.currentPlayer).toBeDefined();
      expect(result.current.gameState.winner).toBeDefined();
    });

    it('HintableGameControllerの必須プロパティが存在する', () => {
      const { result } = renderHook(() => useHasamiShogi());
      
      // HintableGameController必須プロパティ
      expect(result.current.hintState).toBeDefined();
      expect(result.current.setHints).toBeDefined();
      
      // HintStateの必須プロパティ
      expect(result.current.hintState.enabled).toBeDefined();
      expect(result.current.hintState.highlightedCells).toBeDefined();
      expect(result.current.hintState.selectedCell).toBeDefined();
    });
  });
});