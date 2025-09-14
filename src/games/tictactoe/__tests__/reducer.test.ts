import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ticTacToeReducer, 
  createInitialTicTacToeState, 
  TicTacToeAction,
  TicTacToeGameState 
} from '../reducer';

describe('ticTacToeReducer', () => {
  let initialState: TicTacToeGameState;

  beforeEach(() => {
    initialState = createInitialTicTacToeState();
  });

  describe('初期状態', () => {
    it('正しい初期状態を生成する', () => {
      expect(initialState.currentPlayer).toBe('O');
      expect(initialState.status).toBe('playing');
      expect(initialState.winner).toBeNull();
      expect(initialState.isDraw).toBe(false);
      expect(initialState.board).toHaveLength(3);
      expect(initialState.board[0]).toHaveLength(3);
      expect(initialState.hintLevel).toBe(0);
    });
  });

  describe('MAKE_MOVE アクション', () => {
    it('有効な移動で状態が更新される', () => {
      const action: TicTacToeAction = { type: 'MAKE_MOVE', row: 0, col: 0 };
      const newState = ticTacToeReducer(initialState, action);

      expect(newState.board[0][0]).toBe('O');
      expect(newState.currentPlayer).toBe('X');
      expect(newState.status).toBe('playing');
      expect(newState).not.toBe(initialState); // 新しいオブジェクトが返される
    });

    it('無効な移動では状態が変更されない', () => {
      // 既に埋まっているセルに移動を試行
      const state = ticTacToeReducer(initialState, { type: 'MAKE_MOVE', row: 0, col: 0 });
      const invalidMoveState = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 0, col: 0 });

      expect(invalidMoveState).toBe(state); // 同じオブジェクトが返される
    });

    it('勝利条件を正しく検出する', () => {
      let state = initialState;
      
      // O の勝利パターンを作成 (上段横一列)
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 0, col: 0 }); // O
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 1, col: 0 }); // X
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 0, col: 1 }); // O
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 1, col: 1 }); // X
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 0, col: 2 }); // O (勝利)

      expect(state.winner).toBe('O');
      expect(state.status).toBe('ended');
      expect(state.winningLines).toBeTruthy();
    });

    it('引き分けを正しく検出する', () => {
      let state = initialState;
      
      // 引き分けパターンを作成
      const moves = [
        [0, 0], // O
        [0, 1], // X
        [0, 2], // O
        [1, 0], // X
        [1, 2], // O
        [1, 1], // X
        [2, 0], // O
        [2, 2], // X
        [2, 1], // O
      ];

      moves.forEach(([row, col]) => {
        state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row, col });
      });

      expect(state.isDraw).toBe(true);
      expect(state.status).toBe('ended');
      expect(state.winner).toBeNull();
    });
  });

  describe('RESET_GAME アクション', () => {
    it('ゲームを初期状態にリセットする', () => {
      let state = initialState;
      
      // いくつかの移動を実行
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 0, col: 0 });
      state = ticTacToeReducer(state, { type: 'MAKE_MOVE', row: 1, col: 1 });
      state = ticTacToeReducer(state, { type: 'SET_HINTS_ENABLED', enabled: true });

      // リセット
      const resetState = ticTacToeReducer(state, { type: 'RESET_GAME' });

      expect(resetState).toEqual(initialState);
      expect(resetState).not.toBe(state); // 新しいオブジェクトが返される
    });
  });

  describe('SET_HINTS_ENABLED アクション', () => {
    it('ヒント機能を有効にする', () => {
      const action: TicTacToeAction = { type: 'SET_HINTS_ENABLED', enabled: true };
      const newState = ticTacToeReducer(initialState, action);

      expect(newState.hintLevel).toBe(1);
      expect(newState).not.toBe(initialState);
    });

    it('ヒント機能を無効にする', () => {
      const enabledState = ticTacToeReducer(initialState, { type: 'SET_HINTS_ENABLED', enabled: true });
      const disabledState = ticTacToeReducer(enabledState, { type: 'SET_HINTS_ENABLED', enabled: false });

      expect(disabledState.hintLevel).toBe(0);
    });
  });

  describe('純粋関数としての性質', () => {
    it('同じ入力に対して同じ出力を返す', () => {
      const action: TicTacToeAction = { type: 'MAKE_MOVE', row: 1, col: 1 };
      
      const result1 = ticTacToeReducer(initialState, action);
      const result2 = ticTacToeReducer(initialState, action);

      expect(result1).toEqual(result2);
    });

    it('元の状態を変更しない', () => {
      const originalState = { ...initialState };
      const action: TicTacToeAction = { type: 'MAKE_MOVE', row: 1, col: 1 };
      
      ticTacToeReducer(initialState, action);

      expect(initialState).toEqual(originalState);
    });
  });

  describe('複雑なゲームシーケンス', () => {
    it('複数のアクションを順次実行して正しい状態になる', () => {
      const actions: TicTacToeAction[] = [
        { type: 'SET_HINTS_ENABLED', enabled: true },
        { type: 'MAKE_MOVE', row: 1, col: 1 }, // O
        { type: 'MAKE_MOVE', row: 0, col: 0 }, // X
        { type: 'MAKE_MOVE', row: 0, col: 1 }, // O
        { type: 'MAKE_MOVE', row: 2, col: 1 }, // X
        { type: 'MAKE_MOVE', row: 2, col: 2 }, // O
      ];

      let state = initialState;
      actions.forEach(action => {
        state = ticTacToeReducer(state, action);
      });

      expect(state.hintLevel).toBe(1);
      expect(state.board[1][1]).toBe('O');
      expect(state.board[0][0]).toBe('X');
      expect(state.board[0][1]).toBe('O');
      expect(state.board[2][1]).toBe('X');
      expect(state.board[2][2]).toBe('O');
      expect(state.currentPlayer).toBe('X');
    });
  });
});