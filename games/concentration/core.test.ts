import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  calculateHintedIndices,
  GameState,
  Card,
  Rank,
} from './core';

describe('神経衰弱ゲームのコアロジック', () => {
  describe('createInitialState', () => {
    it('デフォルト（easy）で20枚のカードを持つ初期ゲーム状態を正しく生成する', () => {
      const state = createInitialState(); // 'easy'
      expect(state.board.length).toBe(20);
      expect(state.currentPlayer).toBe(1);
      expect(state.scores.player1).toBe(0);
      expect(state.scores.player2).toBe(0);
      expect(state.flippedIndices.length).toBe(0);
      expect(state.status).toBe('player1_turn');
      expect(state.winner).toBeNull();
    });

    it('normal設定で40枚のカードを生成する', () => {
      const state = createInitialState('normal');
      expect(state.board.length).toBe(40);
    });

    it('hard設定で54枚のカードを生成する', () => {
      const state = createInitialState('hard');
      expect(state.board.length).toBe(54);
    });


    it('hard設定でJokerが2枚含まれている', () => {
      const state = createInitialState('hard');
      const jokers = state.board.filter((card) => card.suit === 'Joker');
      expect(jokers.length).toBe(2);
    });

    it('easy, normal設定ではJokerが含まれない', () => {
      const easyState = createInitialState('easy');
      const easyJokers = easyState.board.filter((card) => card.suit === 'Joker');
      expect(easyJokers.length).toBe(0);

      const normalState = createInitialState('normal');
      const normalJokers = normalState.board.filter((card) => card.suit === 'Joker');
      expect(normalJokers.length).toBe(0);
    });

    it('デッキがシャッフルされている', () => {
      const state1 = createInitialState('hard');
      const state2 = createInitialState('hard');
      // 確率的に失敗する可能性はゼロではないが、実用上は十分
      expect(state1.board.map(c => c.id)).not.toEqual(state2.board.map(c => c.id));
    });
  });

  describe('handleCardClick', () => {
    it('1枚目のカードを正しくめくる', () => {
      const initialState = createInitialState();
      const state = handleCardClick(initialState, 0);
      expect(state.board[0].isFlipped).toBe(true);
      expect(state.flippedIndices).toEqual([0]);
    });

    it('2枚のカードがマッチした時、スコアが加算され、カードはマッチ状態になる', () => {
      let state = createInitialState('hard');
      // Jokerのペアを見つけて確実にテストする
      const jokerIndices = state.board
        .map((card, index) => (card.suit === 'Joker' ? index : -1))
        .filter(index => index !== -1);

      const [index1, index2] = jokerIndices;

      state = handleCardClick(state, index1);
      state = handleCardClick(state, index2);

      expect(state.scores.player1).toBe(1);
      expect(state.board[index1].isMatched).toBe(true);
      expect(state.board[index2].isMatched).toBe(true);
      expect(state.flippedIndices.length).toBe(0);
      expect(state.currentPlayer).toBe(1); // ターンは変わらない
      expect(state.status).toBe('player1_turn');
    });

    it('同じランクで異なるスートのカードがマッチすること (normal)', () => {
      let state = createInitialState('normal');
      // '01'ランクのカードを2枚探す
      const rankToTest = '01';
      const indices = state.board
        .map((card, index) =>
          card.rank === rankToTest && card.suit !== 'Joker' ? index : -1
        )
        .filter((index) => index !== -1);

      // normalでは4枚あるはず
      expect(indices.length).toBe(4);
      const [index1, index2] = indices;

      // カードのスートが異なることを確認 (テストの前提条件)
      expect(state.board[index1].suit).not.toEqual(state.board[index2].suit);

      state = handleCardClick(state, index1);
      state = handleCardClick(state, index2);

      expect(state.scores.player1).toBe(1);
      expect(state.board[index1].isMatched).toBe(true);
      expect(state.board[index2].isMatched).toBe(true);
      expect(state.flippedIndices.length).toBe(0);
      expect(state.currentPlayer).toBe(1);
    });

    it('2枚のカードがマッチしなかった時、評価中の状態になる', () => {
      let state = createInitialState();
      // マッチしないカードのペアを確実に見つける
      const firstCard = state.board[0];
      const nonMatchingIndex = state.board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      );

      state = handleCardClick(state, 0);
      state = handleCardClick(state, nonMatchingIndex);

      expect(state.scores.player1).toBe(0);
      expect(state.board[0].isMatched).toBe(false);
      expect(state.board[nonMatchingIndex].isMatched).toBe(false);
      expect(state.flippedIndices.length).toBe(2);
      expect(state.status).toBe('evaluating');
    });

    it('すでにマッチしたカードはクリックできない', () => {
      let state = createInitialState('hard');
      // Jokerのペアを見つけて確実にマッチさせる
      const jokerIndices = state.board
        .map((card, index) => (card.suit === 'Joker' ? index : -1))
        .filter(index => index !== -1);
      const [index1, index2] = jokerIndices;

      state = handleCardClick(state, index1);
      state = handleCardClick(state, index2); // マッチさせる

      const stateBeforeClick = JSON.parse(JSON.stringify(state));
      const stateAfterClick = handleCardClick(state, index1); // マッチしたカードを再度クリック

      expect(stateAfterClick).toEqual(stateBeforeClick);
    });

    it('クリックしたカードのインデックスをrevealedIndicesに追加する', () => {
      let state = createInitialState();

      // 1枚目をクリック
      state = handleCardClick(state, 5);
      expect(state.revealedIndices).toEqual([5]);

      // 2枚目をクリック
      state = handleCardClick(state, 10);
      expect(state.revealedIndices).toEqual([5, 10]);

      // 既にめくったことのあるカードなので、履歴は変わらない
      const stateAfterMismatch = clearNonMatchingFlippedCards(state);
      const finalState = handleCardClick(stateAfterMismatch, 5);
      expect(finalState.revealedIndices).toEqual([5, 10]);
    });
  });

  describe('clearNonMatchingFlippedCards', () => {
    it('マッチしなかった2枚のカードを裏返し、プレイヤーを交代する', () => {
      let state = createInitialState();
      const firstCard = state.board[0];
      const nonMatchingIndex = state.board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      );

      state = handleCardClick(state, 0);
      state = handleCardClick(state, nonMatchingIndex); // ミスマッチ状態

      const newState = clearNonMatchingFlippedCards(state);

      expect(newState.board[0].isFlipped).toBe(false);
      expect(newState.board[nonMatchingIndex].isFlipped).toBe(false);
      expect(newState.flippedIndices.length).toBe(0);
      expect(newState.currentPlayer).toBe(2);
      expect(newState.status).toBe('player2_turn');
    });
  });

  describe('ゲーム終了判定', () => {
    it('全てのカードがマッチした時、ゲームが終了し勝者が決まる', () => {
      let state = createInitialState('hard');

      // 全てのカードをプレイヤー1がマッチさせた状態をシミュレート
      const totalPairs = state.board.length / 2;
      state.scores.player1 = totalPairs - 1;
      state.scores.player2 = 0;

      // 最後の1ペア以外をマッチ済みにする
      state.board.forEach((card, i) => {
        if (i > 1) card.isMatched = true;
      });
      state.board[0].isMatched = false;
      state.board[1].isMatched = false;
      // 最後のペアのmatchIdを同じにする
      state.board[1].matchId = state.board[0].matchId;


      state = handleCardClick(state, 0);
      state = handleCardClick(state, 1);

      expect(state.status).toBe('game_over');
      expect(state.winner).toBe(1);
      expect(state.scores.player1).toBe(totalPairs);
    });
  });

  describe('ヒント機能のロジック (calculateHintedIndices)', () => {
    // Helper to find indices of cards with a specific rank
    const findCardIndicesByRank = (state: GameState, rank: Rank): number[] => {
      return state.board
        .map((card, index) => (card.rank === rank ? index : -1))
        .filter((index) => index !== -1);
    };

    it('ペア候補が1組だけでは、何もハイライトされない', () => {
      const state = createInitialState('hard');
      const r1_indices = findCardIndicesByRank(state, '01');
      const r2_indices = findCardIndicesByRank(state, '02');
      const r3_indices = findCardIndicesByRank(state, '03');
      const revealedIndices = [r1_indices[0], r1_indices[1], r2_indices[0], r3_indices[0]];

      const hinted = calculateHintedIndices(state.board, revealedIndices);
      expect(hinted).toEqual([]);
    });

    it('ペア候補が2組以上ある場合、対象のカードがハイライトされる', () => {
      const state = createInitialState('hard');
      const r1_indices = findCardIndicesByRank(state, '01');
      const r2_indices = findCardIndicesByRank(state, '02');
      const revealedIndices = [...r1_indices, ...r2_indices];

      const hinted = calculateHintedIndices(state.board, revealedIndices);

      expect(hinted).toHaveLength(8); // 4枚 * 2組
      expect(hinted).toEqual(expect.arrayContaining(revealedIndices));
    });

    it('ペアが成立すると、ハイライト対象から除外される', () => {
      const state = createInitialState('hard');
      const r1_indices = findCardIndicesByRank(state, '01');
      const r2_indices = findCardIndicesByRank(state, '02');

      // r1をマッチ済みにする
      state.board[r1_indices[0]].isMatched = true;
      state.board[r1_indices[1]].isMatched = true;
      state.board[r1_indices[2]].isMatched = true;
      state.board[r1_indices[3]].isMatched = true;

      const revealedIndices = [...r1_indices, ...r2_indices];
      const hinted = calculateHintedIndices(state.board, revealedIndices);

      // r1は除外され、r2のペア候補は1組だけなので、ヒントは表示されない
      expect(hinted).toEqual([]);
    });
  });
});
