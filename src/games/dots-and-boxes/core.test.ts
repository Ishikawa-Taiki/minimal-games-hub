import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  selectLine,
  calculateRemainingLinesCounts,
  getPreview,
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
        expect(state.status).toBe('playing');
      }
    );
  });

  describe('selectLine for 2x2 board', () => {
    let s: GameState;

    beforeEach(() => {
      s = createInitialState('easy');
    });

    it('should switch player when no box is made', () => {
      const newState = selectLine(s, 0, 0, 'h');
      expect(newState.currentPlayer).toBe('player2');
    });

    it('should award a point and not switch player when a box is made', () => {
      let state = s;
      state = selectLine(state, 0, 0, 'h'); // p1
      state = selectLine(state, 0, 0, 'v'); // p2
      state = selectLine(state, 1, 0, 'h'); // p1
      state = selectLine(state, 0, 1, 'v'); // p2 makes box (0,0)
      expect(state.scores.player2).toBe(1);
      expect(state.currentPlayer).toBe('player2');
    });

    it('should award two points for two boxes at once', () => {
      let state = s;
      state = selectLine(state, 0, 0, 'h'); // p1
      state = selectLine(state, 0, 1, 'h'); // p2
      state = selectLine(state, 2, 0, 'h'); // p1
      state = selectLine(state, 2, 1, 'h'); // p2
      state = selectLine(state, 0, 0, 'v'); // p1
      state = selectLine(state, 1, 0, 'v'); // p2
      state = selectLine(state, 0, 2, 'v'); // p1
      state = selectLine(state, 1, 2, 'v'); // p2
      state = selectLine(state, 0, 1, 'v'); // p1 -> p2
      state = selectLine(state, 1, 1, 'v'); // p2 -> p1

      // p1 to play h[1][0], completing two boxes
      const finalState = selectLine(state, 1, 0, 'h');
      expect(finalState.scores.player1).toBe(2);
      expect(finalState.currentPlayer).toBe('player1');
    });

    it('should declare a winner correctly (P1 wins 4-0)', () => {
      let state = createInitialState('easy');
      // A full game simulation where P1 wins all boxes
      state = selectLine(state, 0, 0, 'h'); // p1
      state = selectLine(state, 0, 1, 'h'); // p2
      state = selectLine(state, 1, 0, 'h'); // p1
      state = selectLine(state, 1, 1, 'h'); // p2
      state = selectLine(state, 2, 0, 'h'); // p1
      state = selectLine(state, 2, 1, 'h'); // p2
      state = selectLine(state, 0, 0, 'v'); // p1
      state = selectLine(state, 1, 0, 'v'); // p2
      state = selectLine(state, 0, 2, 'v'); // p1
      state = selectLine(state, 1, 2, 'v'); // p2

      expect(state.currentPlayer).toBe('player1');

      state = selectLine(state, 0, 1, 'v'); // P1 completes box (0,0) and (0,1). Score 2-0.
      expect(state.scores.player1).toBe(2);
      expect(state.currentPlayer).toBe('player1');

      state = selectLine(state, 1, 1, 'v'); // P1 completes box (1,0) and (1,1). Score 4-0.
      expect(state.scores.player1).toBe(4);
      expect(state.currentPlayer).toBe('player1');

      expect(state.status).toBe('ended');
      expect(state.winner).toBe('player1');
    });

    it('should handle immutable state updates', () => {
      const initialState = createInitialState('easy');
      const newState = selectLine(initialState, 0, 0, 'h');
      expect(initialState).not.toBe(newState); // Ensure new state object is returned
      expect(initialState.hLines[0][0].owner).toBe(null); // Ensure original state is not mutated
      expect(newState.hLines[0][0].owner).toBe('player1');
    });
  });

  describe('calculateRemainingLinesCounts', () => {
    let state: GameState;
    beforeEach(() => {
      state = createInitialState('easy');
    });

    it('should show 4 for all boxes on an empty board', () => {
      const counts = calculateRemainingLinesCounts(state);
      expect(counts).toEqual([
        [4, 4],
        [4, 4],
      ]);
    });

    it('should decrease count for adjacent boxes when a line is drawn', () => {
      const newState = selectLine(state, 0, 0, 'h');
      const counts = calculateRemainingLinesCounts(newState);
      // Box (0,0) is now surrounded by 3 lines
      expect(counts[0][0]).toBe(3);
      // Other boxes are unaffected
      expect(counts[0][1]).toBe(4);
    });

    it('should show 0 for a completed box', () => {
      let s = state;
      s = selectLine(s, 0, 0, 'h');
      s = selectLine(s, 0, 0, 'v');
      s = selectLine(s, 1, 0, 'h');
      s = selectLine(s, 0, 1, 'v');
      const counts = calculateRemainingLinesCounts(s);
      expect(counts[0][0]).toBe(0);
    });
  });

  describe('getPreview', () => {
    let state: GameState;
    beforeEach(() => {
      state = createInitialState('easy');
    });

    it('should preview no completed boxes if the move does not complete any', () => {
      const preview = getPreview(state, 0, 0, 'h');
      expect(preview.completedBoxes).toEqual([]);
      expect(preview.adjacentBoxes.length).toBe(1);
    });

    it('should preview one completed box', () => {
      let s = state;
      s = selectLine(s, 0, 0, 'h');
      s = selectLine(s, 0, 0, 'v');
      s = selectLine(s, 1, 0, 'h');
      // The next move on v(0,1) will complete box (0,0)
      const preview = getPreview(s, 0, 1, 'v');
      expect(preview.completedBoxes).toEqual([{ r: 0, c: 0 }]);
    });

    it('should preview two completed boxes', () => {
      let s = state;
      s = selectLine(s, 0, 0, 'h');
      s = selectLine(s, 0, 1, 'h');
      s = selectLine(s, 2, 0, 'h');
      s = selectLine(s, 2, 1, 'h');
      s = selectLine(s, 0, 0, 'v');
      s = selectLine(s, 1, 0, 'v');
      s = selectLine(s, 0, 2, 'v');
      s = selectLine(s, 1, 2, 'v');
      s = selectLine(s, 0, 1, 'v');
      s = selectLine(s, 1, 1, 'v');
      // P1 to play h[1][0], completing two boxes (0,0) and (1,0)
      const preview = getPreview(s, 1, 0, 'h');
      expect(preview.completedBoxes.length).toBe(2);
      expect(preview.completedBoxes).toContainEqual({ r: 0, c: 0 });
      expect(preview.completedBoxes).toContainEqual({ r: 1, c: 0 });
    });
  });
});