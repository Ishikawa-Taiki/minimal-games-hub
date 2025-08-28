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
  GameState,
  createInitialState,
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
  | { type: 'RESET_GAME'; difficulty: Difficulty }
  | { type: 'TOGGLE_HINT' };

// Adapt GameState to BaseGameState
interface StickTakingGameState extends BaseGameState {
  rows: GameState['rows'];
  currentPlayer: Player;
  winner: Player | null;
  difficulty: Difficulty;
  selectedSticks: GameState['selectedSticks'];
  isHintVisible: boolean;
}

// Reducer function
function stickTakingReducer(state: StickTakingGameState, action: StickTakingAction): StickTakingGameState {
  switch (action.type) {
    case 'SELECT_STICK':
      return selectStickCore(state, action.rowIndex, action.stickId);
    case 'TAKE_STICKS':
      return handleTakeSticksCore(state);
    case 'RESET_GAME':
      return createInitialState(action.difficulty);
    case 'TOGGLE_HINT':
      return toggleHintVisibilityCore(state);
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
  const [gameState, dispatch] = useReducer(stickTakingReducer, null, () => createInitialState('easy')); // Dummy initial state
  const logger = useGameStateLogger('useStickTaking', gameState);

  const resetGame = useCallback((difficulty: Difficulty) => {
    logger.log('RESET_GAME_CALLED', { difficulty });
    dispatch({ type: 'RESET_GAME', difficulty });
  }, [logger]);

  const startGame = useCallback((difficulty: Difficulty) => {
    resetGame(difficulty);
  }, [resetGame]);

  const selectStick = useCallback((rowIndex: number, stickId: number) => {
    logger.log('SELECT_STICK_CALLED', { rowIndex, stickId });
    dispatch({ type: 'SELECT_STICK', rowIndex, stickId });
  }, [logger]);

  const takeSticks = useCallback(() => {
    logger.log('TAKE_STICKS_CALLED', {});
    dispatch({ type: 'TAKE_STICKS' });
  }, [logger]);

  const toggleHints = useCallback(() => {
    logger.log('TOGGLE_HINTS_CALLED', {});
    dispatch({ type: 'TOGGLE_HINT' });
  }, [logger]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      return `かったのは ${gameState.winner}！`;
    }
    return `${gameState.currentPlayer}のばん`;
  }, [gameState.winner, gameState.currentPlayer]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (!gameState.isHintVisible) return null;
    const hintData = getHintData(gameState);
    return {
      title: 'ヒント',
      items: [
        { label: 'のこりのぼう', value: `${hintData.remainingSticksCount}本` },
        { label: 'かたまりの数', value: `${hintData.totalChunkCount}個` },
      ],
    };
  }, [gameState]);

  const hintState: HintState = useMemo(() => ({
    level: gameState.isHintVisible ? 'basic' : 'off',
  }), [gameState.isHintVisible]);

  return {
    gameState: {
        ...gameState,
        status: gameState.winner ? 'ended' : 'playing',
    },
    dispatch,
    resetGame: () => resetGame(gameState.difficulty),
    selectStick,
    takeSticks,
    toggleHints,
    getDisplayStatus,
    getScoreInfo,
    hintState,
    startGame,
    difficulty: gameState.difficulty,
  };
}
