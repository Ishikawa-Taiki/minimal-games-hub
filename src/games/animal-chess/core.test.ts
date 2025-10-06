import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCellClick,
  handleCaptureClick,
  getValidMoves,
  getValidDrops,
  OKASHI_TEAM,
  OHANA_TEAM,
  LION,
  CHICK,
  ELEPHANT,
  GIRAFFE,
  ROOSTER,
} from './core';

describe('アニマルチェス コアロジック', () => {
  it('有効な初期状態を作成するべき', () => {
    const state = createInitialState();
    expect(state.board.length).toBe(4);
    expect(state.board[0].length).toBe(3);
    expect(state.currentPlayer).toBe(OKASHI_TEAM);
    expect(state.status).toBe('playing');
    expect(state.board[3][1]?.type).toBe(LION);
    expect(state.board[0][1]?.type).toBe(LION);
  });

  it('有効な手を許可するべき', () => {
    let state = createInitialState();
    // おかしチームがひよこを(2,1)から(1,1)へ移動
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    expect(state.board[2][1]).toBeNull();
    expect(state.board[1][1]?.type).toBe(CHICK);
    expect(state.board[1][1]?.owner).toBe(OKASHI_TEAM);
    expect(state.currentPlayer).toBe(OHANA_TEAM);
  });

  it('相手の駒を捕獲するべき', () => {
    let state = createInitialState();
    // おかしチームがひよこを(2,1)から(1,1)へ移動
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    // おはなチームがぞうを(0,0)から(1,1)へ移動
    state = handleCellClick(state, 0, 0);
    state = handleCellClick(state, 1, 1);

    expect(state.board[1][1]?.type).toBe(ELEPHANT);
    expect(state.board[1][1]?.owner).toBe(OHANA_TEAM);
    expect(state.capturedPieces[OHANA_TEAM]).toContain(CHICK);
    expect(state.currentPlayer).toBe(OKASHI_TEAM);
  });

  it('ひよこをにわとりに成らせるべき', () => {
    let state = createInitialState();
    // 道を空ける
    state.board[1][1] = null;
    // おかしチームがひよこを(2,1)から(1,1)へ移動
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);
    // おはなチームが適当な手を指す
    state = handleCellClick(state, 0, 1);
    state = handleCellClick(state, 1, 0);
    // おかしチームがひよこを(1,1)から(0,1)へ移動して成る
    state = handleCellClick(state, 1, 1);
    state = handleCellClick(state, 0, 1);

    expect(state.board[0][1]?.type).toBe(ROOSTER);
    expect(state.board[0][1]?.owner).toBe(OKASHI_TEAM);
  });

  it('持ち駒を打つことを許可するべき', () => {
    let state = createInitialState();
    state.capturedPieces[OKASHI_TEAM] = [GIRAFFE];

    // 持ち駒のキリンを選択
    state = handleCaptureClick(state, OKASHI_TEAM, 0);
    expect(state.selectedCaptureIndex).toEqual({ player: OKASHI_TEAM, index: 0 });

    // 空のマス(2,2)に打つ
    state = handleCellClick(state, 2, 2);
    expect(state.board[2][2]?.type).toBe(GIRAFFE);
    expect(state.board[2][2]?.owner).toBe(OKASHI_TEAM);
    expect(state.capturedPieces[OKASHI_TEAM].length).toBe(0);
    expect(state.currentPlayer).toBe(OHANA_TEAM);
  });

  it('ライオンが捕獲された時に勝者を宣言するべき', () => {
    let state = createInitialState();
    state.board[0][1] = null; // テストのためにおはなチームのライオンを消す
    state.board[1][1] = { type: LION, owner: OHANA_TEAM }; // 捕獲しやすい位置に配置

    // おかしチームがひよこでライオンを捕獲
    state = handleCellClick(state, 2, 1);
    state = handleCellClick(state, 1, 1);

    expect(state.status).toBe('okashi_win');
  });

  it('ライオンが最終ランクに到達した時（トライ）に勝者を宣言するべき', () => {
    let state = createInitialState();
    // おかしチームのライオンの道を開ける
    state.board[2][1] = null;
    state.board[1][1] = null;
    state.board[0][1] = null;

    // ライオンを前に進める
    state = handleCellClick(state, 3, 1); // select
    state = handleCellClick(state, 2, 1); // move
    state = handleCellClick(state, 0, 0); // gote move
    state = handleCellClick(state, 1, 0); // gote move
    state = handleCellClick(state, 2, 1); // select
    state = handleCellClick(state, 1, 1); // move
    state = handleCellClick(state, 1, 0); // gote move
    state = handleCellClick(state, 2, 0); // gote move
    state = handleCellClick(state, 1, 1); // select
    state = handleCellClick(state, 0, 1); // move & TRY

    expect(state.status).toBe('okashi_win');
  });

  it('駒の有効な移動先を返すべき', () => {
    const state = createInitialState();
    const moves = getValidMoves(state, 3, 1); // おかしチームのライオン
    expect(moves.length).toBe(2); // 自分の駒にブロックされている
  });

  it('有効な駒の配置場所を返すべき', () => {
    const state = createInitialState();
    state.capturedPieces[OKASHI_TEAM] = [CHICK];
    const drops = getValidDrops(state, OKASHI_TEAM, CHICK);
    // 初期盤面は12マスのうち8マスが埋まっているので、空きマスは4つ
    // おかしチームの最終ランク（0段目）は埋まっているので、特に制限はかからない
    expect(drops.length).toBe(4);
  });

  it('ひよこを最終ランクに配置することを許可しないべき', () => {
    const state = createInitialState();
    state.capturedPieces[OKASHI_TEAM] = [CHICK];
    // 配置制限をテストするために最終ランクを空ける
    state.board[0] = [null, null, null];

    const drops = getValidDrops(state, OKASHI_TEAM, CHICK);

    // 最終ランク（0段目）は有効な配置場所に含まれていないはず
    const hasFinalRankDrop = drops.some(d => d.row === 0);
    expect(hasFinalRankDrop).toBe(false);
    // 1段目に3つ、2段目に1つの空きマスがあるので、合計4箇所が有効
    expect(drops.length).toBe(4);
  });

  it('王手（チェック）になるような移動を許可しないべき（未実装、プレースホルダー）', () => {
    // これはコア要件には含まれていない、より複雑なルールのためのプレースホルダーです。
    // 現状では、基本的な移動検証が機能することを確認します。
    let state = createInitialState();
    const originalState = JSON.parse(JSON.stringify(state));
    // 無効な移動を試す（例：キリンが斜めに動く）
    state = handleCellClick(state, 3, 0); // select
    state = handleCellClick(state, 2, 1); // ひよこのいる場所に移動しようとする
    state = handleCellClick(state, 2, 0); // 斜めに移動しようとする
    // 状態は最初の選択試行から変わっていないはず
    state.selectedCell = null; // 比較のために選択をリセット
    originalState.selectedCell = null;
    expect(state.board).toEqual(originalState.board);
  });

  it('持ち駒選択中に自分の盤上の駒をクリックした場合、選択を切り替えるべき', () => {
    let state = createInitialState();
    // 現プレイヤーに持ち駒を追加
    state.capturedPieces[OKASHI_TEAM].push(GIRAFFE);

    // 1. 持ち駒のキリンを選択
    state = handleCaptureClick(state, OKASHI_TEAM, 0);
    expect(state.selectedCaptureIndex).toEqual({ player: OKASHI_TEAM, index: 0 });
    expect(state.selectedCell).toBeNull();

    // 2. 盤上の自分の駒（おかしチームのライオン at 3,1）をクリック
    state = handleCellClick(state, 3, 1);

    // 3. 選択が切り替わったことを確認
    expect(state.selectedCaptureIndex).toBeNull();
    expect(state.selectedCell).toEqual({ row: 3, col: 1 });
  });
});