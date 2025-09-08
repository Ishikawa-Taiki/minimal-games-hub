import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTicTacToe } from './useTicTacToe';

describe('useTicTacToe Hook', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useTicTacToe());

    expect(result.current.gameState.currentPlayer).toBe('O');
    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.winner).toBeNull();
    expect(result.current.gameState.isDraw).toBe(false);
    expect(result.current.hintState.enabled).toBe(false);
  });

  it('有効な手を打つと状態が更新される', () => {
    const { result } = renderHook(() => useTicTacToe());

    act(() => {
      result.current.makeMove(0, 0); // Oの手
    });

    expect(result.current.gameState.board[0][0]).toBe('O');
    expect(result.current.gameState.currentPlayer).toBe('X');
  });

  it('勝利条件を満たすと勝者が設定される', () => {
    const { result } = renderHook(() => useTicTacToe());

    act(() => result.current.makeMove(0, 0)); // O
    act(() => result.current.makeMove(1, 0)); // X
    act(() => result.current.makeMove(0, 1)); // O
    act(() => result.current.makeMove(1, 1)); // X
    act(() => result.current.makeMove(0, 2)); // O wins

    expect(result.current.gameState.winner).toBe('O');
    expect(result.current.gameState.status).toBe('ended');
  });

  it('ゲームをリセットすると初期状態に戻る', () => {
    const { result } = renderHook(() => useTicTacToe());

    act(() => {
      result.current.makeMove(0, 0);
    });

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.board[0][0]).toBeNull();
    expect(result.current.gameState.currentPlayer).toBe('O');
    expect(result.current.gameState.winner).toBeNull();
  });

  it('「おしえて！」機能が正しくON/OFFできる', () => {
    const { result } = renderHook(() => useTicTacToe());

    expect(result.current.hintState.enabled).toBe(false);

    act(() => {
      result.current.setHints(true);
    });
    expect(result.current.hintState.enabled).toBe(true);

    act(() => {
      result.current.setHints(false);
    });
    expect(result.current.hintState.enabled).toBe(false);
  });
});
