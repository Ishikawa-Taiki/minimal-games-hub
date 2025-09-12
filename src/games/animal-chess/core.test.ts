import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  handleCaptureClick,
  getValidMoves,
  getValidDrops,
  SENTE,
  GOTE,
  LION,
  CHICK,
  ELEPHANT,
  GIRAFFE,
  ROOSTER,
} from './core';

describe('Animal Chess Core Logic', () => {
  it('should create a valid initial state', () => {
    const state = createInitialState();
    expect(state.board.length).toBe(4);
    expect(state.board[0].length).toBe(3);
    expect(state.currentPlayer).toBe(SENTE);
    expect(state.status).toBe('playing');
    expect(state.board[3][1]?.type).toBe(LION);
    expect(state.board[0][1]?.type).toBe(LION);
  });

  it('should allow a valid move', () => {
    let state = createInitialState();
    // SENTE moves CHICK from (2,1) to (1,1)
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    expect(state.board[2][1]).toBeNull();
    expect(state.board[1][1]?.type).toBe(CHICK);
    expect(state.board[1][1]?.owner).toBe(SENTE);
    expect(state.currentPlayer).toBe(GOTE);
  });

  it('should capture an opponent piece', () => {
    let state = createInitialState();
    // SENTE moves CHICK from (2,1) to (1,1)
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    // GOTE moves ELEPHANT from (0,0) to (1,1)
    state = handleCellClick(state, 0, 0);
    state = handleCellClick(state, 1, 1);

    expect(state.board[1][1]?.type).toBe(ELEPHANT);
    expect(state.board[1][1]?.owner).toBe(GOTE);
    expect(state.capturedPieces[GOTE]).toContain(CHICK);
    expect(state.currentPlayer).toBe(SENTE);
  });

  it('should promote a CHICK to a ROOSTER', () => {
    let state = createInitialState();
    // Move pieces out of the way
    state.board[1][1] = null;
    // SENTE moves CHICK from (2,1) to (1,1)
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    // GOTE does some move
    state = handleCellClick(state, 0, 1);
    state = handleCellClick(state, 1, 0);
    // SENTE moves CHICK from (1,1) to (0,1) -> promotion
    state = handleCellClick(state, 1, 1);
    state = handleCellClick(state, 0, 1);

    expect(state.board[0][1]?.type).toBe(ROOSTER);
    expect(state.board[0][1]?.owner).toBe(SENTE);
  });

  it('should allow dropping a captured piece', () => {
    let state = createInitialState();
    state.capturedPieces[SENTE] = [GIRAFFE];

    // Select the captured GIRAFFE
    state = handleCaptureClick(state, SENTE, 0);
    expect(state.selectedCaptureIndex).toEqual({ player: SENTE, index: 0 });

    // Drop it on an empty cell (2,2)
    state = handleCellClick(state, 2, 2);
    expect(state.board[2][2]?.type).toBe(GIRAFFE);
    expect(state.board[2][2]?.owner).toBe(SENTE);
    expect(state.capturedPieces[SENTE].length).toBe(0);
    expect(state.currentPlayer).toBe(GOTE);
  });

  it('should declare a winner when LION is captured', () => {
    let state = createInitialState();
    state.board[0][1] = null; // Remove GOTE's LION for testing
    state.board[1][1] = { type: LION, owner: GOTE }; // Place it in a vulnerable spot

    // SENTE moves CHICK to capture LION
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);

    expect(state.status).toBe('sente_win');
  });

  it('should declare a winner on LION reaching final rank (Try)', () => {
    let state = createInitialState();
    // Clear path for SENTE LION
    state.board[2][1] = null;
    state.board[1][1] = null;
    state.board[0][1] = null;

    // Move LION forward
    state = handleCellClick(state, 3, 1); // select
    state = handleCellClick(state, 2, 1); // move
    state = handleCellClick(state, 0, 0); // gote move
    state = handleCellClick(state, 1, 0); // gote move
    state = handleCellClick(state, 2, 1); // select
    state = handleCellClick(state, 1, 1); // move
    state = handleCellClick(state, 1, 0); // gote move
    state = handleCellClick(state, 2, 0); // gote move
    state = handleCellClick(state, 1, 1); // select
    state = handleCellClick(state, 0, 1); // move & TRY

    expect(state.status).toBe('sente_win');
  });

  it('should return valid moves for a piece', () => {
    const state = createInitialState();
    const moves = getValidMoves(state, 3, 1); // SENTE LION
    expect(moves.length).toBe(2); // Blocked by own pieces
  });

  it('should return valid drop locations', () => {
    const state = createInitialState();
    state.capturedPieces[SENTE] = [CHICK];
    const drops = getValidDrops(state, SENTE, CHICK);
    // Initial board has 12 total cells, 8 are occupied -> 4 empty cells
    // The final rank for SENTE is row 0, which is occupied, so no restrictions apply initially.
    expect(drops.length).toBe(4);
  });

  it('should not allow dropping a CHICK on the final rank', () => {
    const state = createInitialState();
    state.capturedPieces[SENTE] = [CHICK];
    // Clear the final rank to test the drop restriction
    state.board[0] = [null, null, null];

    const drops = getValidDrops(state, SENTE, CHICK);

    // The final rank (row 0) should not be included in valid drops
    const hasFinalRankDrop = drops.some(d => d.row === 0);
    expect(hasFinalRankDrop).toBe(false);
    // There are 3 empty spots on row 1 and 1 on row 2 = 4 valid spots
    expect(drops.length).toBe(4);
  });

  it('should not allow moving into check (not implemented, just placeholder)', () => {
    // This is a placeholder for a more complex rule that isn't part of the core requirements.
    // For now, we just confirm the basic move validation works.
    let state = createInitialState();
    const originalState = JSON.parse(JSON.stringify(state));
    // Try an invalid move (e.g., GIRAFFE moving diagonally)
    state = handleCellClick(state, 3, 0); // select
    state = handleCellClick(state, 2, 1); // try to move to where CHICK is
    state = handleCellClick(state, 2, 0); // try to move diagonally
    // The state should not have changed from the original selection attempt
    state.selectedCell = null; // reset selection for comparison
    originalState.selectedCell = null;
    expect(state.board).toEqual(originalState.board);
  });
});
