import { useReducer, useCallback } from 'react';
import {
  createInitialState,
  selectLine,
  type Difficulty,
  type GameState,
} from './core';
import type {
  BaseGameController,
  HintableGameController,
  ScoreInfo,
} from '@/core/types/game';

export type DotsAndBoxesController = BaseGameController<GameState, Action> &
  HintableGameController;

type Action =
  | { type: 'SELECT_LINE'; payload: { r: number; c: number; type: 'h' | 'v' } }
  | { type: 'START_GAME'; payload: { difficulty: Difficulty } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS'; payload: { enabled: boolean } }
  | { type: 'SET_PREVIEW'; payload: { r: number; c: number; type: 'h' | 'v' } | null };

const initialGameState: GameState = {
  difficulty: 'easy',
  rows: 0,
  cols: 0,
  hLines: [],
  vLines: [],
  boxes: [],
  currentPlayer: 'player1',
  scores: { player1: 0, player2: 0 },
  gameStatus: 'waiting',
  winner: null,
  remainingLines: 0,
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.payload.difficulty);
    case 'RESET_GAME':
      return createInitialState(state.difficulty);
    case 'SELECT_LINE':
      return selectLine(state, action.payload.r, action.payload.c, action.payload.type);
    case 'SET_HINTS':
      return { ...state, hintsEnabled: action.payload.enabled };
    case 'SET_PREVIEW': {
      const newState = JSON.parse(JSON.stringify(state));
      // Clear previous preview states
      newState.hLines.forEach((row: any) => row.forEach((line: any) => (line.preview = null)));
      newState.vLines.forEach((row: any) => row.forEach((line: any) => (line.preview = null)));
      newState.boxes.forEach((row: any) => row.forEach((box: any) => (box.preview = null)));

      if (action.payload) {
        const { r, c, type } = action.payload;

        // Set line preview
        if (type === 'h') {
          newState.hLines[r][c].preview = newState.currentPlayer;
        } else {
          newState.vLines[r][c].preview = newState.currentPlayer;
        }

        // Create a temporary state to simulate the move
        const tempState = JSON.parse(JSON.stringify(newState));
        const tempLine = type === 'h' ? tempState.hLines[r][c] : tempState.vLines[r][c];
        tempLine.owner = tempState.currentPlayer; // Simulate the line being taken

        // Check which boxes would be completed
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
  const [gameState, dispatch] = useReducer(
    reducer,
    initialGameState
  );

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', payload: { difficulty } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const selectLineAction = useCallback((r: number, c: number, type: 'h' | 'v') => {
    dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
  }, []);

  const setHints = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_HINTS', payload: { enabled } });
  }, []);

  const setPreview = useCallback((r: number | null, c: number | null, type: 'h' | 'v' | null) => {
    if (r === null || c === null || type === null) {
      dispatch({ type: 'SET_PREVIEW', payload: null });
    } else {
      dispatch({ type: 'SET_PREVIEW', payload: { r, c, type } });
    }
  }, []);

  const getDisplayStatus = useCallback(() => {
    if (gameState.gameStatus === 'ended') {
      if (gameState.winner === 'draw') {
        return 'ひきわけ';
      }
      const winnerName = gameState.winner === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
      return `${winnerName}のかち！`;
    }
    if (gameState.gameStatus === 'waiting') {
        return 'むずかしさをえらんでね';
    }
    const playerName = gameState.currentPlayer === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
    return `「${playerName}」のばん`;
  }, [gameState.gameStatus, gameState.winner, gameState.currentPlayer]);

  const getScoreInfo = useCallback((): ScoreInfo => {
    return {
      title: '獲得したかず',
      items: [
        { label: 'player1', value: gameState.scores.player1 },
        { label: 'player2', value: gameState.scores.player2 },
      ],
    };
  }, [gameState.scores]);

  return {
    gameState,
    dispatch,
    resetGame,
    setDifficulty,
    selectLine: selectLineAction,
    setHints,
    setPreview,
    getDisplayStatus,
    getScoreInfo,
  };
};