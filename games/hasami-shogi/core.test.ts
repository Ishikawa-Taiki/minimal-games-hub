import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  GameState,
  Board,
} from './core';

describe('はさみ将棋コアロジック', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialState();
  });

  it('ゲームが正しく初期化されること（プレイヤー1が下段）', () => {
    expect(gameState.board.length).toBe(9);
    expect(gameState.board[8].filter(p => p === 'PLAYER1').length).toBe(9); // P1 at bottom
    expect(gameState.board[0].filter(p => p === 'PLAYER2').length).toBe(9); // P2 at top
    expect(gameState.currentPlayer).toBe('PLAYER1');
    expect(gameState.gameStatus).toBe('PLAYING');
  });

  it('駒の選択で有効な手が計算されること', () => {
    // プレイヤー1が(8,0)の駒を選択
    const nextState = handleCellClick(gameState, 8, 0);
    expect(nextState.selectedPiece).toEqual({ r: 8, c: 0 });
    // Check that validMoves are calculated
    expect(nextState.validMoves.size).toBeGreaterThan(0);
    // Example: (7,0) should be a valid move
    expect(nextState.validMoves.has('7,0')).toBe(true);
  });

  it('安全な手（isUnsafe: false）が正しく判定されること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[8][0] = 'PLAYER1'; // Our moving piece
    let state: GameState = { ...createInitialState(), board };

    // Select the piece to calculate moves
    state = handleCellClick(state, 8, 0);

    // The move to (7,0) should be safe as no opponent piece can capture it
    const moveData = state.validMoves.get('7,0');
    expect(moveData?.isUnsafe).toBe(false);
  });

  it('危険な手（isUnsafe: true）が正しく判定されること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[8][1] = 'PLAYER1'; // Our moving piece
    board[6][0] = 'PLAYER2'; // Opponent piece that can capture
    board[6][2] = 'PLAYER2'; // Opponent piece that can capture
    let state: GameState = { ...createInitialState(), board };

    // Select the piece to calculate moves
    state = handleCellClick(state, 8, 1);

    // The move to (7,1) is unsafe because P2 at (6,0) and (6,2) can move to capture it
    // P2 at (6,0) can move to (7,0), P2 at (6,2) can move to (7,2) to capture (7,1)
    // Actually, one P2 piece is enough. Let's simplify.
    // P2 at (6,0) can move to (7,0). P2 at (6,2) can move to (7,2).
    // Let's place a stationary P2 piece.
    board[7][0] = 'PLAYER2';
    state = { ...createInitialState(), board };
    state = handleCellClick(state, 8, 1);

    const moveData = state.validMoves.get('7,1');
    // Moving P1 to (7,1) can be captured by P2 moving from (6,2) to (7,2).
    // The piece at (7,0) and the piece at (7,2) will form the sandwich.
    expect(moveData?.isUnsafe).toBe(true);
  });

  it('駒の移動とキャプチャが正しく行われること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[6][2] = 'PLAYER1'; // Stationary piece
    board[6][3] = 'PLAYER2'; // The piece to be captured
    board[8][4] = 'PLAYER1'; // The moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // Select piece at (8,4)
    state = handleCellClick(state, 8, 4);
    // Move to (6,4) to sandwich the piece at (6,3)
    const nextState = handleCellClick(state, 6, 4);

    expect(nextState.board[6][3]).toBeNull('Piece at (6,3) should be captured');
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
    expect(nextState.currentPlayer).toBe('PLAYER2');
  });

  it('相手の駒が1つになったら勝利判定がされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[6][2] = 'PLAYER1'; // Stationary
    board[6][3] = 'PLAYER2'; // The only remaining piece
    board[8][5] = 'PLAYER1'; // Moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };
    state.capturedPieces.PLAYER2 = 8;

    state = handleCellClick(state, 8, 5);
    const nextState = handleCellClick(state, 6, 5);

    expect(nextState.gameStatus).toBe('GAME_OVER');
    expect(nextState.winner).toBe('PLAYER1');
  });
});
