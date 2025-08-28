import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConcentration } from './useConcentration';
import { Difficulty } from './core';

// useGameStateLoggerをモック化
vi.mock('../../hooks/useGameStateLogger', () => ({
  useGameStateLogger: () => ({
    log: vi.fn(),
  }),
}));

describe('useConcentration', () => {
  describe('初期化', () => {
    it('デフォルト設定（easy）で正しく初期化される', () => {
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe(1);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.getDifficulty()).toBe('easy');
      expect(result.current.getBoard().length).toBe(20); // easy: 20枚
      expect(result.current.getScores()).toEqual({ player1: 0, player2: 0 });
      expect(result.current.getFlippedIndices()).toEqual([]);
      expect(result.current.getRevealedIndices()).toEqual([]);
      expect(result.current.getHintedIndices()).toEqual([]);
      expect(result.current.isGameStarted()).toBe(false);
      expect(result.current.isEvaluating()).toBe(false);
    });

    it('指定した難易度で初期化される', () => {
      const { result } = renderHook(() => useConcentration('hard'));
      
      expect(result.current.getDifficulty()).toBe('hard');
      expect(result.current.getBoard().length).toBe(54); // hard: 54枚
    });
  });

  describe('カードクリック', () => {
    it('1枚目のカードを正しくめくる', () => {
      const { result } = renderHook(() => useConcentration());
      
      act(() => {
        result.current.handleCardClick(0);
      });
      
      expect(result.current.getBoard()[0].isFlipped).toBe(true);
      expect(result.current.getFlippedIndices()).toEqual([0]);
      expect(result.current.getRevealedIndices()).toEqual([0]);
      expect(result.current.isGameStarted()).toBe(true);
    });

    // TODO: 後ほど追加調整する
    // it('2枚目のカードをめくると評価状態になる', () => {
    //   const { result } = renderHook(() => useConcentration());
      
    //   act(() => {
    //     result.current.handleCardClick(0);
    //     result.current.handleCardClick(1);
    //   });
      
    //   expect(result.current.getFlippedIndices().length).toBe(2);
    //   expect(result.current.isEvaluating()).toBe(true);
    // });

    // TODO: 後ほど追加調整する
    // it('評価中はカードクリックが無視される', () => {
    //   const { result } = renderHook(() => useConcentration());
      
    //   // 2枚めくって評価状態にする
    //   act(() => {
    //     result.current.handleCardClick(0);
    //     result.current.handleCardClick(1);
    //   });
      
    //   const flippedIndicesBefore = result.current.getFlippedIndices();
      
    //   // 評価中に別のカードをクリック
    //   act(() => {
    //     result.current.handleCardClick(2);
    //   });
      
    //   // 状態が変わらないことを確認
    //   expect(result.current.getFlippedIndices()).toEqual(flippedIndicesBefore);
    // });

    it('すでにめくられたカードはクリックできない', () => {
      const { result } = renderHook(() => useConcentration());
      
      act(() => {
        result.current.handleCardClick(0);
      });
      
      const flippedIndicesBefore = result.current.getFlippedIndices();
      
      // 同じカードを再度クリック
      act(() => {
        result.current.handleCardClick(0);
      });
      
      // 状態が変わらないことを確認
      expect(result.current.getFlippedIndices()).toEqual(flippedIndicesBefore);
    });
  });

  describe('ゲームリセット', () => {
    it('ゲームを正しくリセットする', () => {
      const { result } = renderHook(() => useConcentration());
      
      // ゲームを進行させる
      act(() => {
        result.current.handleCardClick(0);
        result.current.handleCardClick(1);
      });
      
      // リセット
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe(1);
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

  describe('ヒント機能', () => {
    it('ヒントを切り替えできる', () => {
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.getHintLevel()).toBe('off');
      expect(result.current.getShowHints()).toBe(false);
      expect(result.current.hintState.level).toBe('off');
      
      act(() => {
        result.current.toggleHints();
      });
      
      expect(result.current.getHintLevel()).toBe('on');
      expect(result.current.getShowHints()).toBe(true);
      expect(result.current.hintState.level).toBe('basic');
    });

    it('ヒントが有効な場合、ハイライト対象のセルが設定される', () => {
      const { result } = renderHook(() => useConcentration());
      
      // ヒントを有効にする
      act(() => {
        result.current.toggleHints();
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

  describe('状態表示', () => {
    it('正しい状態メッセージを返す', () => {
      const { result } = renderHook(() => useConcentration());
      
      // 初期状態（神経衰弱では最初からプレイヤー1のターン）
      expect(result.current.getDisplayStatus()).toBe('プレイヤー1の番');
      
      // カードをめくった後もプレイヤー1のターン
      act(() => {
        result.current.handleCardClick(0);
      });
      expect(result.current.getDisplayStatus()).toBe('プレイヤー1の番');
    });
  });

  describe('スコア情報', () => {
    it('正しいスコア情報を返す', () => {
      const { result } = renderHook(() => useConcentration());
      
      const scoreInfo = result.current.getScoreInfo();
      expect(scoreInfo).not.toBeNull();
      expect(scoreInfo?.title).toBe('スコア');
      expect(scoreInfo?.items).toHaveLength(2);
      expect(scoreInfo?.items[0]).toEqual({ label: 'プレイヤー1', value: 0 });
      expect(scoreInfo?.items[1]).toEqual({ label: 'プレイヤー2', value: 0 });
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
      const { result } = renderHook(() => useConcentration());
      
      expect(result.current.isEvaluating()).toBe(false);
      
      act(() => {
        result.current.handleCardClick(0);
        result.current.handleCardClick(1);
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
      expect(typeof result.current.getDisplayStatus).toBe('function');
      expect(typeof result.current.getScoreInfo).toBe('function');
    });
  });

  describe('HintableGameController インターフェース', () => {
    it('HintableGameController の必須メソッドが実装されている', () => {
      const { result } = renderHook(() => useConcentration());
      
      // 必須プロパティの存在確認
      expect(result.current.hintState).toBeDefined();
      expect(typeof result.current.toggleHints).toBe('function');
      
      // hintState の構造確認
      expect(result.current.hintState.level).toBeDefined();
      expect(result.current.hintState.highlightedCells).toBeDefined();
    });
  });
});