import { useReducer, useCallback, useMemo } from 'react';
import {
  BaseGameController,
  HintableGameController,
  BaseGameState,
  HintState,
  ScoreInfo,
} from '../../../types/game';
import {
  GameState as CoreGameState,
  createInitialState as createCoreInitialState,
  selectStick as selectStickCore,
  handleTakeSticks as handleTakeSticksCore,
  getHintData,
  Difficulty,
  Player,
} from './core';
import { useGameStateLogger } from '../../../hooks/useGameStateLogger';

// Union of all possible actions
type StickTakingAction =
  | { type: 'SELECT_STICK'; rowIndex: number; stickId: number }
  | { type: 'TAKE_STICKS' }
  | { type: 'RESET_GAME'; difficulty: Difficulty | null }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean };

// Adapt GameState to BaseGameState
export interface StickTakingGameState extends BaseGameState {
  rows: CoreGameState['rows'];
  currentPlayer: Player | null;
  winner: Player | null;
  difficulty: Difficulty | null;
  selectedSticks: CoreGameState['selectedSticks'];
  hintsEnabled: boolean;
}

function createNewInitialState(difficulty: Difficulty | null): StickTakingGameState {
  if (!difficulty) {
    return {
      rows: [],
      currentPlayer: null,
      winner: null,
      difficulty: null,
      selectedSticks: [],
      hintsEnabled: false,
      status: 'waiting',
    };
  }
  const coreState = createCoreInitialState(difficulty);
  return {
    ...coreState,
    status: 'playing',
    hintsEnabled: false,
  };
}

// Reducer function
function stickTakingReducer(state: StickTakingGameState, action: StickTakingAction): StickTakingGameState {
  switch (action.type) {
    case 'SELECT_STICK': {
      if (state.status !== 'playing' || !state.currentPlayer || !state.difficulty) return state;
      const coreState: CoreGameState = { ...state, currentPlayer: state.currentPlayer, difficulty: state.difficulty, hintLevel: state.hintsEnabled ? 1 : 0 };
      const newState = selectStickCore(coreState, action.rowIndex, action.stickId);
      return { ...state, ...newState, status: 'playing' };
    }
    case 'TAKE_STICKS': {
      if (state.status !== 'playing' || !state.currentPlayer || !state.difficulty) return state;
      const coreState: CoreGameState = { ...state, currentPlayer: state.currentPlayer, difficulty: state.difficulty, hintLevel: state.hintsEnabled ? 1 : 0 };
      const newState = handleTakeSticksCore(coreState);
      return { ...state, ...newState, status: newState.winner ? 'ended' : 'playing' };
    }
    case 'RESET_GAME':
      return createNewInitialState(action.difficulty);
    case 'SET_HINTS_ENABLED': {
      if (state.status !== 'playing') return state;
      return { ...state, hintsEnabled: action.enabled };
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

  const setHints = useCallback((enabled: boolean) => {
    if (gameState.status !== 'playing') return;
    logger.log('SET_HINTS_CALLED', { enabled });
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [logger, gameState.status]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.status === 'waiting') return '難易度を選択してください';
    if (gameState.winner) {
      return `かったのは ${gameState.winner}！`;
    }
    return `${gameState.currentPlayer}のばん`;
  }, [gameState]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (gameState.status !== 'playing' || !gameState.hintsEnabled || !gameState.currentPlayer || !gameState.difficulty) return null;
    const coreState: CoreGameState = { ...gameState, currentPlayer: gameState.currentPlayer, difficulty: gameState.difficulty, hintLevel: gameState.hintsEnabled ? 1 : 0 };
    const hintData = getHintData(coreState);
    return {
      title: 'おしえて！',
      items: [
        { label: 'のこりのぼう', value: `${hintData.remainingSticksCount}本` },
        { label: 'かたまりの数', value: `${hintData.totalChunkCount}個` },
      ],
    };
  }, [gameState]);

  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
  }), [gameState.hintsEnabled]);

  return {
    gameState,
    dispatch,
    resetGame,
    selectStick,
    takeSticks,
    setHints,
    getDisplayStatus,
    getScoreInfo,
    hintState,
    startGame,
    difficulty: gameState?.difficulty ?? null,
  };
}
