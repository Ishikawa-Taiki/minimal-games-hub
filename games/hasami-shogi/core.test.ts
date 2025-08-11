import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  isValidMove,
  GameState,
  Board,
  Player,
} from './core';

describe('はさみ将棋コアロジック', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialState();
  });

  it('ゲームが正しく初期化されること', () => {
    expect(gameState.board.length).toBe(9);
    expect(gameState.board[0].filter(p => p === 'PLAYER1').length).toBe(9);
    expect(gameState.board[8].filter(p => p === 'PLAYER2').length).toBe(9);
    expect(gameState.currentPlayer).toBe('PLAYER1');
    expect(gameState.gameStatus).toBe('PLAYING');
  });

  it('駒の選択と移動が正しく行われること', () => {
    // プレイヤー1が(0,0)の駒を選択
    let nextState = handleCellClick(gameState, 0, 0);
    expect(nextState.selectedPiece).toEqual({ r: 0, c: 0 });

    // (1,0)へ移動
    nextState = handleCellClick(nextState, 1, 0);
    expect(nextState.board[0][0]).toBeNull();
    expect(nextState.board[1][0]).toBe('PLAYER1');
    expect(nextState.currentPlayer).toBe('PLAYER2');
    expect(nextState.selectedPiece).toBeNull();
  });

  it('他の駒を飛び越えて移動できないこと', () => {
    const board: Board = gameState.board;
    board[0][1] = 'PLAYER2'; // Blocker
    const state: GameState = { ...gameState, board };
    expect(isValidMove(state.board, 0, 0, 0, 2)).toBe(false);
  });

  it('水平方向の挟み込みでキャプチャが成功すること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[1][2] = 'PLAYER1'; // Stationary piece
    board[1][3] = 'PLAYER2'; // To be captured
    board[1][4] = 'PLAYER2'; // To be captured
    board[2][5] = 'PLAYER1'; // Moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // (2,5)の駒を(1,5)に動かして挟む
    let stateWithSelection = handleCellClick(state, 2, 5);
    let nextState = handleCellClick(stateWithSelection, 1, 5);

    expect(nextState.board[1][3]).toBeNull('Piece at (1,3) should be captured');
    expect(nextState.board[1][4]).toBeNull('Piece at (1,4) should be captured');
    expect(nextState.capturedPieces.PLAYER2).toBe(2);
  });

  it('垂直方向の挟み込みでキャプチャが成功すること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[2][1] = 'PLAYER1'; // Stationary piece
    board[3][1] = 'PLAYER2'; // To be captured
    board[4][1] = 'PLAYER2'; // To be captured
    board[5][2] = 'PLAYER1'; // Moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // (5,2)の駒を(5,1)に動かして挟む
    let stateWithSelection = handleCellClick(state, 5, 2);
    let nextState = handleCellClick(stateWithSelection, 5, 1);

    expect(nextState.board[3][1]).toBeNull('Piece at (3,1) should be captured');
    expect(nextState.board[4][1]).toBeNull('Piece at (4,1) should be captured');
    expect(nextState.capturedPieces.PLAYER2).toBe(2);
  });

  it('相手の駒が1つになったら勝利判定がされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[1][2] = 'PLAYER1'; // Stationary
    board[1][3] = 'PLAYER2'; // The only remaining piece
    board[2][5] = 'PLAYER1'; // Moving piece

    // Simulate that P2 has only one piece left
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };
    state.capturedPieces.PLAYER2 = 8; // All other 8 pieces of P2 are already captured

    // P1 at (2,5) moves to (1,5) to capture the last piece
    let stateWithSelection = handleCellClick(state, 2, 5);
    let nextState = handleCellClick(stateWithSelection, 1, 5);

    expect(nextState.gameStatus).toBe('GAME_OVER');
    expect(nextState.winner).toBe('PLAYER1');
  });

  it('無効な移動は状態を変更しない（選択解除される）', () => {
    let stateWithSelection = handleCellClick(gameState, 0, 0);
    // (1,1)への斜め移動は無効
    let nextState = handleCellClick(stateWithSelection, 1, 1);

    expect(nextState.selectedPiece).toBeNull();
    expect(nextState.board).toEqual(gameState.board);
    expect(nextState.currentPlayer).toBe(gameState.currentPlayer);
  });
});
