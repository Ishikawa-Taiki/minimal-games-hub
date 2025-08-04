import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, handleCellClick, checkWinner, checkDraw, GameState, Player } from './core';

describe('Tic-Tac-Toe Core Logic', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialState();
  });

  it('should initialize the game correctly', () => {
    expect(gameState.board.flat().every(cell => cell === null)).toBe(true);
    expect(gameState.currentPlayer).toBe('O');
    expect(gameState.winner).toBe(null);
    expect(gameState.isDraw).toBe(false);
    expect(gameState.winningLines).toBe(null);
  });

  it('should allow a valid move', () => {
    const newGameState = handleCellClick(gameState, 0, 0);
    expect(newGameState.board[0][0]).toBe('O');
    expect(newGameState.currentPlayer).toBe('X');
    expect(newGameState.winner).toBe(null);
  });

  it('should not allow a move on an occupied cell', () => {
    let state = handleCellClick(gameState, 0, 0);
    const originalState = { ...state };
    state = handleCellClick(state, 0, 0); // Try to move on the same cell
    expect(state).toBeNull(); // State should be null for invalid move
  });

  it('should not allow a move after the game has ended', () => {
    // Simulate a winning scenario for Player O
    let state = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    state = handleCellClick(state, 1, 0); // X
    state = handleCellClick(state, 0, 1); // O
    state = handleCellClick(state, 1, 1); // X
    state = handleCellClick(state, 0, 2); // O wins

    expect(state.winner).toBe('O');
    const originalState = { ...state };
    const finalState = handleCellClick(state, 2, 2); // Try to make a move after game ended
    expect(finalState).toBeNull(); // State should be null for invalid move
  });

  it('should detect a winner horizontally', () => {
    let state = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    state = handleCellClick(state, 1, 0); // X
    state = handleCellClick(state, 0, 1); // O
    state = handleCellClick(state, 1, 1); // X
    state = handleCellClick(state, 0, 2); // O wins
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 1, 2]]);
  });

  it('should detect a winner vertically', () => {
    let state = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    state = handleCellClick(state, 0, 1); // X
    state = handleCellClick(state, 1, 0); // O
    state = handleCellClick(state, 1, 1); // X
    state = handleCellClick(state, 2, 0); // O wins
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 3, 6]]);
  });

  it('should detect a winner diagonally (top-left to bottom-right)', () => {
    let state = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    state = handleCellClick(state, 0, 1); // X
    state = handleCellClick(state, 1, 1); // O
    state = handleCellClick(state, 0, 2); // X
    state = handleCellClick(state, 2, 2); // O wins
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 4, 8]]);
  });

  it('should detect a winner diagonally (top-right to bottom-left)', () => {
    let state = createInitialState();
    state = handleCellClick(state, 0, 2); // O
    state = handleCellClick(state, 0, 0); // X
    state = handleCellClick(state, 1, 1); // O
    state = handleCellClick(state, 0, 1); // X
    state = handleCellClick(state, 2, 0); // O wins
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[2, 4, 6]]);
  });

  it('should detect a draw', () => {
    let state = createInitialState();
    // Manually set up a draw board state
    state.board = [
      ['O', 'X', 'O'],
      ['O', 'X', 'X'],
      ['X', 'O', 'O'],
    ];
    state.currentPlayer = 'X'; // Doesn't matter for draw check
    state.winner = null;
    state.isDraw = true;

    // After setting up the board, check if the game state correctly reflects a draw
    // We need to call handleCellClick with a null move to trigger the state update
    const finalState = handleCellClick(state, 0, 0); // Invalid move, but triggers state check
    expect(finalState).toBeNull(); // Should be null as game is already drawn

    // To properly test the draw detection, we need to check the state *before* the final move
    // Or, we can directly test the checkDraw function
    const drawBoard = [
      ['O', 'X', 'O'],
      ['O', 'X', 'X'],
      ['X', 'O', 'O'],
    ];
    const { player: winnerAfterDraw, lines: winningLinesAfterDraw } = checkWinner(drawBoard);
    const isDrawAfterDraw = !winnerAfterDraw && checkDraw(drawBoard);

    expect(winnerAfterDraw).toBe(null);
    expect(isDrawAfterDraw).toBe(true);
  });

  it('should detect a winning line for the next player (reach)', () => {
    let state = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    state = handleCellClick(state, 1, 0); // X
    state = handleCellClick(state, 0, 1); // O

    // Player X should have no reach
    expect(state.reachingLines.filter(r => r.player === 'X')).toEqual([]);

    // Player O should have a reach at [0,2] to win horizontally
    expect(state.reachingLines.filter(r => r.player === 'O')).toEqual([{ index: 2, player: 'O' }]);
  });
});