import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDialog } from '@/app/components/ui/DialogProvider';
import {
  BaseGameController,
  HintableGameController,
  BaseGameState,
  HintState,
  ScoreInfo,
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
    interactionHandlers: {
      onInteractionStart: (rowIndex: number, stickId: number) => void;
      onInteractionMove: (rowIndex: number, stickId: number) => void;
      onInteractionEnd: () => void;
    };
    getScoreInfo: () => ScoreInfo | null;
    displayInfo: { statusText: string; color?: string };
  };

// The hook
export function useStickTaking(): StickTakingController {
  const [gameState, dispatch] = useReducer(stickTakingReducer, createNewInitialState(null));
  const logger = useGameStateLogger('useStickTaking', gameState);
  const { alert } = useDialog();

  const interactionState = useRef<{
    isInteracting: boolean;
    action: 'select' | 'deselect' | null;
  }>({ isInteracting: false, action: null });

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

  const onInteractionStart = useCallback((rowIndex: number, stickId: number) => {
    if (gameState.status !== 'playing') return;
    const stick = gameState.rows[rowIndex]?.find(s => s.id === stickId);
    if (!stick || stick.isTaken) return;
    interactionState.current.isInteracting = true;
    const isSelected = gameState.selectedSticks.some(s => s.row === rowIndex && s.stickId === stickId);
    interactionState.current.action = isSelected ? 'deselect' : 'select';
    selectStick(rowIndex, stickId);
  }, [gameState.status, gameState.rows, gameState.selectedSticks, selectStick]);

  const onInteractionMove = useCallback((rowIndex: number, stickId: number) => {
    if (!interactionState.current.isInteracting || gameState.status !== 'playing') return;
    const stick = gameState.rows[rowIndex]?.find(s => s.id === stickId);
    if (!stick || stick.isTaken) return;
    const isSelected = gameState.selectedSticks.some(s => s.row === rowIndex && s.stickId === stickId);
    if (interactionState.current.action === 'select' && !isSelected) {
      selectStick(rowIndex, stickId);
    } else if (interactionState.current.action === 'deselect' && isSelected) {
      selectStick(rowIndex, stickId);
    }
  }, [gameState.status, gameState.rows, gameState.selectedSticks, selectStick]);

  const onInteractionEnd = useCallback(() => {
    interactionState.current.isInteracting = false;
    interactionState.current.action = null;
  }, []);

  const hintState: HintState = useMemo(() => ({
    enabled: gameState.hintsEnabled,
  }), [gameState.hintsEnabled]);

  const nimData = useMemo(() => {
    if (gameState.status !== 'playing' || !gameState.rows || gameState.rows.length === 0) {
      return { chunkLists: [], nimSum: 0 };
    }
    return calculateNimData(gameState.rows);
  }, [gameState.rows, gameState.status]);

  const interactionHandlers = useMemo(() => ({
    onInteractionStart,
    onInteractionMove,
    onInteractionEnd,
  }), [onInteractionStart, onInteractionMove, onInteractionEnd]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    if (gameState.status !== 'playing') return null;
    return {
      title: 'のこりのぼう',
      items: gameState.rows.map((row, index) => ({
        label: `${index + 1}だんめ`,
        value: row.filter(stick => !stick.isTaken).length,
      })),
    };
  }, [gameState]);

  const getDisplayStatus = useCallback((): string => {
    if (gameState.status === 'waiting') return '難易度を選択してください';
    if (gameState.winner) {
      return `${gameState.winner}のかち`;
    }
    if (gameState.currentPlayer) {
      return `「${gameState.currentPlayer}」のばん`;
    }
    return 'ゲーム開始';
  }, [gameState.status, gameState.winner, gameState.currentPlayer]);

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
    interactionHandlers,
    getScoreInfo,
    getDisplayStatus,
    displayInfo: {
      statusText: getDisplayStatus(),
    },
  }), [gameState, resetGame, selectStick, takeSticks, setHints, hintState, nimData, startGame, interactionHandlers, getScoreInfo, getDisplayStatus]);
}
