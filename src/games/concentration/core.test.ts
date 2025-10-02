import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  calculateHintedIndices,
  Card,
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
      expect(jokers[0].matchId).toBe('Joker');
      expect(jokers[1].matchId).toBe('Joker');
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
      let state = createInitialState();
      // テスト用のペアを探す
      const firstCard = state.board[0];
      const matchingIndex = state.board.findIndex((card, index) => index !== 0 && card.matchId === firstCard.matchId);
      expect(matchingIndex).toBeGreaterThan(-1);

      state = handleCardClick(state, 0);
      state = handleCardClick(state, matchingIndex);

      expect(state.scores.player1).toBe(1);
      expect(state.board[0].isMatched).toBe(true);
      expect(state.board[matchingIndex].isMatched).toBe(true);
      expect(state.flippedIndices.length).toBe(0);
      expect(state.currentPlayer).toBe(1); // ターンは変わらない
      expect(state.status).toBe('player1_turn');
    });

    it('2枚のカードがマッチしなかった時、評価中の状態になる', () => {
      let state = createInitialState();
      // マッチしないカードのペアを確実に見つける
      const firstCard = state.board[0];
      const nonMatchingIndex = state.board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      );
      expect(nonMatchingIndex).toBeGreaterThan(-1);

      state = handleCardClick(state, 0);
      state = handleCardClick(state, nonMatchingIndex);

      expect(state.scores.player1).toBe(0);
      expect(state.board[0].isMatched).toBe(false);
      expect(state.board[nonMatchingIndex].isMatched).toBe(false);
      expect(state.flippedIndices.length).toBe(2);
      expect(state.status).toBe('evaluating');
    });

    it('すでにマッチしたカードはクリックできない', () => {
      let state = createInitialState();
      // テスト用のペアを探す
      const firstCard = state.board[0];
      const matchingIndex = state.board.findIndex((card, index) => index !== 0 && card.matchId === firstCard.matchId);

      state = handleCardClick(state, 0);
      state = handleCardClick(state, matchingIndex); // マッチさせる

      const stateBeforeClick = JSON.parse(JSON.stringify(state));
      const stateAfterClick = handleCardClick(state, 0); // マッチしたカードを再度クリック

      expect(stateAfterClick).toEqual(stateBeforeClick);
    });

    it('クリックしたカードのインデックスをrevealedIndicesに追加する', () => {
      let state = createInitialState();

      // 1枚目をクリック
      state = handleCardClick(state, 5);
      expect(state.revealedIndices).toEqual([5]);

      // 2枚目をクリック
      const nonMatchingIndex = state.board.findIndex(c => c.matchId !== state.board[5].matchId);
      expect(nonMatchingIndex).toBeGreaterThan(-1);
      state = handleCardClick(state, nonMatchingIndex);
      expect(state.revealedIndices).toEqual([5, nonMatchingIndex]);

      // 既にめくったことのあるカードなので、履歴は変わらない
      const stateAfterMismatch = clearNonMatchingFlippedCards(state);
      const finalState = handleCardClick(stateAfterMismatch, 5);
      expect(finalState.revealedIndices).toEqual([5, nonMatchingIndex]);
    });
  });

  describe('clearNonMatchingFlippedCards', () => {
    it('マッチしなかった2枚のカードを裏返し、プレイヤーを交代する', () => {
      let state = createInitialState();
      const firstCard = state.board[0];
      const nonMatchingIndex = state.board.findIndex(
        (card) => card.matchId !== firstCard.matchId
      );
      expect(nonMatchingIndex).toBeGreaterThan(-1);

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
      let state = createInitialState('easy'); // easy (20 cards, 10 pairs)
      const pairs = new Map<string, number[]>();
      state.board.forEach((card, index) => {
        if (!pairs.has(card.matchId)) {
          pairs.set(card.matchId, []);
        }
        pairs.get(card.matchId)!.push(index);
      });

      // Match all but one pair
      const pairEntries = Array.from(pairs.entries());
      for (let i = 0; i < pairEntries.length - 1; i++) {
        const [, indices] = pairEntries[i];
        state.board[indices[0]].isMatched = true;
        state.board[indices[1]].isMatched = true;
      }
      state.scores.player1 = 9;

      // Match the last pair
      const [, lastPairIndices] = pairEntries[pairEntries.length - 1];
      state = handleCardClick(state, lastPairIndices[0]);
      state = handleCardClick(state, lastPairIndices[1]);

      expect(state.status).toBe('game_over');
      expect(state.winner).toBe(1);
      expect(state.scores.player1).toBe(10);
    });
  });

  describe('ヒント機能のロジック (calculateHintedIndices)', () => {
    const findPairs = (board: Card[]): Map<string, number[]> => {
      const matchMap = new Map<string, number[]>();
      board.forEach((card, index) => {
        if (!matchMap.has(card.matchId)) {
          matchMap.set(card.matchId, []);
        }
        matchMap.get(card.matchId)!.push(index);
      });
      return matchMap;
    };

    it('ペア候補が1組だけでは、ヒントは表示されない', () => {
      const state = createInitialState('hard');
      const matchMap = findPairs(state.board);
      const pairs = [...matchMap.values()];

      const revealedIndices = [pairs[0][0], pairs[0][1], pairs[1][0], pairs[2][0]];

      const hinted = calculateHintedIndices(state.board, revealedIndices);
      expect(hinted).toHaveLength(0);
    });

    it('ペア候補が2組以上ある場合、対象のカードがすべてハイライトされる', () => {
      const state = createInitialState('hard');
      const matchMap = findPairs(state.board);
      const pairs = [...matchMap.values()];

      const revealedIndices = [...pairs[0], ...pairs[1]];

      const hinted = calculateHintedIndices(state.board, revealedIndices);

      expect(hinted).toHaveLength(4);
      expect(hinted).toEqual(expect.arrayContaining(revealedIndices));
    });

    it('ペアが成立して候補が1組になると、ヒントは表示されなくなる', () => {
      const state = createInitialState('hard');
      const matchMap = findPairs(state.board);
      const pairs = [...matchMap.values()];

      const revealedIndices = [...pairs[0], ...pairs[1]];
      const initialHinted = calculateHintedIndices(state.board, revealedIndices);
      expect(initialHinted).toHaveLength(4);

      // pair 0 がマッチ済みになる
      state.board[pairs[0][0]].isMatched = true;
      state.board[pairs[0][1]].isMatched = true;

      const afterMatchHinted = calculateHintedIndices(state.board, revealedIndices);

      // pair 0 は除外され、pair 1 のペア候補は1組だけなので、ヒントは表示されない
      expect(afterMatchHinted).toHaveLength(0);
    });
  });
});