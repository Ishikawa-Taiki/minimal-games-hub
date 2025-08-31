import { useReducer, useCallback, useMemo } from 'react';
import {
  BaseGameController,
  HintableGameController,
  BaseGameState,
  GameStatus,
  HintState,
  ScoreInfo,
} from '../../types/game';
import {
  GameState as CoreGameState,
  createInitialState as createCoreInitialState,
  selectStick as selectStickCore,
  handleTakeSticks as handleTakeSticksCore,
  toggleHintVisibility as toggleHintVisibilityCore,
  getHintData,
  Difficulty,
  Player,
} from './core';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';

// Union of all possible actions
type StickTakingAction =
  | { type: 'SELECT_STICK'; rowIndex: number; stickId: number }
  | { type: 'TAKE_STICKS' }
  | { type: 'RESET_GAME'; difficulty: Difficulty | null }
  | { type: 'TOGGLE_HINT' };

// Adapt GameState to BaseGameState
export interface StickTakingGameState extends BaseGameState {
  rows: CoreGameState['rows'];
  currentPlayer: Player | null;
  winner: Player | null;
  difficulty: Difficulty | null;
  selectedSticks: CoreGameState['selectedSticks'];
  hintLevel: number;
}

function createNewInitialState(difficulty: Difficulty | null): StickTakingGameState {
  if (!difficulty) {
    return {
      rows: [],
      currentPlayer: null,
      winner: null,
      difficulty: null,
      selectedSticks: [],
      hintLevel: 0,
      status: 'waiting',
    };
  }
  const coreState = createCoreInitialState(difficulty);
  return {
    ...coreState,
    status: 'playing',
  };
}

// Reducer function
function stickTakingReducer(state: StickTakingGameState, action: StickTakingAction): StickTakingGameState {
  switch (action.type) {
    case 'SELECT_STICK': {
      if (state.status !== 'playing' || !state.currentPlayer || !state.difficulty) return state;
      const coreState: CoreGameState = { ...state, currentPlayer: state.currentPlayer, difficulty: state.difficulty, hintLevel: state.hintLevel };
      const newState = selectStickCore(coreState, action.rowIndex, action.stickId);
      return { ...state, ...newState, status: 'playing' };
    }
    case 'TAKE_STICKS': {
      if (state.status !== 'playing' || !state.currentPlayer || !state.difficulty) return state;
      const coreState: CoreGameState = { ...state, currentPlayer: state.currentPlayer, difficulty: state.difficulty, hintLevel: state.hintLevel };
      const newState = handleTakeSticksCore(coreState);
      return { ...state, ...newState, status: newState.winner ? 'ended' : 'playing' };
    }
    case 'RESET_GAME':
      return createNewInitialState(action.difficulty);
    case 'TOGGLE_HINT': {
      if (state.status !== 'playing') return state;
      return { ...state, hintLevel: state.hintLevel === 0 ? 1 : 0 };
    }
    default:
      return state;
  }
}

// Controller type
export type StickTakingController = BaseGameController<StickTakingGameState, StickTakingAction> &
  HintableGameController<StickTakingGameState, StickTakingAction> & {
    selectStick: (rowIndex: number, stickId: number) => void;
    takeSticks: () => void;
    startGame: (difficulty: Difficulty) => void;
    difficulty: Difficulty | null;
  };

// The hook
export function useStickTaking(): StickTakingController {
  const [gameState, dispatch] = useReducer(stickTakingReducer, createNewInitialState(null));
  const logger = useGameStateLogger('useStickTaking', gameState);

  const startGame = useCallback((difficulty: Difficulty) => {
    logger.log('START_GAME_CALLED', { difficulty });
    dispatch({ type: 'RESET_GAME', difficulty });
  }, [logger]);

  const resetGame = useCallback(() => {
    logger.log('RESET_GAME_CALLED', { difficulty: gameState.difficulty });
    // ゲームを難易度選択画面にリセットします。
    dispatch({ type: 'RESET_GAME', difficulty: null });
  }, [logger, gameState.difficulty]);

  const selectStick = useCallback((rowIndex: number, stickId: number) => {
    if (gameState.status !== 'playing') return;
    logger.log('SELECT_STICK_CALLED', { rowIndex, stickId });
    dispatch({ type: 'SELECT_STICK', rowIndex, stickId });
  }, [logger, gameState.status]);

  const takeSticks = useCallback(() => {
    if (gameState.status !== 'playing') return;
    logger.log('TAKE_STICKS_CALLED', {});
    dispatch({ type: 'TAKE_STICKS' });
  }, [logger, gameState.status]);

  const toggleHints = useCallback(() => {
    if (gameState.status !== 'playing') return;
    logger.log('TOGGLE_HINTS_CALLED', {});
    dispatch({ type: 'TOGGLE_HINT' });
  }, [logger, gameState.status]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.status === 'waiting') return '難易度を選択してください';
    if (gameState.winner) {
      return `かったのは ${gameState.winner}！`;
    }
    return `${gameState.currentPlayer}のばん`;
  }, [gameState]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (gameState.status !== 'playing' || !(gameState.hintLevel > 0) || !gameState.currentPlayer || !gameState.difficulty) return null;
    const coreState: CoreGameState = { ...gameState, currentPlayer: gameState.currentPlayer, difficulty: gameState.difficulty, hintLevel: gameState.hintLevel };
    const hintData = getHintData(coreState);
    return {
      title: 'ヒント',
      items: [
        { label: 'のこりのぼう', value: `${hintData.remainingSticksCount}本` },
        { label: 'かたまりの数', value: `${hintData.totalChunkCount}個` },
      ],
    };
  }, [gameState]);

  const hintState: HintState = useMemo(() => ({
    level: gameState?.hintLevel > 0 ? 'basic' : 'off',
  }), [gameState?.hintLevel]);

  return {
    gameState,
    dispatch,
    resetGame,
    selectStick,
    takeSticks,
    toggleHints,
    getDisplayStatus,
    getScoreInfo,
    hintState,
    startGame,
    difficulty: gameState?.difficulty ?? null,
  };
}
