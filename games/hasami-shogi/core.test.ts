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

  it('角の駒が正しくキャプチャされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[0][1] = 'PLAYER1';
    board[1][0] = 'PLAYER1';
    board[0][0] = 'PLAYER2'; // Piece to be captured at corner
    board[8][0] = 'PLAYER1'; // Moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // A move by P1 anywhere (that doesn't change the corner) should trigger the capture check.
    // Let's just move a random piece.
    state = handleCellClick(state, 8, 0);
    const nextState = handleCellClick(state, 7, 0);

    expect(nextState.board[0][0]).toBeNull('Corner piece should be captured');
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
  });

  it('辺の駒が正しくキャプチャされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[0][1] = 'PLAYER1';
    board[0][3] = 'PLAYER1';
    board[1][2] = 'PLAYER1';
    board[0][2] = 'PLAYER2'; // Piece to be captured at edge
    board[8][0] = 'PLAYER1'; // Moving piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    state = handleCellClick(state, 8, 0);
    const nextState = handleCellClick(state, 7, 0);

    expect(nextState.board[0][2]).toBeNull('Edge piece should be captured');
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
  });

  it('5枚先取で勝利判定がされること', () => {
    let state = createInitialState();
    state.capturedPieces.PLAYER2 = 4; // P1 has captured 4 of P2's pieces

    // Set up a board for one more capture
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[6][2] = 'PLAYER1';
    board[6][3] = 'PLAYER2';
    board[8][4] = 'PLAYER1';
    state.board = board;
    state.currentPlayer = 'PLAYER1';

    state = handleCellClick(state, 8, 4);
    const nextState = handleCellClick(state, 6, 4); // Move to capture

    expect(nextState.capturedPieces.PLAYER2).toBe(5);
    expect(nextState.gameStatus).toBe('GAME_OVER');
    expect(nextState.winner).toBe('PLAYER1');
  });

  it('3枚差で勝利判定がされること', () => {
    let state = createInitialState();
    state.capturedPieces.PLAYER1 = 0; // P2 has captured 0
    state.capturedPieces.PLAYER2 = 2; // P1 has captured 2

    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[6][2] = 'PLAYER1';
    board[6][3] = 'PLAYER2';
    board[8][4] = 'PLAYER1';
    state.board = board;
    state.currentPlayer = 'PLAYER1';

    state = handleCellClick(state, 8, 4);
    const nextState = handleCellClick(state, 6, 4); // Move to capture

    expect(nextState.capturedPieces.PLAYER2).toBe(3);
    expect(nextState.gameStatus).toBe('GAME_OVER');
    expect(nextState.winner).toBe('PLAYER1');
  });

  it('isMoveUnsafeエッジケース：相手の駒の間に移動するが、相手は動けないので安全', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    // O P O のような状況で、Pの隣に移動するケース
    board[7][0] = 'PLAYER2';
    board[7][2] = 'PLAYER2';
    board[8][1] = 'PLAYER1'; // The piece to move

    let state: GameState = { ...createInitialState(), board };
    // Select P1 at (8,1)
    state = handleCellClick(state, 8, 1);

    // The move for P1 to (7,1) lands it between two P2 pieces.
    // However, the P2 pieces cannot capture it because they cannot move into the P1's spot.
    // Therefore, the move should be considered SAFE.
    const moveData = state.validMoves.get('7,1');
    expect(moveData?.isUnsafe).toBe(false);
  });

  it('potentialCapturesが正しく計算されること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[8][4] = 'PLAYER1'; // The selected piece

    // Setup for vertical capture: Move (8,4)=>(7,4) will capture P2 at (6,4)
    board[5][4] = 'PLAYER1'; // Stationary piece
    board[6][4] = 'PLAYER2'; // Target 1

    // Setup for horizontal capture: Move (8,4)=>(8,3) will capture P2 at (8,2)
    board[8][1] = 'PLAYER1'; // Stationary piece
    board[8][2] = 'PLAYER2'; // Target 2

    let state: GameState = { ...createInitialState(), board };
    state = handleCellClick(state, 8, 4); // Select the piece

    const captures = state.potentialCaptures;

    expect(captures).toHaveLength(2);
    expect(captures).toEqual(expect.arrayContaining([[6,4], [8,2]]));
  });
});
