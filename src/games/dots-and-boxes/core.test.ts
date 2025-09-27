import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  selectLine,
  type GameState,
  type Difficulty,
} from './core';

describe('Dots and Boxes Core Logic', () => {
  describe('createInitialState', () => {
    it.each([
      ['easy', 2, 2],
      ['normal', 4, 4],
      ['hard', 6, 6],
    ])(
      'should create a correct initial state for %s difficulty',
      (difficulty, rows, cols) => {
        const state = createInitialState(difficulty as Difficulty);
        expect(state.difficulty).toBe(difficulty);
        expect(state.rows).toBe(rows);
        expect(state.cols).toBe(cols);
      }
    );
  });

  describe('selectLine for 2x2 board', () => {
    let s: GameState;

    beforeEach(() => {
      s = createInitialState('easy');
    });

    it('should switch player when no box is made', () => {
      s = selectLine(s, 0, 0, 'h');
      expect(s.currentPlayer).toBe('player2');
    });

    it('should award a point and not switch player when a box is made', () => {
      s = selectLine(s, 0, 0, 'h'); // p1
      s = selectLine(s, 0, 0, 'v'); // p2
      s = selectLine(s, 1, 0, 'h'); // p1
      s = selectLine(s, 0, 1, 'v'); // p2 makes box (0,0)
      expect(s.scores.player2).toBe(1);
      expect(s.currentPlayer).toBe('player2');
    });

    it('should award two points for two boxes at once', () => {
      s = selectLine(s, 0, 0, 'h'); // p1
      s = selectLine(s, 0, 1, 'h'); // p2
      s = selectLine(s, 2, 0, 'h'); // p1
      s = selectLine(s, 2, 1, 'h'); // p2
      s = selectLine(s, 0, 0, 'v'); // p1
      s = selectLine(s, 1, 0, 'v'); // p2
      s = selectLine(s, 0, 2, 'v'); // p1
      s = selectLine(s, 1, 2, 'v'); // p2
      s = selectLine(s, 0, 1, 'v'); // p1 -> p2
      s = selectLine(s, 1, 1, 'v'); // p2 -> p1
      // p1 to play h[1][0]
      s = selectLine(s, 1, 0, 'h');
      expect(s.scores.player1).toBe(2);
      expect(s.currentPlayer).toBe('player1');
    });

    it('should declare a winner correctly (P1 wins 4-0)', () => {
        let s = createInitialState('easy');
        // A full game simulation where P1 wins all boxes
        s = selectLine(s, 0, 0, 'h'); // p1
        s = selectLine(s, 0, 1, 'h'); // p2
        s = selectLine(s, 1, 0, 'h'); // p1
        s = selectLine(s, 1, 1, 'h'); // p2
        s = selectLine(s, 2, 0, 'h'); // p1
        s = selectLine(s, 2, 1, 'h'); // p2
        s = selectLine(s, 0, 0, 'v'); // p1
        s = selectLine(s, 1, 0, 'v'); // p2
        s = selectLine(s, 0, 2, 'v'); // p1
        s = selectLine(s, 1, 2, 'v'); // p2
        // P1 to play. 2 lines left: v(0,1), v(1,1)
        expect(s.currentPlayer).toBe('player1');

        s = selectLine(s, 0, 1, 'v'); // P1 completes box (0,0) and (0,1). Score 2-0.
        expect(s.scores.player1).toBe(2);
        expect(s.currentPlayer).toBe('player1');

        s = selectLine(s, 1, 1, 'v'); // P1 completes box (1,0) and (1,1). Score 4-0.
        expect(s.scores.player1).toBe(4);
        expect(s.currentPlayer).toBe('player1');

        expect(s.gameStatus).toBe('ended');
        expect(s.winner).toBe('player1');
    });

    it('should declare a draw correctly (2-2)', () => {
        let s = createInitialState('easy');
        // A full game simulation leading to a 2-2 draw
        s = selectLine(s, 0, 0, 'h'); // p1
        s = selectLine(s, 1, 0, 'h'); // p2
        s = selectLine(s, 0, 1, 'h'); // p1
        s = selectLine(s, 1, 1, 'h'); // p2
        s = selectLine(s, 0, 0, 'v'); // p1
        s = selectLine(s, 0, 2, 'v'); // p2
        s = selectLine(s, 1, 0, 'v'); // p1
        s = selectLine(s, 1, 2, 'v'); // p2
        // 4 lines left. p1 to play.
        s = selectLine(s, 0, 1, 'v'); // p1 takes box(0,0) and box(0,1). Score: p1=2. Turn: p1
        expect(s.scores.player1).toBe(2);
        expect(s.currentPlayer).toBe('player1');

        // p1 is forced to play a line that doesn't complete a box
        s = selectLine(s, 2, 0, 'h'); // p1 -> p2
        expect(s.currentPlayer).toBe('player2');

        // p2 takes the remaining two boxes
        s = selectLine(s, 1, 1, 'v'); // p2 takes box(1,0). Score: p2=1. Turn: p2
        expect(s.scores.player2).toBe(1);
        s = selectLine(s, 2, 1, 'h'); // p2 takes box(1,1). Score: p2=2. Turn: p2. Game over.
        expect(s.scores.player2).toBe(2);

        expect(s.gameStatus).toBe('ended');
        expect(s.winner).toBe('draw');
    });
  });
});