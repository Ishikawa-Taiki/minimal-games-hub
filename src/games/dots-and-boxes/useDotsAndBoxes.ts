import { useReducer, useCallback, useMemo } from 'react';
import {
  createInitialState,
  selectLine,
  type Box,
  type Difficulty,
  type GameState,
  type Line,
  type Player,
} from './core';
import type {
  BaseGameController,
  HintableGameController,
  DisplayInfo,
} from '@/core/types/game';

export type DotsAndBoxesController = BaseGameController<GameState, Action> &
  HintableGameController<GameState, Action> & {
    setDifficulty: (difficulty: Difficulty) => void;
    selectLine: (r: number, c: number, type: 'h' | 'v') => void;
    setPreview: (
      r: number | null,
      c: number | null,
      type: 'h' | 'v' | null
    ) => void;
    getPlayerDisplayName: (player: Player) => string;
  };

type Action =
  | { type: 'SELECT_LINE'; payload: { r: number; c: number; type: 'h' | 'v' } }
  | { type: 'START_GAME'; payload: { difficulty: Difficulty } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS'; payload: { enabled: boolean } }
  | {
      type: 'SET_PREVIEW';
      payload: { r: number; c: number; type: 'h' | 'v' } | null;
    };

const initialGameState: GameState = {
  difficulty: 'easy',
  rows: 0,
  cols: 0,
  hLines: [],
  vLines: [],
  boxes: [],
  currentPlayer: 'player1',
  scores: { player1: 0, player2: 0 },
  status: 'waiting',
  winner: null,
  remainingLines: 0,
  hintsEnabled: false,
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.payload.difficulty);
    case 'RESET_GAME':
      return createInitialState(state.difficulty);
    case 'SELECT_LINE':
      return selectLine(
        state,
        action.payload.r,
        action.payload.c,
        action.payload.type
      );
    case 'SET_HINTS':
      return { ...state, hintsEnabled: action.payload.enabled };
    case 'SET_PREVIEW': {
      const newState = JSON.parse(JSON.stringify(state));
      newState.hLines.forEach((row: Line[]) => row.forEach((line: Line) => (line.preview = null)));
      newState.vLines.forEach((row: Line[]) => row.forEach((line: Line) => (line.preview = null)));
      newState.boxes.forEach((row: Box[]) => row.forEach((box: Box) => (box.preview = null)));

      if (action.payload) {
        const { r, c, type } = action.payload;
        if (type === 'h') newState.hLines[r][c].preview = newState.currentPlayer;
        else newState.vLines[r][c].preview = newState.currentPlayer;

        const tempState = JSON.parse(JSON.stringify(newState));
        const tempLine = type === 'h' ? tempState.hLines[r][c] : tempState.vLines[r][c];
        tempLine.owner = tempState.currentPlayer;

        for (let i = 0; i < tempState.rows; i++) {
          for (let j = 0; j < tempState.cols; j++) {
            if (!tempState.boxes[i][j].owner) {
              const top = tempState.hLines[i][j].owner;
              const bottom = tempState.hLines[i + 1][j].owner;
              const left = tempState.vLines[i][j].owner;
              const right = tempState.vLines[i][j + 1].owner;
              if (top && bottom && left && right) {
                newState.boxes[i][j].preview = newState.currentPlayer;
              }
            }
          }
        }
      }
      return newState;
    }
    default:
      return state;
  }
};

export const useDotsAndBoxes = (): DotsAndBoxesController => {
  const [gameState, dispatch] = useReducer(reducer, initialGameState);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', payload: { difficulty } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const selectLineAction = useCallback(
    (r: number, c: number, type: 'h' | 'v') => {
      dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
    },
    []
  );

  const setHints = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_HINTS', payload: { enabled } });
  }, []);

  const hintState = useMemo(
    () => ({
      enabled: !!gameState.hintsEnabled,
    }),
    [gameState.hintsEnabled]
  );

  const setPreview = useCallback(
    (r: number | null, c: number | null, type: 'h' | 'v' | null) => {
      if (r === null || c === null || type === null) {
        dispatch({ type: 'SET_PREVIEW', payload: null });
      } else {
        dispatch({ type: 'SET_PREVIEW', payload: { r, c, type } });
      }
    },
    []
  );

  const getPlayerDisplayName = useCallback((player: Player): string => {
    return player === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
  }, []);

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
  }, [
    gameState.status,
    gameState.winner,
    gameState.currentPlayer,
    getPlayerDisplayName,
  ]);

  return {
    gameState,
    dispatch,
    resetGame,
    isTurnOnly: false,
    displayInfo,
    setDifficulty,
    selectLine: selectLineAction,
    setHints,
    hintState,
    setPreview,
    getPlayerDisplayName,
  };
};