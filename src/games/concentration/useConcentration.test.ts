import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConcentration } from './useConcentration';

// useGameStateLoggerをモック化
vi.mock('@/core/hooks/useGameStateLogger', () => ({
  useGameStateLogger: () => ({
    log: vi.fn(),
  }),
}));

describe('useConcentration', () => {
  describe('初期化', () => {
    it('正しく初期化される', () => {
      const { result } = renderHook(() => useConcentration());

      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.gameState.difficulty).toBeNull();
      expect(result.current.gameState.board.length).toBe(0);
      expect(result.current.gameState.scores).toEqual({ player1: 0, player2: 0 });
    });

    it('setDifficulty でゲームが開始される', () => {
      const { result } = renderHook(() => useConcentration());

      act(() => {
        result.current.setDifficulty('easy');
      });

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.difficulty).toBe('easy');
      expect(result.current.gameState.board.length).toBe(20);
    });

    it('指定した難易度で初期化される', () => {
      const { result } = renderHook(() => useConcentration('hard'));

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.difficulty).toBe('hard');
      expect(result.current.gameState.board.length).toBe(54);
    });
  });

  describe('カードクリック', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('1枚目のカードを正しくめくる', () => {
      const { result } = renderHook(() => useConcentration('easy'));

      act(() => {
        result.current.handleCardClick(0);
      });

      expect(result.current.gameState.board[0].isFlipped).toBe(true);
      expect(result.current.gameState.flippedIndices).toEqual([0]);
    });

    it('2枚目のカードをめくると評価状態になる（不一致）', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      const board = result.current.gameState.board;
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      )!;

      act(() => {
        result.current.handleCardClick(0);
      });
      act(() => {
        result.current.handleCardClick(secondCardIndex);
      });

      expect(result.current.gameState.flippedIndices.length).toBe(2);
      expect(result.current.displayInfo.statusText).toBe('...'); // 評価中
    });

    it('評価中はカードクリックが無視される', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      const board = result.current.gameState.board;
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      )!;

      act(() => {
        result.current.handleCardClick(0);
      });
      act(() => {
        result.current.handleCardClick(secondCardIndex);
      });

      expect(result.current.displayInfo.statusText).toBe('...'); // 評価中
      const flippedCount = result.current.gameState.flippedIndices.length;

      act(() => {
        result.current.handleCardClick(2);
      });
      expect(result.current.gameState.flippedIndices.length).toBe(flippedCount);
    });

    it('カードがマッチしたとき、newlyMatchedIndicesが更新され、その後クリアされる', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      const board = result.current.gameState.board;
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(
        (card, index) => card.matchId === firstCard.matchId && index !== 0
      )!;

      act(() => {
        result.current.handleCardClick(0);
      });
      act(() => {
        result.current.handleCardClick(secondCardIndex);
      });

      expect(result.current.gameState.newlyMatchedIndices).toEqual([
        0,
        secondCardIndex,
      ]);
      expect(result.current.gameState.scores.player1).toBe(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.gameState.newlyMatchedIndices).toEqual([]);
    });
  });

  describe('ゲームリセット', () => {
    it('ゲームを正しくリセットする', () => {
      const { result } = renderHook(() => useConcentration());

      act(() => {
        result.current.setDifficulty('normal');
      });
      act(() => {
        result.current.handleCardClick(0);
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.difficulty).toBe('normal');
      expect(result.current.gameState.scores).toEqual({ player1: 0, player2: 0 });
      expect(result.current.gameState.flippedIndices).toEqual([]);
      expect(result.current.gameState.revealedIndices).toEqual([]);
    });

    it('難易度を指定してリセットできる', () => {
      const { result } = renderHook(() => useConcentration('easy'));

      act(() => {
        result.current.resetGame('hard');
      });

      expect(result.current.gameState.difficulty).toBe('hard');
      expect(result.current.gameState.board.length).toBe(54);
    });
  });

  describe('難易度設定', () => {
    it('難易度を変更できる', () => {
      const { result } = renderHook(() => useConcentration('easy'));

      act(() => {
        result.current.setDifficulty('normal');
      });

      expect(result.current.gameState.difficulty).toBe('normal');
      expect(result.current.gameState.board.length).toBe(40);
    });
  });

  describe('「おしえて！」機能', () => {
    it('ON/OFFを切り替えできる', () => {
      const { result } = renderHook(() => useConcentration('easy'));

      expect(result.current.hintState.enabled).toBe(false);

      act(() => {
        result.current.setHints(true);
      });

      expect(result.current.hintState.enabled).toBe(true);
    });
  });

  describe('ゲーム状態チェック', () => {
    it('ゲーム開始状態を正しく判定する', () => {
      const { result } = renderHook(() => useConcentration());

      expect(result.current.gameState.status).toBe('waiting');

      act(() => {
        result.current.setDifficulty('easy');
      });

      expect(result.current.gameState.status).toBe('playing');
    });

    it('評価状態を正しく判定する', () => {
      const { result } = renderHook(() => useConcentration('easy'));

      expect(result.current.displayInfo.statusText).not.toBe('...');

      const board = result.current.gameState.board;
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      )!;

      act(() => {
        result.current.handleCardClick(0);
        result.current.handleCardClick(secondCardIndex);
      });

      expect(result.current.displayInfo.statusText).toBe('...');
    });
  });

  describe('Controller インターフェース', () => {
    it('BaseGameController のインターフェースに準拠している', () => {
      const { result } = renderHook(() => useConcentration());

      expect(result.current.gameState).toBeDefined();
      expect(typeof result.current.resetGame).toBe('function');
    });

    it('HintableGameController のインターフェースに準拠している', () => {
      const { result } = renderHook(() => useConcentration());

      expect(result.current.hintState).toBeDefined();
      expect(typeof result.current.setHints).toBe('function');
      expect(result.current.hintState.enabled).toBeDefined();
    });
  });
});