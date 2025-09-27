import { describe, it, expect } from 'vitest';
import { createGame, gameReducer, GameState, GameAction } from './core';

describe('ドット＆ボックス コアロジック', () => {
  describe('createGame', () => {
    it('「かんたん」レベル（2x2）でゲームを正しく初期化できる', () => {
      const easyState = createGame('easy');
      expect(easyState.boardSize).toEqual({ rows: 2, cols: 2 });
      expect(easyState.lines.horizontal).toHaveLength(3);
      expect(easyState.lines.horizontal.flat()).not.toContain('PLAYER1');
      expect(easyState.lines.vertical).toHaveLength(2);
      expect(easyState.lines.vertical.flat()).not.toContain('PLAYER1');
      expect(easyState.boxes).toHaveLength(2);
      expect(easyState.boxes.flat().every(b => b === null)).toBe(true);
      expect(easyState.currentPlayer).toBe('PLAYER1');
      expect(easyState.scores).toEqual({ PLAYER1: 0, PLAYER2: 0 });
      expect(easyState.winner).toBeNull();
      expect(easyState.status).toBe('playing');
    });

    it('「ふつう」レベル（4x4）でゲームを正しく初期化できる', () => {
      const normalState = createGame('normal');
      expect(normalState.boardSize).toEqual({ rows: 4, cols: 4 });
      expect(normalState.lines.horizontal).toHaveLength(5);
      expect(normalState.lines.vertical).toHaveLength(4);
      expect(normalState.boxes).toHaveLength(4);
    });

    it('「むずかしい」レベル（6x6）でゲームを正しく初期化できる', () => {
      const hardState = createGame('hard');
      expect(hardState.boardSize).toEqual({ rows: 6, cols: 6 });
      expect(hardState.lines.horizontal).toHaveLength(7);
      expect(hardState.lines.vertical).toHaveLength(6);
      expect(hardState.boxes).toHaveLength(6);
    });
  });

  describe('gameReducer', () => {
    it('水平線を正しく引き、プレイヤーが交代する', () => {
      const state = createGame('easy');
      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'horizontal', row: 0, col: 0 },
      };
      const newState = gameReducer(state, action);
      expect(newState.lines.horizontal[0][0]).toBe('PLAYER1');
      expect(newState.currentPlayer).toBe('PLAYER2');
      expect(newState.scores.PLAYER1).toBe(0);
    });

    it('垂直線を正しく引き、プレイヤーが交代する', () => {
      const state = createGame('easy');
      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'vertical', row: 0, col: 0 },
      };
      const newState = gameReducer(state, action);
      expect(newState.lines.vertical[0][0]).toBe('PLAYER1');
      expect(newState.currentPlayer).toBe('PLAYER2');
    });

    it('すでに引かれたラインは引けない', () => {
      let state = createGame('easy');
      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'horizontal', row: 0, col: 0 },
      };
      state = gameReducer(state, action); // PLAYER1が引く
      const newState = gameReducer(state, action); // PLAYER2が同じ線を引こうとする
      expect(newState).toEqual(state);
    });

    it('ボックスを完成させると、スコアが加算され、同じプレイヤーのターンが続く', () => {
      let state = createGame('easy');
      state.lines.horizontal[0][0] = 'PLAYER2';
      state.lines.vertical[0][0] = 'PLAYER2';
      state.lines.vertical[0][1] = 'PLAYER2';

      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'horizontal', row: 1, col: 0 },
      };
      const newState = gameReducer(state, action);

      expect(newState.boxes[0][0]).toBe('PLAYER1');
      expect(newState.scores.PLAYER1).toBe(1);
      expect(newState.currentPlayer).toBe('PLAYER1');
    });

    it('最後のボックスを完成させてゲームが終了し、勝者が決まる', () => {
      // 1x1の盤面で、3辺が埋まっている状態を準備
      const state: GameState = {
        boardSize: { rows: 1, cols: 1 },
        lines: {
          horizontal: [['PLAYER1'], [null]],
          vertical: [['PLAYER1', 'PLAYER1']],
        },
        boxes: [[null]],
        currentPlayer: 'PLAYER2',
        scores: { PLAYER1: 0, PLAYER2: 0 },
        status: 'playing',
        winner: null,
        difficulty: 'easy',
      };

      // PLAYER2が最後の1辺を引いてボックスを完成させる
      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'horizontal', row: 1, col: 0 },
      };
      const newState = gameReducer(state, action);

      // ボックスがPLAYER2のものになる
      expect(newState.boxes[0][0]).toBe('PLAYER2');
      // スコアが加算される
      expect(newState.scores).toEqual({ PLAYER1: 0, PLAYER2: 1 });
      // ゲームが終了する
      expect(newState.status).toBe('ended');
      // 勝者が決まる
      expect(newState.winner).toBe('PLAYER2');
    });

    it('引き分けでゲームが終了する', () => {
      // 1x2の盤面で、PLAYER1が1箱、PLAYER2が0箱の状態で最後の1箱が完成間近の状態
      const state: GameState = {
        boardSize: { rows: 1, cols: 2 },
        lines: {
          horizontal: [['PLAYER1', 'PLAYER1'], ['PLAYER1', null]],
          vertical: [['PLAYER1', 'PLAYER1', 'PLAYER2']],
        },
        boxes: [['PLAYER1', null]],
        currentPlayer: 'PLAYER2',
        scores: { PLAYER1: 1, PLAYER2: 0 },
        status: 'playing',
        winner: null,
        difficulty: 'easy',
      };

      // PLAYER2が最後の1辺を引いてボックスを完成させる
      const action: GameAction = {
        type: 'DRAW_LINE',
        payload: { lineType: 'horizontal', row: 1, col: 1 },
      };
      const newState = gameReducer(state, action);

      // 最後のボックスがPLAYER2のものになる
      expect(newState.boxes[0][1]).toBe('PLAYER2');
      // スコアが加算される
      expect(newState.scores).toEqual({ PLAYER1: 1, PLAYER2: 1 });
      // ゲームが終了する
      expect(newState.status).toBe('ended');
      // 引き分けになる
      expect(newState.winner).toBe('DRAW');
    });
  });
});