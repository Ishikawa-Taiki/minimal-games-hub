import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DialogProvider } from '@/core/components/ui/DialogProvider';
import { useAnimalChess } from './useAnimalChess';
import { OKASHI_TEAM, OHANA_TEAM, CHICK, ELEPHANT } from './core';

describe('useAnimalChess フック', () => {
  const wrapper = DialogProvider;

  describe('初期状態', () => {
    it('初期状態が正しく設定されるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe(OKASHI_TEAM);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.getSelectedCell()).toBeNull();
      expect(result.current.getSelectedCaptureIndex()).toBeNull();
    });

    it('初期盤面が正しく設定されるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      const board = result.current.getBoard();
      
      expect(board[0][0]?.type).toBe('ELEPHANT');
      expect(board[0][0]?.owner).toBe(OHANA_TEAM);
      expect(board[0][1]?.type).toBe('LION');
      expect(board[0][1]?.owner).toBe(OHANA_TEAM);
      expect(board[0][2]?.type).toBe('GIRAFFE');
      expect(board[0][2]?.owner).toBe(OHANA_TEAM);
      expect(board[1][1]?.type).toBe('CHICK');
      expect(board[1][1]?.owner).toBe(OHANA_TEAM);

      expect(board[3][0]?.type).toBe('GIRAFFE');
      expect(board[3][0]?.owner).toBe(OKASHI_TEAM);
      expect(board[3][1]?.type).toBe('LION');
      expect(board[3][1]?.owner).toBe(OKASHI_TEAM);
      expect(board[3][2]?.type).toBe('ELEPHANT');
      expect(board[3][2]?.owner).toBe(OKASHI_TEAM);
      expect(board[2][1]?.type).toBe('CHICK');
      expect(board[2][1]?.owner).toBe(OKASHI_TEAM);
    });

    it('初期の持ち駒が空であるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      const capturedPieces = result.current.getCapturedPieces();
      
      expect(capturedPieces[OKASHI_TEAM]).toEqual([]);
      expect(capturedPieces[OHANA_TEAM]).toEqual([]);
    });
  });

  describe('駒の選択', () => {
    it('自分の駒を選択できるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toEqual({ row: 3, col: 1 });
    });

    it('相手の駒は選択できないべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(0, 1);
      });
      expect(result.current.getSelectedCell()).toBeNull();
    });

    it('同じ駒を再度クリックすると選択解除されるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toEqual({ row: 3, col: 1 });
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toBeNull();
    });
  });

  describe('駒の移動', () => {
    it('有効な移動を許可するべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(2, 1);
      });
      act(() => {
        result.current.handleCellClick(1, 1);
      });
      const board = result.current.getBoard();
      expect(board[1][1]?.type).toBe(CHICK);
      expect(board[1][1]?.owner).toBe(OKASHI_TEAM);
      expect(board[2][1]).toBeNull();
      expect(result.current.getCurrentPlayer()).toBe(OHANA_TEAM);
    });

    it('無効な移動は実行されないべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(2, 1);
      });
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      const board = result.current.getBoard();
      expect(board[2][1]?.type).toBe(CHICK);
      expect(board[2][1]?.owner).toBe(OKASHI_TEAM);
      expect(result.current.getCurrentPlayer()).toBe(OKASHI_TEAM);
    });
  });

  describe('駒の捕獲', () => {
    it('相手の駒を捕獲できるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      // おかしチームがひよこを(2,1)から(1,1)へ移動
      act(() => {
        result.current.handleCellClick(2, 1); // select
        result.current.handleCellClick(1, 1); // move
      });
      // おはなチームがぞうを(0,0)から(1,1)へ移動してひよこを捕獲
      act(() => {
        result.current.handleCellClick(0, 0); // select
        result.current.handleCellClick(1, 1); // move and capture
      });

      const capturedPieces = result.current.getCapturedPieces();
      expect(capturedPieces[OHANA_TEAM]).toContain(CHICK);
    });
  });

  describe('持ち駒の使用', () => {
    it('持ち駒を選択できるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      // 手動で持ち駒がある状態を作成
      act(() => {
        const initialGameState = result.current.gameState;
        const newGameState = {
          ...initialGameState,
          capturedPieces: {
            ...initialGameState.capturedPieces,
            [OKASHI_TEAM]: [ELEPHANT],
          },
        };
        result.current.dispatch({ type: 'SET_GAME_STATE_FOR_TEST', state: newGameState });
      });

      act(() => {
        result.current.handleCaptureClick(OKASHI_TEAM, 0);
      });
      const selectedCaptureIndex = result.current.getSelectedCaptureIndex();
      expect(selectedCaptureIndex).toEqual({ player: OKASHI_TEAM, index: 0 });
    });
  });

  describe('「おしえて！」機能', () => {
    it('ヒント機能のON/OFFを切り替えられるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
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

    it('ヒントの状態が正しく更新されるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.setHints(true);
      });
      expect(result.current.hintState.enabled).toBe(true);
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.hintState.selectedCell).toEqual({ row: 3, col: 1 });
      expect(result.current.hintState.highlightedCells.length).toBeGreaterThan(0);
    });
  });

  describe('ゲームリセット', () => {
    it('ゲームをリセットできるべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(2, 1);
        result.current.handleCellClick(1, 1);
      });
      expect(result.current.getCurrentPlayer()).toBe(OHANA_TEAM);
      act(() => {
        result.current.resetGame();
      });
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.getCurrentPlayer()).toBe(OKASHI_TEAM);
    });
  });

  describe('状態表示', () => {
    it('現在のプレイヤーを正しく表示するべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      expect(result.current.gameState.currentPlayer).toBe('OKASHI');
      act(() => {
        result.current.handleCellClick(2, 1);
        result.current.handleCellClick(1, 1);
      });
      expect(result.current.gameState.currentPlayer).toBe('OHANA');
    });
  });

  describe('BaseGameController インターフェース準拠', () => {
    it('必要なプロパティとメソッドが存在するべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      expect(result.current.gameState).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      expect(result.current.hintState).toBeDefined();
      expect(result.current.setHints).toBeDefined();
    });

    it('gameStateがBaseGameStateインターフェースに準拠しているべき', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      const { gameState } = result.current;
      expect(gameState.status).toBeDefined();
      expect(['waiting', 'playing', 'ended']).toContain(gameState.status);
      expect(gameState.currentPlayer).toBeDefined();
      expect(gameState.winner).toBeDefined();
    });
  });
});