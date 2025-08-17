import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  GameState,
  Card,
} from './core';

describe('神経衰弱ゲームのコアロジック', () => {
  describe('createInitialState', () => {
    it('54枚のカードを持つ初期ゲーム状態を正しく生成する', () => {
      const state = createInitialState();
      expect(state.board.length).toBe(54);
      expect(state.currentPlayer).toBe(1);
      expect(state.scores.player1).toBe(0);
      expect(state.scores.player2).toBe(0);
      expect(state.flippedIndices.length).toBe(0);
      expect(state.status).toBe('player1_turn');
      expect(state.winner).toBeNull();
    });

    it('Jokerが2枚含まれている', () => {
      const state = createInitialState();
      const jokers = state.board.filter((card) => card.suit === 'Joker');
      expect(jokers.length).toBe(2);
    });

    it('デッキがシャッフルされている', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();
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
      let state = createInitialState();
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
      let state = createInitialState();

      // 全てのカードをプレイヤー1がマッチさせた状態をシミュレート
      state.scores.player1 = 26;
      state.scores.player2 = 0;
      state.board.forEach(card => card.isMatched = true);
      // 最後の1ペアをマッチさせる
      state.board[0].isMatched = false;
      state.board[1].isMatched = false;
      state.board[0].matchId = 'test_pair';
      state.board[1].matchId = 'test_pair';

      state = handleCardClick(state, 0);
      state = handleCardClick(state, 1);

      expect(state.status).toBe('game_over');
      expect(state.winner).toBe(1);
      expect(state.scores.player1).toBe(27);
    });
  });
});
