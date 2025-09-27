import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDotsAndBoxes } from './useDotsAndBoxes';
import { DrawLinePayload } from './core';

describe('useDotsAndBoxes', () => {
  it('should initialize with a waiting status', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    expect(result.current.gameState.status).toBe('waiting');
    expect(result.current.displayInfo.statusText).toBe('むずかしさをえらんでね');
  });

  it('should set the difficulty and start the game', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.setDifficulty('hard');
    });
    expect(result.current.gameState.difficulty).toBe('hard');
    expect(result.current.gameState.boardSize).toEqual({ rows: 6, cols: 6 });
    expect(result.current.gameState.status).toBe('playing');
  });

  it('should draw a line and switch players', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.setDifficulty('easy');
    });
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

    act(() => {
      result.current.setDifficulty('easy');
    });

    // Set up a pre-filled board state by dispatching actions
    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 0, col: 0 }); // P1 -> P2
      result.current.drawLine({ lineType: 'vertical', row: 0, col: 0 });   // P2 -> P1
      result.current.drawLine({ lineType: 'vertical', row: 0, col: 1 });   // P1 -> P2
    });

    expect(result.current.gameState.currentPlayer).toBe('PLAYER2');

    // Player 2 completes the box
    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 1, col: 0 });
    });

    expect(result.current.gameState.scores.PLAYER2).toBe(1);
    expect(result.current.gameState.currentPlayer).toBe('PLAYER2'); // Same player's turn
  });

  it('should update displayInfo correctly', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    act(() => {
      result.current.setDifficulty('easy');
    });
    expect(result.current.displayInfo.statusText).toBe('「プレイヤー1」のばん');

    act(() => {
      result.current.drawLine({ lineType: 'horizontal', row: 0, col: 0 });
    });

    expect(result.current.displayInfo.statusText).toBe('「プレイヤー2」のばん');
  });

  it('should return correct score info after starting game', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    act(() => {
      result.current.setDifficulty('easy');
    });

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