import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  handleCaptureClick,
  getValidMoves,
  GameState,
  Player,
  PieceType,
} from './core';

describe('Animal Chess Core Logic', () => {
  describe('初期状態の生成', () => {
    it('createInitialStateが正しい初期盤面を生成するべき', () => {
      const state = createInitialState();
      expect(state.board[0][1]?.type).toBe(PieceType.LION);
      expect(state.board[0][1]?.owner).toBe(Player.GOTE);
      expect(state.board[3][1]?.type).toBe(PieceType.LION);
      expect(state.board[3][1]?.owner).toBe(Player.SENTE);
      expect(state.currentPlayer).toBe(Player.SENTE);
      expect(state.capturedPieces[Player.SENTE]).toEqual([]);
      expect(state.capturedPieces[Player.GOTE]).toEqual([]);
      expect(state.status).toBe('playing');
    });
  });

  describe('駒の移動', () => {
    it('先手のひよこが正しく前に1マス進めるべき', () => {
      const state = createInitialState();
      // Select Chick at (2, 1)
      let nextState = handleCellClick(state, 2, 1);
      // Move to (1, 1)
      nextState = handleCellClick(nextState, 1, 1);

      expect(nextState.board[2][1]).toBeNull();
      expect(nextState.board[1][1]?.type).toBe(PieceType.CHICK);
      expect(nextState.board[1][1]?.owner).toBe(Player.SENTE);
      expect(nextState.currentPlayer).toBe(Player.GOTE);
    });

    it('不正な移動は無視されるべき', () => {
      const state = createInitialState();
      // Select Chick at (2, 1)
      let nextState = handleCellClick(state, 2, 1);
      // Try to move to (0, 1) which is an invalid move
      nextState = handleCellClick(nextState, 0, 1);

      // State should not change
      expect(nextState.board).toEqual(state.board);
      expect(nextState.currentPlayer).toBe(Player.SENTE);
    });
  });

  describe('駒の獲得', () => {
    it('相手の駒を獲得し、持ち駒に加えるべき', () => {
        let state = createInitialState();
        // Manually place pieces for a clear capture scenario.
        state.board[1][1] = { type: PieceType.LION, owner: Player.SENTE };
        state.board[2][1] = { type: PieceType.CHICK, owner: Player.GOTE };
        state.currentPlayer = Player.SENTE;

        // SENTE Lion at (1,1) captures GOTE Chick at (2,1)
        let nextState = handleCellClick(state, 1, 1);
        nextState = handleCellClick(nextState, 2, 1);

        expect(nextState.board[1][1]).toBeNull();
        expect(nextState.board[2][1]?.type).toBe(PieceType.LION);
        expect(nextState.capturedPieces[Player.SENTE]).toContain(PieceType.CHICK);
        expect(nextState.currentPlayer).toBe(Player.GOTE);
    });
  });

  describe('駒の成り', () => {
    it('ひよこが敵陣最終列で「にわとり」に成るべき', () => {
        let state = createInitialState();
        state.board[1][1] = { type: PieceType.CHICK, owner: Player.SENTE };
        state.board[2][1] = null; // Clear path
        state.currentPlayer = Player.SENTE;

        // SENTE Chick moves to the final rank (row 0)
        let nextState = handleCellClick(state, 1, 1);
        nextState = handleCellClick(nextState, 0, 1);

        expect(nextState.board[0][1]?.type).toBe(PieceType.ROOSTER);
        expect(nextState.board[0][1]?.owner).toBe(Player.SENTE);
    });
  });

  describe('持ち駒の配置', () => {
    it('持ち駒を盤上の空きマスに配置できるべき', () => {
        let state = createInitialState();
        state.capturedPieces[Player.SENTE] = [PieceType.CHICK];

        // Select captured chick
        let nextState = handleCaptureClick(state, Player.SENTE, 0);
        // Place it on an empty square (2,2)
        nextState = handleCellClick(nextState, 2, 2);

        expect(nextState.board[2][2]?.type).toBe(PieceType.CHICK);
        expect(nextState.board[2][2]?.owner).toBe(Player.SENTE);
        expect(nextState.capturedPieces[Player.SENTE]).toEqual([]);
        expect(nextState.currentPlayer).toBe(Player.GOTE);
    });

    it('ひよこを敵陣最終列には配置できないべき', () => {
        let state = createInitialState();
        state.capturedPieces[Player.SENTE] = [PieceType.CHICK];
        state.board[0][2] = null; // Create an empty spot in the final rank

        // Select captured chick
        let nextState = handleCaptureClick(state, Player.SENTE, 0);
        // Try to place it on the final rank (row 0)
        nextState = handleCellClick(nextState, 0, 2);

        // State should not change
        expect(nextState.board[0][2]).toBeNull();
        expect(nextState.currentPlayer).toBe(Player.SENTE);
    });
  });

  describe('勝利条件', () => {
    it('相手のライオンを獲得したら勝利するべき', () => {
        let state = createInitialState();
        // Clear original lions for a clean test setup
        state.board[0][1] = null;
        state.board[3][1] = null;
        // Place lions for capture scenario
        state.board[1][1] = { type: PieceType.LION, owner: Player.SENTE };
        state.board[2][1] = { type: PieceType.LION, owner: Player.GOTE };
        state.currentPlayer = Player.SENTE;

        // SENTE Lion at (1,1) captures GOTE Lion at (2,1)
        let nextState = handleCellClick(state, 1, 1);
        nextState = handleCellClick(nextState, 2, 1);

        expect(nextState.status).toBe('sente_win');
    });

    it('ライオンが敵陣最終列に到達したら勝利するべき (トライ)', () => {
        let state = createInitialState();
        state.board[1][1] = { type: PieceType.LION, owner: Player.SENTE };
        state.currentPlayer = Player.SENTE;

        let nextState = handleCellClick(state, 1, 1);
        nextState = handleCellClick(nextState, 0, 1);

        expect(nextState.status).toBe('sente_win');
    });
  });

  describe('getValidMoves', () => {
    it('ライオンの動きが8方向すべて正しいか検証する', () => {
        const state = createInitialState();
        // Place a SENTE lion at the center of a clear area
        state.board[2][1] = { type: PieceType.LION, owner: Player.SENTE };
        state.board[3][1] = null; // Clear the original lion spot
        const moves = getValidMoves(state, 2, 1);

        // Should be 8 moves, but some are blocked by own pieces
        const expectedMoves = [
            { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
            { row: 2, col: 0 }, { row: 2, col: 2 },
            { row: 3, col: 1 }, // This move is now valid
            // (3,0) and (3,2) are blocked by own elephant and giraffe
        ];

        expect(moves).toHaveLength(6);
        expect(moves).toEqual(expect.arrayContaining(expectedMoves));
    });
  });
});
