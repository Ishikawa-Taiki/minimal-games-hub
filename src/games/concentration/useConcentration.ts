"use client";

import { useReducer, useEffect, useState, useCallback } from 'react';
import {
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  GameState,
  Difficulty,
} from './core';
import { GameController, HintableGameController, ScoreInfo } from '@/core/types/game';

type ConcentrationAction =
  | { type: 'FLIP_CARD'; payload: number }
  | { type: 'CLEAR_NON_MATCHING' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty };

const reducer = (state: GameState, action: ConcentrationAction): GameState => {
  switch (action.type) {
    case 'FLIP_CARD':
      return handleCardClick(state, action.payload);
    case 'CLEAR_NON_MATCHING':
      return clearNonMatchingFlippedCards(state);
    case 'RESET_GAME':
      if (!state.difficulty) return createInitialState('easy');
      return createInitialState(state.difficulty);
    case 'SET_DIFFICULTY':
      return createInitialState(action.payload);
    default:
      return state;
  }
};

export const useConcentration = (): GameController & HintableGameController => {
  const [gameState, dispatch] = useReducer(reducer, {
    difficulty: null,
    board: [],
    currentPlayer: 1,
    scores: { player1: 0, player2: 0 },
    flippedIndices: [],
    revealedIndices: [],
    newlyMatchedIndices: [],
    hintedIndices: [],
    status: 'waiting',
    winner: null,
  });
  const [hintState, setHintState] = useState({ enabled: false, type: 'strong' as const });

  useEffect(() => {
    if (gameState.status === 'evaluating') {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NON_MATCHING' });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState.status]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const handleCardClickWithDispatch = useCallback((index: number) => {
    dispatch({ type: 'FLIP_CARD', payload: index });
  }, [dispatch]);

  const getDisplayStatus = useCallback(() => {
    switch (gameState.status) {
      case 'player1_turn':
        return 'プレイヤー1の番';
      case 'player2_turn':
        return 'プレイヤー2の番';
      case 'evaluating':
        return '判定中...';
      case 'game_over':
        if (gameState.winner === 'draw') return '引き分け！';
        return `プレイヤー${gameState.winner}の勝ち！`;
      default:
        return '難易度を選択してください';
    }
  }, [gameState.status, gameState.winner]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (gameState.status === 'waiting') return null;
    return {
      title: '獲得ペア数',
      items: [
        { label: 'プレイヤー1', value: `${gameState.scores.player1}個` },
        { label: 'プレイヤー2', value: `${gameState.scores.player2}個` },
      ],
    };
  }, [gameState.scores, gameState.status]);

  return {
    gameState,
    hintState,
    setHints: setHintState,
    setDifficulty,
    resetGame,
    handleCardClick: handleCardClickWithDispatch,
    getDisplayStatus,
    getScoreInfo,
    dispatch,
  };
};