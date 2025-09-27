import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDotsAndBoxes } from './useDotsAndBoxes';
import { DrawLinePayload } from './core';

describe('useDotsAndBoxes', () => {
  it('should initialize with easy difficulty by default', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    expect(result.current.gameState.difficulty).toBe('easy');
    expect(result.current.gameState.boardSize).toEqual({ rows: 2, cols: 2 });
  });

  it('should reset the game with a specified difficulty', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.resetGame('hard');
    });
    expect(result.current.gameState.difficulty).toBe('hard');
    expect(result.current.gameState.boardSize).toEqual({ rows: 6, cols: 6 });
  });

  it('should draw a line and switch players', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    const payload: DrawLinePayload = { lineType: 'horizontal', row: 0, col: 0 };

    expect(result.current.gameState.currentPlayer).toBe('PLAYER1');

    act(() => {
      result.current.drawLine(payload);
    });

    expect(result.current.gameState.lines.horizontal[0][0]).toBe('PLAYER1');
    expect(result.current.gameState.currentPlayer).toBe('PLAYER2');
  });

  it('should complete a box, add score, and not switch players', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    // Manually set up a state where one line completes a box
    act(() => {
      result.current.resetGame('easy');
    });
    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 0, col: 0 }); // P1
    });
    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 0, col: 1 }); // P2
    });
    act(() => {
      result.current.drawLine({ lineType: 'vertical', row: 0, col: 0 }); // P1
    });
    act(() => {
      result.current.drawLine({ lineType: 'vertical', row: 0, col: 1 }); // P2
    });
    act(() => {
      result.current.drawLine({ lineType: 'vertical', row: 0, col: 2 }); // P1
    });
     act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 2, col: 0 }); // P2
    });

    expect(result.current.gameState.scores.PLAYER1).toBe(0);
    expect(result.current.gameState.currentPlayer).toBe('PLAYER1');

    // Player 1 completes the box
    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 1, col: 0 });
    });

    expect(result.current.gameState.scores.PLAYER1).toBe(1);
    expect(result.current.gameState.currentPlayer).toBe('PLAYER1'); // Same player's turn
  });

  it('should update displayInfo correctly', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    expect(result.current.displayInfo.statusText).toBe('「プレイヤー1」のばん');

    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 0, col: 0 });
    });

    expect(result.current.displayInfo.statusText).toBe('「プレイヤー2」のばん');
  });

  it('should return correct score info', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    const scoreInfo = result.current.getScoreInfo();

    expect(scoreInfo?.title).toBe('かくとくすう');
    expect(scoreInfo?.items).toEqual([
      { label: 'プレイヤー1', value: 0 },
      { label: 'プレイヤー2', value: 0 },
    ]);
  });

  it('should toggle hints', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
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
});