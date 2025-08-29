import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStickTaking } from './useStickTaking';
import { Difficulty } from './core';

describe('useStickTaking', () => {
  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useStickTaking());

      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.difficulty).toBeNull();
      expect(result.current.gameState.rows.length).toBe(0);
    });
  });

  describe('ゲーム開始', () => {
    it('かんたんモードでゲームを開始できる', () => {
      const { result } = renderHook(() => useStickTaking());

      act(() => {
        result.current.startGame('easy');
      });

      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.difficulty).toBe('easy');
      expect(result.current.gameState.rows.length).toBe(3);
      expect(result.current.gameState.currentPlayer).toBe('プレイヤー1');
    });
  });

  describe('ゲームリセット', () => {
    it('resetGameでゲームが初期状態に戻る', () => {
      const { result } = renderHook(() => useStickTaking());

      act(() => {
        result.current.startGame('normal');
      });

      act(() => {
        result.current.selectStick(0, 0);
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.difficulty).toBeNull();
      expect(result.current.gameState.selectedSticks.length).toBe(0);
    });
  });

  describe('ゲームプレイ', () => {
    it('棒を選択し、取得できる', () => {
      const { result } = renderHook(() => useStickTaking());
      act(() => {
        result.current.startGame('easy');
      });

      act(() => {
        result.current.selectStick(0, 0);
      });
      expect(result.current.gameState.selectedSticks.length).toBe(1);

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

      // Simulate a full game
      act(() => {
        result.current.selectStick(0, 0);
        result.current.takeSticks();
      });
      act(() => {
        result.current.selectStick(1, 1);
        result.current.takeSticks();
      });
      act(() => {
        result.current.selectStick(1, 2);
        result.current.takeSticks();
      });
      act(() => {
        result.current.selectStick(2, 3);
        result.current.takeSticks();
      });
      act(() => {
        result.current.selectStick(2, 4);
        result.current.takeSticks();
      });
      act(() => {
        result.current.selectStick(2, 5);
        result.current.takeSticks();
      });

      expect(result.current.gameState.winner).not.toBeNull();
      expect(result.current.gameState.status).toBe('ended');
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
});
