import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, handleCellClick, checkWinner, checkDraw, GameState, Board, calculatePotentialLines } from './core';

describe('calculatePotentialLines', () => {
  it('初期盤面の潜在ライン数を正しく計算すること', () => {
    const board: Board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const potentialLines = calculatePotentialLines(board);
    // コーナー: 3, エッジ: 2, センター: 4
    expect(potentialLines).toEqual([3, 2, 3, 2, 4, 2, 3, 2, 3]);
  });

  it('石が置かれた後の盤面の潜在ライン数を正しく計算すること', () => {
    const board: Board = [
      ['O', null, null],
      [null, 'X', null],
      [null, null, null],
    ];
    const potentialLines = calculatePotentialLines(board);
    expect(potentialLines).toEqual([
      null, 2, 3,
      2, null, 2,
      3, 2, 3
    ]);
  });

  it('完全に埋まった盤面では全ての潜在ライン数がnullであること', () => {
    const board: Board = [
      ['O', 'X', 'O'],
      ['X', 'O', 'X'],
      ['X', 'O', 'X'],
    ];
    const potentialLines = calculatePotentialLines(board);
    expect(potentialLines).toEqual(Array(9).fill(null));
  });
});

describe('Tic-Tac-Toe Core Logic', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialState();
  });

  it('ゲームが正しく初期化されることを確認', () => {
    expect(gameState.board.flat().every(cell => cell === null)).toBe(true);
    expect(gameState.currentPlayer).toBe('O');
    expect(gameState.winner).toBe(null);
    expect(gameState.isDraw).toBe(false);
    expect(gameState.winningLines).toBe(null);
  });

  it('有効な手番が許可されることを確認', () => {
    const newGameState = handleCellClick(gameState, 0, 0);
    expect(newGameState).not.toBeNull();
    if (!newGameState) return;
    expect(newGameState.board[0][0]).toBe('O');
    expect(newGameState.currentPlayer).toBe('X');
    expect(newGameState.winner).toBe(null);
  });

  it('既に駒が置かれているマスには移動できないことを確認', () => {
    let state: GameState | null = handleCellClick(gameState, 0, 0);
    expect(state).not.toBeNull();
    if (!state) return;

    state = handleCellClick(state, 0, 0); // Try to move on the same cell
    expect(state).toBeNull(); // State should be null for invalid move
  });

  it('ゲーム終了後には移動できないことを確認', () => {
    // Simulate a winning scenario for Player O
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 1, 0); // X
    if (!state) return;
    state = handleCellClick(state, 0, 1); // O
    if (!state) return;
    state = handleCellClick(state, 1, 1); // X
    if (!state) return;
    state = handleCellClick(state, 0, 2); // O wins
    if (!state) return;

    expect(state.winner).toBe('O');
    const finalState = handleCellClick(state, 2, 2); // Try to make a move after game ended
    expect(finalState).toBeNull(); // State should be null for invalid move
  });

  it('横方向の勝者を検出することを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 1, 0); // X
    if (!state) return;
    state = handleCellClick(state, 0, 1); // O
    if (!state) return;
    state = handleCellClick(state, 1, 1); // X
    if (!state) return;
    state = handleCellClick(state, 0, 2); // O wins
    if (!state) return;
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 1, 2]]);
  });

  it('縦方向の勝者を検出することを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 0, 1); // X
    if (!state) return;
    state = handleCellClick(state, 1, 0); // O
    if (!state) return;
    state = handleCellClick(state, 1, 1); // X
    if (!state) return;
    state = handleCellClick(state, 2, 0); // O wins
    if (!state) return;
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 3, 6]]);
  });

  it('斜め方向（左上から右下）の勝者を検出することを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 0, 1); // X
    if (!state) return;
    state = handleCellClick(state, 1, 1); // O
    if (!state) return;
    state = handleCellClick(state, 0, 2); // X
    if (!state) return;
    state = handleCellClick(state, 2, 2); // O wins
    if (!state) return;
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[0, 4, 8]]);
  });

  it('斜め方向（右上から左下）の勝者を検出することを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 2); // O
    if (!state) return;
    state = handleCellClick(state, 0, 0); // X
    if (!state) return;
    state = handleCellClick(state, 1, 1); // O
    if (!state) return;
    state = handleCellClick(state, 0, 1); // X
    if (!state) return;
    state = handleCellClick(state, 2, 0); // O wins
    if (!state) return;
    expect(state.winner).toBe('O');
    expect(state.winningLines).toEqual([[2, 4, 6]]);
  });

  it('引き分けを検出することを確認', () => {
    const state: GameState | null = createInitialState();
    if (!state) return;
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
    const drawBoard: Board = [
      ['O', 'X', 'O'],
      ['O', 'X', 'X'],
      ['X', 'O', 'O'],
    ];
    const { player: winnerAfterDraw } = checkWinner(drawBoard);
    const isDrawAfterDraw = !winnerAfterDraw && checkDraw(drawBoard);

    expect(winnerAfterDraw).toBe(null);
    expect(isDrawAfterDraw).toBe(true);
  });

  it('次のプレイヤーのリーチを検出することを確認', () => {
    let state: GameState | null = createInitialState();
    if (!state) return;
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 1, 0); // X
    if (!state) return;
    state = handleCellClick(state, 0, 1); // O
    if (!state) return;

    // Player X should have no reach
    expect(state.reachingLines.filter(r => r.player === 'X')).toEqual([]);

    // Player O should have a reach at [0,2] to win horizontally
    expect(state.reachingLines.filter(r => r.player === 'O')).toEqual([{ index: 2, player: 'O' }]);
  });

  it('勝利時に手番が交代しないことを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O, current is now X
    if (!state) return;
    state = handleCellClick(state, 1, 0); // X, current is now O
    if (!state) return;
    state = handleCellClick(state, 0, 1); // O, current is now X
    if (!state) return;
    state = handleCellClick(state, 1, 1); // X, current is now O
    if (!state) return;

    const movingPlayer = state.currentPlayer;
    expect(movingPlayer).toBe('O');

    state = handleCellClick(state, 0, 2); // O wins
    if (!state) return;

    expect(state.winner).toBe('O');
    // The player should not have switched, as the game is over.
    expect(state.currentPlayer).toBe(movingPlayer);
  });

  it('引き分け時に手番が交代しないことを確認', () => {
    let state: GameState | null = createInitialState();
    state = handleCellClick(state, 0, 0); // O
    if (!state) return;
    state = handleCellClick(state, 0, 1); // X
    if (!state) return;
    state = handleCellClick(state, 0, 2); // O
    if (!state) return;
    state = handleCellClick(state, 1, 1); // X
    if (!state) return;
    state = handleCellClick(state, 1, 0); // O
    if (!state) return;
    state = handleCellClick(state, 1, 2); // X
    if (!state) return;
    state = handleCellClick(state, 2, 1); // O
    if (!state) return;
    state = handleCellClick(state, 2, 0); // X
    if (!state) return;

    const movingPlayer = state.currentPlayer;
    expect(movingPlayer).toBe('O');

    state = handleCellClick(state, 2, 2); // O makes the final move, resulting in a draw
    if (!state) return;

    expect(state.isDraw).toBe(true);
    // The player should not have switched.
    expect(state.currentPlayer).toBe(movingPlayer);
  });
});