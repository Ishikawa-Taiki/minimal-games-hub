import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  selectStick,
  handleTakeSticks,
} from './core';

describe('棒消しゲームのコアロジック', () => {
  describe('createInitialState', () => {
    it('かんたんモードで正しく初期化されること', () => {
      const state = createInitialState('easy');
      expect(state.rows.length).toBe(3);
      expect(state.rows[0].length).toBe(1);
      expect(state.rows[1].length).toBe(3);
      expect(state.rows[2].length).toBe(5);
      expect(state.currentPlayer).toBe('プレイヤー1');
      expect(state.winner).toBeNull();
    });

    it('ふつうモードで正しく初期化されること', () => {
      const state = createInitialState('normal');
      expect(state.rows.length).toBe(5);
      expect(state.rows[4].length).toBe(9);
    });

    it('むずかしいモードで正しく初期化されること', () => {
      const state = createInitialState('hard');
      expect(state.rows.length).toBe(7);
      expect(state.rows[6].length).toBe(13);
    });
  });

  describe('selectStick', () => {
    it('1本の棒を選択できること', () => {
      let state = createInitialState('easy');
      const stickToSelect = state.rows[1][1];
      state = selectStick(state, 1, stickToSelect.id);
      expect(state.selectedSticks).toHaveLength(1);
      expect(state.selectedSticks[0]).toEqual({ row: 1, stickId: stickToSelect.id });
    });

    it('連続した複数の棒を選択できること', () => {
      let state = createInitialState('easy');
      const stick1 = state.rows[2][1];
      const stick2 = state.rows[2][2];

      state = selectStick(state, 2, stick1.id);
      state = selectStick(state, 2, stick2.id);

      expect(state.selectedSticks).toHaveLength(2);
      expect(state.selectedSticks).toEqual(
        expect.arrayContaining([
          { row: 2, stickId: stick1.id },
          { row: 2, stickId: stick2.id },
        ])
      );
    });

    it('異なる段の棒を選択すると選択がリセットされること', () => {
      let state = createInitialState('easy');
      const stick1 = state.rows[1][0];
      const stick2 = state.rows[2][0];

      state = selectStick(state, 1, stick1.id);
      state = selectStick(state, 2, stick2.id);

      expect(state.selectedSticks).toHaveLength(1);
      expect(state.selectedSticks[0]).toEqual({ row: 2, stickId: stick2.id });
    });

    it('選択済みの棒を再度選択すると選択解除されること', () => {
      let state = createInitialState('easy');
      const stick = state.rows[1][0];

      state = selectStick(state, 1, stick.id);
      state = selectStick(state, 1, stick.id);

      expect(state.selectedSticks).toHaveLength(0);
    });

    it('連続していない棒を選択すると、後から選択した棒のみが選択状態になること', () => {
      let state = createInitialState('easy');
      const stick1 = state.rows[2][1];
      const stick2 = state.rows[2][3];

      state = selectStick(state, 2, stick1.id);
      state = selectStick(state, 2, stick2.id);

      expect(state.selectedSticks).toHaveLength(1);
      expect(state.selectedSticks[0]).toEqual({ row: 2, stickId: stick2.id });
    });
  });

  describe('handleTakeSticks', () => {
    it('選択した棒が消去されること', () => {
      let state = createInitialState('easy');
      const stick1 = state.rows[2][1];
      const stick2 = state.rows[2][2];

      state = selectStick(state, 2, stick1.id);
      state = selectStick(state, 2, stick2.id);

      const newState = handleTakeSticks(state);

      expect(newState.rows[2].find(s => s.id === stick1.id)?.isTaken).toBe(true);
      expect(newState.rows[2].find(s => s.id === stick2.id)?.isTaken).toBe(true);
      expect(newState.selectedSticks).toHaveLength(0);
    });

    it('棒を消した後、プレイヤーが交代すること', () => {
      let state = createInitialState('easy');
      state = selectStick(state, 0, state.rows[0][0].id);
      const newState = handleTakeSticks(state);
      expect(newState.currentPlayer).toBe('プレイヤー2');
    });

    it('最後の棒を取った場合に勝者が決まること', () => {
      let state = createInitialState('easy');

      // 最後の1本以外をすべて取得済みにする
      state.rows = state.rows.map(row =>
        row.map(stick => ({...stick, isTaken: true}))
      );
      state.rows[2][4].isTaken = false;

      // 最後の1本を選択する
      const lastStick = state.rows[2][4];
      state = selectStick(state, 2, lastStick.id);

      const newState = handleTakeSticks(state);
      expect(newState.winner).toBe('プレイヤー2');
    });
  });
});
