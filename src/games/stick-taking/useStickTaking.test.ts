import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DialogProvider } from '@/app/components/ui/DialogProvider';
import { useStickTaking } from './useStickTaking';

describe('useStickTaking', () => {
  const wrapper = DialogProvider;

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useStickTaking(), { wrapper });
      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.difficulty).toBeNull();
    });
  });

  describe('ゲーム開始', () => {
    it('かんたんモードでゲームを開始できる', () => {
      const { result } = renderHook(() => useStickTaking(), { wrapper });
      act(() => {
        result.current.startGame('easy');
      });
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.difficulty).toBe('easy');
      expect(result.current.gameState.rows.length).toBe(3);
    });
  });

  describe('ゲームリセット', () => {
    it('resetGameでゲームが初期状態に戻る', () => {
      const { result } = renderHook(() => useStickTaking(), { wrapper });
      act(() => {
        result.current.startGame('normal');
      });
      act(() => {
        result.current.selectStick(0, 0);
      });
      expect(result.current.gameState.selectedSticks.length).toBe(1);
      act(() => {
        result.current.resetGame();
      });
      expect(result.current.gameState.status).toBe('waiting');
      expect(result.current.gameState.selectedSticks.length).toBe(0);
    });
  });

  describe('ゲームプレイ', () => {
    it('棒を選択し、取得できる', () => {
      const { result } = renderHook(() => useStickTaking(), { wrapper });
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
      const { result } = renderHook(() => useStickTaking(), { wrapper });
      act(() => {
        result.current.startGame('easy');
      });
      // Take all but one stick
      act(() => {
        result.current.selectStick(0, 0);
        result.current.takeSticks(); // P1 takes 1
      });
      act(() => {
        result.current.selectStick(1, 1);
        result.current.selectStick(1, 2);
        result.current.takeSticks(); // P2 takes 2
      });
      act(() => {
        result.current.selectStick(2, 3);
        result.current.selectStick(2, 4);
        result.current.takeSticks(); // P1 takes 2
      });
      // P2's turn, only one stick left at (2,5)
      act(() => {
        result.current.selectStick(2, 5);
        result.current.takeSticks(); // P2 takes the last stick
      });

      expect(result.current.gameState.winner).toBe('プレイヤー1');
      expect(result.current.gameState.status).toBe('ended');
    });
  });
});
