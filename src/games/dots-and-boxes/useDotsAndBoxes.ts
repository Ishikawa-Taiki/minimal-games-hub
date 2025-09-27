import { useCallback, useMemo, useReducer, useState } from 'react';
import {
  Difficulty,
  GameController,
  HintableGameController,
  ScoreInfo,
} from '@/core/types/game';
import {
  createGame,
  gameReducer,
  GameState,
  GameAction,
  Player,
  DrawLinePayload,
} from './core';

export type DotsAndBoxesController = Omit<
  GameController<GameState, GameAction>,
  'dispatch'
> &
  HintableGameController & {
    getScoreInfo: () => ScoreInfo | null;
    drawLine: (payload: DrawLinePayload) => void;
    displayInfo: { statusText: string };
    setDifficulty: (difficulty: Difficulty) => void;
  };

const initialWaitingState: GameState = {
  boardSize: { rows: 0, cols: 0 },
  lines: { horizontal: [], vertical: [] },
  boxes: [],
  currentPlayer: 'PLAYER1',
  scores: { PLAYER1: 0, PLAYER2: 0 },
  status: 'waiting',
  winner: null,
  difficulty: 'easy',
};

export const useDotsAndBoxes = (): DotsAndBoxesController => {
  const [gameState, dispatch] = useReducer(gameReducer, initialWaitingState);
  const [hintsEnabled, setHintsEnabled] = useState(false);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({
      type: 'RESET',
      payload: createGame(difficulty),
    });
  }, []);

  const resetGame = useCallback(() => {
    if (gameState.status !== 'waiting') {
      dispatch({
        type: 'RESET',
        payload: createGame(gameState.difficulty),
      });
    }
  }, [gameState.difficulty, gameState.status]);

  const drawLine = useCallback((payload: DrawLinePayload) => {
    dispatch({ type: 'DRAW_LINE', payload });
  }, []);

  const setHints = useCallback((enabled: boolean) => {
    setHintsEnabled(enabled);
  }, []);

  const getPlayerName = (player: Player) => {
    return player === 'PLAYER1' ? 'プレイヤー1' : 'プレイヤー2';
  };

  const displayInfo = useMemo(() => {
    if (gameState.status === 'ended') {
      if (gameState.winner === 'DRAW') {
        return { statusText: 'ひきわけ' };
      }
      const winnerName = getPlayerName(gameState.winner as Player);
      return { statusText: `${winnerName}のかち` };
    }
    if (gameState.status === 'playing') {
      const playerName = getPlayerName(gameState.currentPlayer);
      return { statusText: `「${playerName}」のばん` };
    }
    return { statusText: 'むずかしさをえらんでね' };
  }, [gameState.status, gameState.winner, gameState.currentPlayer]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (gameState.status === 'waiting') return null;
    return {
      title: 'かくとくすう',
      items: [
        { label: 'プレイヤー1', value: gameState.scores.PLAYER1 },
        { label: 'プレイヤー2', value: gameState.scores.PLAYER2 },
      ],
    };
  }, [gameState.scores, gameState.status]);

  return {
    gameState: {
      ...gameState,
      hintsEnabled,
    },
    resetGame,
    setDifficulty,
    drawLine,
    setHints,
    displayInfo,
    getScoreInfo,
  };
};