import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { useDialog } from '@/core/components/ui/DialogProvider';
import {
  BaseGameController,
  HintableGameController,
  BaseGameState,
  HintState,
} from '@/core/types/game';
import {
  GameState as CoreGameState,
  createInitialState as createCoreInitialState,
  selectStick as selectStickCore,
  handleTakeSticks as handleTakeSticksCore,
  calculateNimData,
  Difficulty,
  Player,
  NimData,
} from './core';
import { useGameStateLogger } from '@/core/hooks/useGameStateLogger';

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
      const coreState: CoreGameState = { ...state, status: 'playing', currentPlayer: state.currentPlayer, difficulty: state.difficulty };
      const newState = selectStickCore(coreState, action.rowIndex, action.stickId);
      return { ...state, ...newState };
    }
    case 'TAKE_STICKS': {
      if (state.status !== 'playing' || !state.currentPlayer || !state.difficulty) return state;
      const coreState: CoreGameState = { ...state, status: 'playing', currentPlayer: state.currentPlayer, difficulty: state.difficulty };
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
    nimData: NimData;
  };

// The hook
export function useStickTaking(): StickTakingController {
  const [gameState, dispatch] = useReducer(stickTakingReducer, createNewInitialState(null));
  const logger = useGameStateLogger('useStickTaking', gameState);
  const { alert } = useDialog();

  useEffect(() => {
    if (gameState.winner) {
      const loser = gameState.currentPlayer;
      const winner = gameState.winner;
      alert({
        title: `${winner}のかち！`,
        message: `${loser}がさいごの1本をとったよ！`,
      }).then(() => {
        dispatch({ type: 'RESET_GAME', difficulty: null });
      });
    }
  }, [gameState.winner, gameState.currentPlayer, alert]);

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
    logger.log('SELECT_STICK_CALLED', { rowIndex, stickId });
    dispatch({ type: 'SELECT_STICK', rowIndex, stickId });
  }, [logger]);

  const takeSticks = useCallback(() => {
    logger.log('TAKE_STICKS_CALLED', {});
    dispatch({ type: 'TAKE_STICKS' });
  }, [logger]);

  const setHints = useCallback((enabled: boolean) => {
    logger.log('SET_HINTS_CALLED', { enabled });
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [logger]);

  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
  }), [gameState.hintsEnabled]);

  const nimData = useMemo(() => {
    if (gameState.status !== 'playing' || !gameState.rows || gameState.rows.length === 0) {
      return { chunkLists: [], nimSum: 0 };
    }
    return calculateNimData(gameState.rows);
  }, [gameState.rows, gameState.status]);

  return useMemo(() => ({
    gameState,
    dispatch,
    resetGame,
    selectStick,
    takeSticks,
    setHints,
    hintState,
    nimData,
    startGame,
    difficulty: gameState?.difficulty ?? null,
    isTurnOnly: (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner,
    displayInfo: (() => {
      if (gameState.status === 'waiting') return { statusText: '難易度を選択してください' };
      if (gameState.winner) {
        return { statusText: `${gameState.winner}のかち` };
      }
      if (gameState.currentPlayer) {
        const color = gameState.currentPlayer === 'プレイヤー1' ? '#ff4136' : '#0074d9';
        return { statusText: `「${gameState.currentPlayer}」のばん`, color };
      }
      return { statusText: 'ゲーム開始' };
    })(),
  }), [gameState, resetGame, selectStick, takeSticks, setHints, hintState, nimData, startGame]);
}
