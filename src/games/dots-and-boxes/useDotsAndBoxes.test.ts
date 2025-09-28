import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDotsAndBoxes } from './useDotsAndBoxes';

describe('useDotsAndBoxes', () => {
  it('should initialize with a waiting status', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    expect(result.current.gameState.gameStatus).toBe('waiting');
    expect(result.current.getDisplayStatus()).toBe('むずかしさをえらんでね');
  });

  it('should set the difficulty and start the game', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.setDifficulty('hard');
    });
    expect(result.current.gameState.difficulty).toBe('hard');
    expect(result.current.gameState.rows).toBe(6);
    expect(result.current.gameState.cols).toBe(6);
    expect(result.current.gameState.gameStatus).toBe('playing');
  });

  it('should draw a line and switch players', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.setDifficulty('easy');
    });

    expect(result.current.gameState.currentPlayer).toBe('player1');

    act(() => {
      result.current.selectLine(0, 0, 'h');
    });

    expect(result.current.gameState.hLines[0][0].owner).toBe('player1');
    expect(result.current.gameState.currentPlayer).toBe('player2');
  });

  it('should complete a box, add score, and not switch players', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    act(() => {
      result.current.setDifficulty('easy');
    });

    // P1 plays
    act(() => {
      result.current.selectLine(0, 0, 'h');
    });
    // P2 plays
    act(() => {
      result.current.selectLine(0, 0, 'v');
    });
    // P1 plays
    act(() => {
      result.current.selectLine(0, 1, 'v');
    });

    expect(result.current.gameState.currentPlayer).toBe('player2');

    // Player 2 completes the box
    act(() => {
      result.current.selectLine(1, 0, 'h');
    });

    expect(result.current.gameState.scores.player2).toBe(1);
    expect(result.current.gameState.currentPlayer).toBe('player2'); // Same player's turn
  });

  it('should update display status correctly', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    act(() => {
      result.current.setDifficulty('easy');
    });
    expect(result.current.getDisplayStatus()).toBe('「プレイヤー1」のばん');

    act(() => {
      result.current.selectLine(0, 0, 'h');
    });

    expect(result.current.getDisplayStatus()).toBe('「プレイヤー2」のばん');
  });

  it('should return correct score info after starting game', () => {
    const { result } = renderHook(() => useDotsAndBoxes());

    act(() => {
      result.current.setDifficulty('easy');
    });

    const scoreInfo = result.current.getScoreInfo();

    expect(scoreInfo?.title).toBe('獲得したかず');
    expect(scoreInfo?.items).toEqual([
      { label: 'player1', value: 0 },
      { label: 'player2', value: 0 },
    ]);
  });

  it('should toggle hints', () => {
    const { result } = renderHook(() => useDotsAndBoxes());
    act(() => {
      result.current.setDifficulty('easy');
    });
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