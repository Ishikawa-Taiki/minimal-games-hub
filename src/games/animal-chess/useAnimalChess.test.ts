import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DialogProvider } from '@/app/components/ui/DialogProvider';
import { useAnimalChess } from './useAnimalChess';
import { OKASHI_TEAM, OHANA_TEAM, CHICK, ELEPHANT } from './core';

describe('useAnimalChess', () => {
  const wrapper = DialogProvider;

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe(OKASHI_TEAM);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.getSelectedCell()).toBeNull();
      expect(result.current.getSelectedCaptureIndex()).toBeNull();
    });

    it('初期盤面が正しく設定される', () => {
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

    it('初期の捕獲駒が空である', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      const capturedPieces = result.current.getCapturedPieces();
      
      expect(capturedPieces[OKASHI_TEAM]).toEqual([]);
      expect(capturedPieces[OHANA_TEAM]).toEqual([]);
    });
  });

  describe('駒の選択', () => {
    it('自分の駒を選択できる', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(3, 1);
      });
      expect(result.current.getSelectedCell()).toEqual({ row: 3, col: 1 });
    });

    it('相手の駒は選択できない', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      act(() => {
        result.current.handleCellClick(0, 1);
      });
      expect(result.current.getSelectedCell()).toBeNull();
    });

    it('同じ駒を再度クリックすると選択解除される', () => {
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
    it('有効な移動ができる', () => {
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

    it('無効な移動は実行されない', () => {
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
    it('相手の駒を捕獲できる', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      // OKASHI_TEAM moves CHICK from (2,1) to (1,1)
      act(() => {
        result.current.handleCellClick(2, 1); // select
        result.current.handleCellClick(1, 1); // move
      });
      // OHANA_TEAM moves ELEPHANT from (0,0) to (1,1) to capture CHICK
      act(() => {
        result.current.handleCellClick(0, 0); // select
        result.current.handleCellClick(1, 1); // move and capture
      });

      const capturedPieces = result.current.getCapturedPieces();
      expect(capturedPieces[OHANA_TEAM]).toContain(CHICK);
    });
  });

  describe('捕獲駒の使用', () => {
    it('捕獲駒を選択できる', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      // Manually set up a state with a captured piece
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
    it('ON/OFFを切り替えられる', () => {
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

    it('ヒント状態が正しく更新される', () => {
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
    it('ゲームをリセットできる', () => {
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
    it('現在のプレイヤーを正しく表示する', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      expect(result.current.getDisplayStatus()).toBe('いまのばん: おかしチーム');
      act(() => {
        result.current.handleCellClick(2, 1);
        result.current.handleCellClick(1, 1);
      });
      expect(result.current.getDisplayStatus()).toBe('いまのばん: おはなチーム');
    });
  });

  describe('BaseGameController インターフェース準拠', () => {
    it('必要なプロパティとメソッドが存在する', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      expect(result.current.gameState).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      expect(result.current.getDisplayStatus).toBeDefined();
      expect(result.current.hintState).toBeDefined();
      expect(result.current.setHints).toBeDefined();
    });

    it('gameState が BaseGameState インターフェースに準拠している', () => {
      const { result } = renderHook(() => useAnimalChess(), { wrapper });
      const { gameState } = result.current;
      expect(gameState.status).toBeDefined();
      expect(['waiting', 'playing', 'ended']).toContain(gameState.status);
      expect(gameState.currentPlayer).toBeDefined();
      expect(gameState.winner).toBeDefined();
    });
  });
});