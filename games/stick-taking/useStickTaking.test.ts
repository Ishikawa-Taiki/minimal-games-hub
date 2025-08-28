import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStickTaking } from './useStickTaking';
import { Difficulty } from './core';

describe('useStickTaking', () => {
  describe('初期状態', () => {
    it('かんたんモードで初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.currentPlayer).toBe('プレイヤー1');
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.difficulty).toBe('easy');
      expect(result.current.gameState.rows.length).toBe(3);
    });
  });

  describe('ゲームリセット', () => {
    it('resetGameで初期状態に戻る', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('hard');
      });

      act(() => {
        result.current.selectStick(0, 0);
      });

      expect(result.current.gameState.selectedSticks.length).toBe(1);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.selectedSticks.length).toBe(0);
      expect(result.current.difficulty).toBe('hard');
    });
  });

  describe('ヒント機能', () => {
    it('toggleHintsでヒントが切り替わる', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      expect(result.current.hintState.level).toBe('off');

      act(() => {
        result.current.toggleHints();
      });

      expect(result.current.hintState.level).toBe('basic');
    });

    it('getScoreInfoが正しいヒント情報を返す', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      act(() => {
        result.current.toggleHints();
      });

      const scoreInfo = result.current.getScoreInfo();
      expect(scoreInfo?.title).toBe('ヒント');
      expect(scoreInfo?.items).toEqual([
        { label: 'のこりのぼう', value: '6本' },
        { label: 'かたまりの数', value: '3個' },
      ]);
    });
  });

  describe('ゲームプレイ', () => {
    it('棒を選択し、取得できる', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      // 1本選択
      act(() => {
        result.current.selectStick(0, 0);
      });
      expect(result.current.gameState.selectedSticks.length).toBe(1);

      // 取得
      act(() => {
        result.current.takeSticks();
      });
      expect(result.current.gameState.rows[0][0].isTaken).toBe(true);
      expect(result.current.gameState.currentPlayer).toBe('プレイヤー2');
    });

    it('最後の棒を取ると勝者が決まる', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      // Take all sticks
      for (let rowIndex = 0; rowIndex < result.current.gameState.rows.length; rowIndex++) {
        const row = result.current.gameState.rows[rowIndex];
        for (let stickIndex = 0; stickIndex < row.length; stickIndex++) {
          act(() => {
            result.current.selectStick(rowIndex, row[stickIndex].id);
            result.current.takeSticks();
          });
        }
      }

      expect(result.current.gameState.winner).not.toBeNull();
      expect(result.current.gameState.status).toBe('ended');
    });
  });

  describe('GameControllerインターフェース準拠', () => {
    it('BaseGameControllerの必須プロパティが存在する', () => {
        const { result } = renderHook(() => useStickTaking());
        act(() => {
            result.current.startGame('easy');
        });
        expect(result.current.gameState).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.resetGame).toBeDefined();
    });

    it('HintableGameControllerの必須プロパティが存在する', () => {
        const { result } = renderHook(() => useStickTaking());
        act(() => {
            result.current.startGame('easy');
        });
        expect(result.current.hintState).toBeDefined();
        expect(result.current.toggleHints).toBeDefined();
    });
  });
});
