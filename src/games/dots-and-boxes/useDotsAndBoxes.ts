import { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import {
  createInitialState,
  selectLine as coreSelectLine,
  calculateRemainingLinesCounts,
  getPreview,
  type Difficulty,
  type GameState,
  type Player,
  type Preview,
} from './core';
import type {
  HintableGameController,
} from '@/core/types/game';
import { useDialog } from '@/app/components/ui/DialogProvider';

import { DisplayInfo } from '@/core/types/game';

export type DotsAndBoxesController = HintableGameController<GameState, Action> & {
  setDifficulty: (difficulty: Difficulty) => void;
  selectLine: (r: number, c: number, type: 'h' | 'v') => void;
  getPlayerDisplayName: (player: Player) => string;
  remainingLinesCounts: number[][];
  preview: Preview | null;
  displayInfo: DisplayInfo;
};

type Action =
  | { type: 'SELECT_LINE'; payload: { r: number; c: number; type: 'h' | 'v' } }
  | { type: 'START_GAME'; payload: { difficulty: Difficulty } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS'; payload: { enabled: boolean } };

const initialGameState = createInitialState('easy');

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.payload.difficulty);
    case 'RESET_GAME':
      return { ...initialGameState, status: 'waiting' };
    case 'SELECT_LINE':
      return coreSelectLine(
        state,
        action.payload.r,
        action.payload.c,
        action.payload.type
      );
    case 'SET_HINTS':
      return { ...state, hintsEnabled: action.payload.enabled };
    default:
      return state;
  }
};

export const useDotsAndBoxes = (): DotsAndBoxesController => {
  const [gameState, dispatch] = useReducer(reducer, {
    ...initialGameState,
    status: 'waiting',
  });
  const [preview, setPreview] = useState<Preview | null>(null);
  const { alert } = useDialog();

  const getPlayerDisplayName = useCallback((player: Player): string => {
    return player === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const { status, winner, scores } = gameState;
  useEffect(() => {
    if (status === 'ended' && winner) {
      let title;
      let message;
      if (winner === 'draw') {
        title = 'ひきわけ！';
        message = `てにいれた かず: ${scores.player1}`;
      } else {
        const winnerName = getPlayerDisplayName(winner);
        title = `${winnerName}のかち！`;
        message = `プレイヤー1: ${scores.player1}, プレイヤー2: ${scores.player2}`;
      }
      alert({ title, message }).then(resetGame);
    }
  }, [status, winner, scores, alert, resetGame, getPlayerDisplayName]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', payload: { difficulty } });
  }, []);

  const handleLineSelection = useCallback(
    (r: number, c: number, type: 'h' | 'v') => {
      const line = type === 'h' ? gameState.hLines[r][c] : gameState.vLines[r][c];
      if (line.owner) return;

      if (!gameState.hintsEnabled) {
        dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
        return;
      }

      const newPreview = getPreview(gameState, r, c, type);
      if (preview && preview.line.r === r && preview.line.c === c && preview.line.type === type) {
        dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
        setPreview(null);
      } else {
        setPreview(newPreview);
      }
    },
    [gameState, preview]
  );

  const setHints = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'SET_HINTS', payload: { enabled } });
      if (!enabled) {
        setPreview(null);
      }
    },
    []
  );

  const hintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
  }), [gameState.hintsEnabled]);


  const remainingLinesCounts = useMemo(() => {
    if (!gameState.hintsEnabled || gameState.status !== 'playing') {
      return Array(gameState.rows).fill(Array(gameState.cols).fill(0));
    }
    return calculateRemainingLinesCounts(gameState);
  }, [gameState]);

  const displayInfo = useMemo((): DisplayInfo => {
    if (gameState.status === 'ended') {
      if (gameState.winner === 'draw') {
        return { statusText: 'ひきわけ' };
      }
      const winnerName = getPlayerDisplayName(gameState.winner as Player);
      return { statusText: `${winnerName}のかち！` };
    }
    if (gameState.status === 'waiting') {
      return { statusText: 'むずかしさをえらんでね' };
    }
    const playerName = getPlayerDisplayName(gameState.currentPlayer);
    return { statusText: `「${playerName}」のばん` };
  }, [gameState.status, gameState.winner, gameState.currentPlayer, getPlayerDisplayName]);


  return {
    gameState,
    dispatch,
    resetGame,
    setDifficulty,
    selectLine: handleLineSelection,
    setHints,
    hintState,
    getPlayerDisplayName,
    remainingLinesCounts,
    preview,
    displayInfo,
    isTurnOnly: true,
  };
};