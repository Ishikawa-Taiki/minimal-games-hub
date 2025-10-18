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
    it('デフォルト設定（easy）で正しく初期化される', () => {
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.gameState.currentPlayer).toBe('player1');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.getDifficulty()).toBe('easy');
      expect(result.current.getBoard().length).toBe(20); // easy: 20枚
      expect(result.current.getScores()).toEqual({ player1: 0, player2: 0 });
      expect(result.current.getFlippedIndices()).toEqual([]);
      expect(result.current.getRevealedIndices()).toEqual([]);
      expect(result.current.getHintedIndices()).toEqual([]);
      expect(result.current.getNewlyMatchedIndices()).toEqual([]);
      expect(result.current.isGameStarted()).toBe(false);
      expect(result.current.isEvaluating()).toBe(false);
      expect(result.current.isAnimating()).toBe(false);
    });

    it('指定した難易度で初期化される', () => {
      const { result } = renderHook(() => useConcentration('hard'));
      
      expect(result.current.getDifficulty()).toBe('hard');
      expect(result.current.getBoard().length).toBe(54); // hard: 54枚
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
      const { result } = renderHook(() => useConcentration());
      
      act(() => {
        result.current.handleCardClick(0);
      });
      
      expect(result.current.getBoard()[0].isFlipped).toBe(true);
      expect(result.current.getFlippedIndices()).toEqual([0]);
      expect(result.current.isAnimating()).toBe(true);

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.isAnimating()).toBe(false);
    });

    it('2枚目のカードをめくると評価状態になる', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      const board = result.current.getBoard();
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(card => card.matchId !== firstCard.matchId);

      act(() => { result.current.handleCardClick(0); });
      act(() => { vi.advanceTimersByTime(600); });
      act(() => { result.current.handleCardClick(secondCardIndex); });

      expect(result.current.getFlippedIndices().length).toBe(2);
      expect(result.current.isEvaluating()).toBe(true);
    });

    it('評価中はカードクリックが無視される', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      const board = result.current.getBoard();
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(card => card.matchId !== firstCard.matchId);

      act(() => { result.current.handleCardClick(0); });
      act(() => { vi.advanceTimersByTime(600); });
      act(() => { result.current.handleCardClick(secondCardIndex); });

      expect(result.current.isEvaluating()).toBe(true);
      const flippedCount = result.current.getFlippedIndices().length;

      act(() => { result.current.handleCardClick(2); });
      expect(result.current.getFlippedIndices().length).toBe(flippedCount);
    });

    it('アニメーション中はカードクリックが無視される', () => {
      const { result } = renderHook(() => useConcentration());

      act(() => { result.current.handleCardClick(0); });
      expect(result.current.isAnimating()).toBe(true);

      // アニメーション中に2枚目をクリック
      act(() => { result.current.handleCardClick(1); });

      // flippedIndicesは変わらない
      expect(result.current.getFlippedIndices()).toEqual([0]);

      // アニメーション終了後
      act(() => { vi.advanceTimersByTime(600); });
      expect(result.current.isAnimating()).toBe(false);

      // 再度2枚目をクリックすると成功する
      act(() => { result.current.handleCardClick(1); });
      expect(result.current.getFlippedIndices().length).toBe(2);
    });

    it('カードがマッチしたとき、newlyMatchedIndicesが更新され、その後クリアされる', () => {
        const { result } = renderHook(() => useConcentration('easy'));
        const board = result.current.getBoard();
        const firstCard = board[0];
        const secondCardIndex = board.findIndex((card, index) => card.matchId === firstCard.matchId && index !== 0);

        act(() => { result.current.handleCardClick(0); });
        act(() => { vi.advanceTimersByTime(600); });
        act(() => { result.current.handleCardClick(secondCardIndex); });

        expect(result.current.getNewlyMatchedIndices()).toEqual([0, secondCardIndex]);
        expect(result.current.isAnimating()).toBe(true);

        act(() => { vi.advanceTimersByTime(500); });
        expect(result.current.getNewlyMatchedIndices()).toEqual([]);
        expect(result.current.isAnimating()).toBe(false);
        expect(result.current.getFlippedIndices()).toEqual([]);
    });
  });

  describe('ゲームリセット', () => {
    it('ゲームを正しくリセットする', () => {
      const { result } = renderHook(() => useConcentration());
      
      // ゲームを進行させる
      act(() => {
        result.current.setDifficulty('normal');
        result.current.handleCardClick(0);
        result.current.handleCardClick(1);
      });
      
      // リセット
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.gameState.currentPlayer).toBe('player1');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.getScores()).toEqual({ player1: 0, player2: 0 });
      expect(result.current.getFlippedIndices()).toEqual([]);
      expect(result.current.getRevealedIndices()).toEqual([]);
      expect(result.current.isGameStarted()).toBe(false);
    });

    it('難易度を指定してリセットできる', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      
      act(() => {
        result.current.resetGame('hard');
      });
      
      expect(result.current.getDifficulty()).toBe('hard');
      expect(result.current.getBoard().length).toBe(54);
    });
  });

  describe('難易度設定', () => {
    it('難易度を変更できる', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      
      act(() => {
        result.current.setDifficulty('normal');
      });
      
      expect(result.current.getDifficulty()).toBe('normal');
      expect(result.current.getBoard().length).toBe(40); // normal: 40枚
    });
  });

  describe('「おしえて！」機能', () => {
    it('ON/OFFを切り替えできる', () => {
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.gameState.hintsEnabled).toBe(false);
      expect(result.current.hintState.enabled).toBe(false);
      
      act(() => {
        result.current.setHints(true);
      });
      
      expect(result.current.gameState.hintsEnabled).toBe(true);
      expect(result.current.hintState.enabled).toBe(true);
    });

    it('ヒントが有効な場合、ハイライト対象のセルが設定される', () => {
      const { result } = renderHook(() => useConcentration());
      
      // ヒントを有効にする
      act(() => {
        result.current.setHints(true);
      });
      
      // カードをいくつかめくってヒント状態を作る
      act(() => {
        result.current.handleCardClick(0);
        result.current.handleCardClick(1);
      });
      
      // ヒント状態にハイライト情報が含まれることを確認
      expect(result.current.hintState.highlightedCells).toBeDefined();
      expect(Array.isArray(result.current.hintState.highlightedCells)).toBe(true);
    });
  });

  describe('ゲーム状態チェック', () => {
    it('ゲーム開始状態を正しく判定する', () => {
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.isGameStarted()).toBe(false);
      
      act(() => {
        result.current.handleCardClick(0);
      });
      
      expect(result.current.isGameStarted()).toBe(true);
    });

    it('評価状態を正しく判定する', () => {
      const { result } = renderHook(() => useConcentration('easy'));
      
      expect(result.current.isEvaluating()).toBe(false);
      
      const board = result.current.getBoard();
      const firstCard = board[0];
      const secondCardIndex = board.findIndex(card => card.matchId !== firstCard.matchId);

      act(() => {
        result.current.handleCardClick(0);
        if (secondCardIndex !== -1) {
          result.current.handleCardClick(secondCardIndex);
        } else {
          result.current.handleCardClick(1);
        }
      });
      
      expect(result.current.isEvaluating()).toBe(true);
    });
  });

  describe('BaseGameController インターフェース', () => {
    it('BaseGameController の必須メソッドが実装されている', () => {
      const { result } = renderHook(() => useConcentration());
      
      // 必須プロパティの存在確認
      expect(result.current.gameState).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.resetGame).toBe('function');
    });
  });

  describe('HintableGameController インターフェース', () => {
    it('HintableGameController の必須メソッドが実装されている', () => {
      const { result } = renderHook(() => useConcentration());
      
      // 必須プロパティの存在確認
      expect(result.current.hintState).toBeDefined();
      expect(typeof result.current.setHints).toBe('function');
      
      // hintState の構造確認
      expect(result.current.hintState.enabled).toBeDefined();
      expect(result.current.hintState.highlightedCells).toBeDefined();
    });
  });
});