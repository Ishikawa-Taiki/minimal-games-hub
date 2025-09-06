import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  setWinCondition,
  GameState,
  Board,
} from './core';

describe('はさみ将棋コアロジック', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialState();
  });

  describe('勝利条件の選択', () => {
    it('ゲーム開始前に勝利条件を変更できること', () => {
      const newState = setWinCondition(gameState, 'five_captures');
      expect(newState.winCondition).toBe('five_captures');
    });

    it('ゲーム開始後は勝利条件を変更できないこと', () => {
      // Simulate a move has been made
      const board = gameState.board.map(row => [...row]);
      board[8][0] = null;
      board[7][0] = 'PLAYER1';
      gameState.board = board;

      const newState = setWinCondition(gameState, 'total_capture');
      expect(newState.winCondition).toBe('standard'); // Should not change from the default
    });
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
    board[6][2] = 'PLAYER2'; // Opponent piece that can capture
    let state: GameState = { ...createInitialState(), board };

    // Let's place a stationary P2 piece.
    board[7][0] = 'PLAYER2';
    state = { ...createInitialState(), board };
    state = handleCellClick(state, 8, 1);

    const moveData = state.validMoves.get('7,1');
    // Moving P1 to (7,1) can be captured by P2 moving from (6,2) to (7,2).
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

    expect(nextState.board[6][3]).toBeNull();
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
    expect(nextState.currentPlayer).toBe('PLAYER2');
  });

  it('角の駒が正しくキャプチャされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[0][0] = 'PLAYER2'; // Piece to be captured at corner
    board[0][1] = 'PLAYER1'; // Stationary P1 piece
    board[8][0] = 'PLAYER1'; // Moving P1 piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // Move P1 from (8,0) to (1,0) to capture the corner piece
    state = handleCellClick(state, 8, 0);
    const nextState = handleCellClick(state, 1, 0);

    expect(nextState.board[0][0]).toBeNull();
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
  });

  it('辺の駒が正しくキャプチャされること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[0][2] = 'PLAYER2'; // Piece to be captured at edge
    board[0][1] = 'PLAYER1'; // Stationary P1 piece
    board[1][2] = 'PLAYER1'; // Stationary P1 piece
    board[8][3] = 'PLAYER1'; // Moving P1 piece
    let state: GameState = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };

    // Move P1 from (8,3) to (0,3) to capture the edge piece
    state = handleCellClick(state, 8, 3);
    const nextState = handleCellClick(state, 0, 3);

    expect(nextState.board[0][2]).toBeNull();
    expect(nextState.capturedPieces.PLAYER2).toBe(1);
  });

  describe('勝利判定ロジック', () => {
    it('スタンダードルール: 5枚先取で勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'standard');
      if (!state) return;
      state.capturedPieces.PLAYER2 = 4; // P1 has captured 4 of P2's pieces
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[6][2] = 'PLAYER1'; board[6][3] = 'PLAYER2'; board[8][4] = 'PLAYER1';
      state.board = board; state.currentPlayer = 'PLAYER1';
      state = handleCellClick(state, 8, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 6, 4);
      expect(nextState.capturedPieces.PLAYER2).toBe(5);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER1');
    });

    it('スタンダードルール: 後手が5枚先取で勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'standard');
      if (!state) return;
      state.capturedPieces.PLAYER1 = 4; // P2 has captured 4 of P1's pieces
      state.currentPlayer = 'PLAYER2';
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[2][2] = 'PLAYER2'; board[2][3] = 'PLAYER1'; board[0][4] = 'PLAYER2';
      state.board = board;
      state = handleCellClick(state, 0, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 2, 4);
      expect(nextState.capturedPieces.PLAYER1).toBe(5);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER2');
    });

    it('スタンダードルール: 3枚差で勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'standard');
      if (!state) return;
      state.capturedPieces.PLAYER2 = 2; // P1 has captured 2 of P2's pieces
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[6][2] = 'PLAYER1'; board[6][3] = 'PLAYER2'; board[8][4] = 'PLAYER1';
      state.board = board; state.currentPlayer = 'PLAYER1';
      state = handleCellClick(state, 8, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 6, 4);
      expect(nextState.capturedPieces.PLAYER2).toBe(3);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER1');
    });

    it('スタンダードルール: 後手が3枚差で勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'standard');
      if (!state) return;
      state.capturedPieces.PLAYER1 = 2; // P2 has captured 2 of P1's pieces
      state.currentPlayer = 'PLAYER2';
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[2][2] = 'PLAYER2'; board[2][3] = 'PLAYER1'; board[0][4] = 'PLAYER2';
      state.board = board;
      state = handleCellClick(state, 0, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 2, 4);
      expect(nextState.capturedPieces.PLAYER1).toBe(3);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER2');
    });

    it('全取りルール: 相手の駒が1つになったら勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'total_capture');
      if (!state) return;
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));

      // P1 pieces
      board[5][1] = 'PLAYER1'; // Stationary piece
      board[7][8] = 'PLAYER1'; // Moving piece

      // P2 pieces
      board[6][1] = 'PLAYER2'; // Piece to be captured
      board[0][0] = 'PLAYER2'; // The one that will remain

      state.board = board;
      state.currentPlayer = 'PLAYER1';

      // Select moving piece at (7,8)
      state = handleCellClick(state, 7, 8);
      if (!state) return;
      // Move it to (7,1) to create a vertical sandwich
      const nextState = handleCellClick(state, 7, 1);

      expect(nextState.board[6][1]).toBeNull(); // Verify capture happened
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER1');
    });

    it('5枚先取ルール: 先手が5枚とって勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'five_captures');
      if (!state) return;
      state.capturedPieces.PLAYER2 = 4;
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[6][2] = 'PLAYER1'; board[6][3] = 'PLAYER2'; board[8][4] = 'PLAYER1';
      state.board = board; state.currentPlayer = 'PLAYER1';
      state = handleCellClick(state, 8, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 6, 4);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER1');
    });

    it('5枚先取ルール: 後手が5枚とって勝利', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'five_captures');
      if (!state) return;
      state.capturedPieces.PLAYER1 = 4;
      state.currentPlayer = 'PLAYER2';
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[2][2] = 'PLAYER2'; board[2][3] = 'PLAYER1'; board[0][4] = 'PLAYER2';
      state.board = board;
      state = handleCellClick(state, 0, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 2, 4);
      expect(nextState.gameStatus).toBe('GAME_OVER');
      expect(nextState.winner).toBe('PLAYER2');
    });

    it('勝利条件未達の場合はゲームが継続すること', () => {
      let state: GameState | null = setWinCondition(createInitialState(), 'standard');
      if (!state) return;
      state.capturedPieces.PLAYER2 = 3; // P1 has 3
      state.capturedPieces.PLAYER1 = 2; // P2 has 2
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
      board[6][2] = 'PLAYER1'; board[6][3] = 'PLAYER2'; board[8][4] = 'PLAYER1';
      state.board = board; state.currentPlayer = 'PLAYER1';
      state = handleCellClick(state, 8, 4);
      if (!state) return;
      const nextState = handleCellClick(state, 6, 4);
      expect(nextState.capturedPieces.PLAYER2).toBe(4);
      expect(nextState.gameStatus).toBe('PLAYING');
      expect(nextState.winner).toBeNull();
    });
  });

  it('グループキャプチャ（囲み取り）が正しく行われること', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    // Setup a group of 2 opponent pieces
    board[0][1] = 'PLAYER2';
    board[0][2] = 'PLAYER2';
    // Surround them, leaving one liberty at (1,2)
    board[0][0] = 'PLAYER1';
    board[0][3] = 'PLAYER1';
    board[1][1] = 'PLAYER1';
    // board[1][2] is the last liberty
    board[8][2] = 'PLAYER1'; // Moving piece
    let state: GameState | null = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };
    if (!state) return;

    // Move P1 into the last liberty space (1,2) to capture the group
    state = handleCellClick(state, 8, 2);
    if (!state) return;
    const nextState = handleCellClick(state, 1, 2);

    expect(nextState.board[0][1]).toBeNull();
    expect(nextState.board[0][2]).toBeNull();
    expect(nextState.capturedPieces.PLAYER2).toBe(2);
  });

  it('グループキャプチャ（囲み取り）が動ける箇所が一つでもあると実行されないこと', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    board[0][1] = 'PLAYER2';
    board[0][2] = 'PLAYER2';
    // Surround them, but leave one liberty
    board[0][0] = 'PLAYER1';
    // board[0][3] is null (a liberty)
    board[1][1] = 'PLAYER1';
    board[1][2] = 'PLAYER1';
    board[8][0] = 'PLAYER1';
    let state: GameState | null = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };
    if (!state) return;

    state = handleCellClick(state, 8, 0);
    if (!state) return;
    const nextState = handleCellClick(state, 7, 0);

    expect(nextState.board[0][1]).toBe('PLAYER2'); // Not captured
    expect(nextState.capturedPieces.PLAYER2).toBe(0);
  });

  it('isMoveUnsafeエッジケース：相手の駒の間に移動するが、相手は動けないので安全', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    // O P O のような状況で、Pの隣に移動するケース
    board[7][0] = 'PLAYER2';
    board[7][2] = 'PLAYER2';
    board[8][1] = 'PLAYER1'; // The piece to move

    let state: GameState | null = { ...createInitialState(), board };
    if (!state) return;
    // Select P1 at (8,1)
    state = handleCellClick(state, 8, 1);
    if (!state) return;

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

    let state: GameState | null = { ...createInitialState(), board };
    if (!state) return;
    state = handleCellClick(state, 8, 4); // Select the piece
    if (!state) return;

    const captures = state.potentialCaptures;

    expect(captures).toHaveLength(2);
    expect(captures).toEqual(expect.arrayContaining([[6,4], [8,2]]));
  });

  it('自ら挟まれにいった駒は、相手が次の手を指しても取られないこと', () => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    // Player 2's pieces to form a sandwich
    board[1][1] = 'PLAYER2';
    board[1][3] = 'PLAYER2';
    // Player 1's piece that will move into the sandwich
    board[8][2] = 'PLAYER1';
    let state: GameState | null = { ...createInitialState(), board, currentPlayer: 'PLAYER1' };
    if (!state) return;

    // 1. Player 1 moves from (8,2) to (1,2), into the sandwich
    state = handleCellClick(state, 8, 2);
    if (!state) return;
    let nextState: GameState | null = handleCellClick(state, 1, 2);
    if (!nextState) return;

    // Assert that the piece is not captured on its own turn
    expect(nextState.board[1][2]).toBe('PLAYER1');
    expect(nextState.capturedPieces.PLAYER1).toBe(0);
    expect(nextState.currentPlayer).toBe('PLAYER2');

    // 2. Player 2 makes a move that does not form a capture
    // Add a piece for Player 2 to move
    nextState.board[0][0] = 'PLAYER2';
    // Player 2 moves from (0,0) to (2,0)
    nextState = handleCellClick(nextState, 0, 0);
    if (!nextState) return;
    nextState = handleCellClick(nextState, 2, 0);
    if (!nextState) return;

    // Assert that Player 1's piece at (1,2) is STILL not captured
    expect(nextState.board[1][2]).toBe('PLAYER1');
    expect(nextState.capturedPieces.PLAYER1).toBe(0);
    expect(nextState.currentPlayer).toBe('PLAYER1');
  });
});
