import { useReducer, useState, useCallback, useMemo } from 'react';
import { BaseGameController, HintableGameController, HistoryGameController, BaseGameState, GameStatus } from '../../types/game';
import { GameState, createInitialState, handleCellClick as handleCellClickCore, Player } from './core';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';

// リバーシ固有の状態をBaseGameStateに適合させる
interface ReversiGameState extends BaseGameState {
  board: GameState['board'];
  currentPlayer: Player;
  scores: { BLACK: number; WHITE: number };
  gameStatus: GameState['gameStatus'];
  validMoves: Map<string, [number, number][]>;
  // ヒント関連
  hintLevel: 'off' | 'on'; // 'off' (placeable) is the new default, 'on' is the full hint
  selectedHintCell: [number, number] | null;
}

type ReversiAction =
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_HINT' }
  | { type: 'SET_SELECTED_HINT_CELL'; cell: [number, number] | null }
  | { type: 'HISTORY_GOTO'; index: number };

function createInitialReversiState(): ReversiGameState {
  const coreState = createInitialState();
  return {
    ...coreState,
    // BaseGameState required fields
    status: 'playing' as GameStatus,
    winner: null,
    // ヒント関連
    hintLevel: 'off', // Default state now shows placeable squares
    selectedHintCell: null,
  };
}

function reversiReducer(state: ReversiGameState, action: ReversiAction): ReversiGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        scores: state.scores,
        gameStatus: state.gameStatus,
        validMoves: state.validMoves,
      };
      
      const newCoreState = handleCellClickCore(coreState, action.row, action.col);
      if (!newCoreState) return state;
      
      // 勝者の判定
      let winner: Player | 'DRAW' | null = null;
      if (newCoreState.gameStatus === 'GAME_OVER') {
        if (newCoreState.scores.BLACK > newCoreState.scores.WHITE) {
          winner = 'BLACK';
        } else if (newCoreState.scores.WHITE > newCoreState.scores.BLACK) {
          winner = 'WHITE';
        } else {
          winner = 'DRAW';
        }
      }
      
      return {
        ...state,
        ...newCoreState,
        status: newCoreState.gameStatus === 'GAME_OVER' ? 'ended' : 'playing',
        winner,
        selectedHintCell: null, // 移動後はヒント選択をリセット
      };
    }
    
    case 'RESET_GAME':
      return createInitialReversiState();
    
    case 'SET_SELECTED_HINT_CELL':
      return {
        ...state,
        selectedHintCell: action.cell,
      };
    
    case 'TOGGLE_HINT': {
      const nextLevel = state.hintLevel === 'off' ? 'on' : 'off';
      return {
        ...state,
        hintLevel: nextLevel,
        selectedHintCell: null,
      };
    }
    
    case 'HISTORY_GOTO': {
      // 履歴からの状態復元は外部で処理されるため、現在の状態を返す
      return state;
    }
    
    default:
      return state;
  }
}

export type ReversiController = BaseGameController<ReversiGameState, ReversiAction> & 
  HintableGameController<ReversiGameState, ReversiAction> & 
  HistoryGameController<ReversiGameState, ReversiAction> & {
    // リバーシ固有のメソッド
    makeMove: (row: number, col: number) => void;
    setSelectedHintCell: (cell: [number, number] | null) => void;
    // 状態アクセサー
    getValidMoves: () => Map<string, [number, number][]>;
    getCurrentPlayer: () => Player;
    getScores: () => { BLACK: number; WHITE: number };
    // 履歴関連
    goToHistoryIndex: (index: number) => void;
    gameHistory: ReversiGameState[];
    currentHistoryIndex: number;
  };

export function useReversi(): ReversiController {
  const [gameHistory, setGameHistory] = useState<ReversiGameState[]>([createInitialReversiState()]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const gameState = gameHistory[currentHistoryIndex];
  
  // ログ機能
  const logger = useGameStateLogger('useReversi', gameState, {
    historyLength: gameHistory.length,
    currentHistoryIndex,
    hintLevel: gameState.hintLevel,
    validMovesCount: gameState.validMoves.size
  });

  const resetGame = useCallback(() => {
    logger.log('RESET_GAME_CALLED', {});
    const initialState = createInitialReversiState();
    setGameHistory([initialState]);
    setCurrentHistoryIndex(0);
  }, [logger]);

  const makeMove = useCallback((row: number, col: number) => {
    logger.log('MAKE_MOVE_CALLED', { row, col, currentPlayer: gameState.currentPlayer, hintLevel: gameState.hintLevel });

    // 'on' (フルヒント) モードの場合の特別な処理
    if (gameState.hintLevel === 'on') {
      if (gameState.selectedHintCell &&
          gameState.selectedHintCell[0] === row &&
          gameState.selectedHintCell[1] === col) {
        // 2回目のタップ: 実際に移動を実行
        logger.log('EXECUTING_FULL_HINT_MOVE', { row, col });
        const newState = reversiReducer(gameState, { type: 'MAKE_MOVE', row, col });
        setGameHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), newState]);
        setCurrentHistoryIndex(prev => prev + 1);
      } else {
        // 1回目のタップ: セルを選択して影響を受ける駒をハイライト
        logger.log('HINT_CELL_SELECTED', { row, col });
        const newState = reversiReducer(gameState, { type: 'SET_SELECTED_HINT_CELL', cell: [row, col] });
        setGameHistory(prev => {
          const newHistory = [...prev];
          newHistory[currentHistoryIndex] = newState;
          return newHistory;
        });
      }
    } else {
      // 'off' (通常) モードの移動
      logger.log('EXECUTING_NORMAL_MOVE', { row, col });
      const newState = reversiReducer(gameState, { type: 'MAKE_MOVE', row, col });
      setGameHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), newState]);
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [gameState, currentHistoryIndex, logger]);

  const toggleHints = useCallback(() => {
    logger.log('TOGGLE_HINTS_CALLED', { currentLevel: gameState.hintLevel });
    const newState = reversiReducer(gameState, { type: 'TOGGLE_HINT' });
    // 履歴を上書きしてヒントの状態を更新
    setGameHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentHistoryIndex] = newState;
        return newHistory;
    });
  }, [gameState, currentHistoryIndex, logger]);

  const setSelectedHintCell = useCallback((cell: [number, number] | null) => {
    logger.log('SET_SELECTED_HINT_CELL_CALLED', { cell });
    const newState = reversiReducer(gameState, { type: 'SET_SELECTED_HINT_CELL', cell });
    setGameHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentHistoryIndex] = newState;
        return newHistory;
    });
  }, [gameState, currentHistoryIndex, logger]);

  // ヒント関連
  const hintState = useMemo(() => {
    // 'off' でも 'on' でも配置可能なマスは常に表示する
    const highlightedCells = Array.from(gameState.validMoves.keys()).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });

    return {
      // hintLevelをそのまま公開し、UI側で'on'か'off'かを判断
      level: gameState.hintLevel,
      highlightedCells,
      selectedCell: gameState.selectedHintCell ?
        { row: gameState.selectedHintCell[0], col: gameState.selectedHintCell[1] } : null
    };
  }, [gameState.hintLevel, gameState.validMoves, gameState.selectedHintCell]);

  // 履歴関連
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < gameHistory.length - 1;

  const undoMove = useCallback(() => {
    if (canUndo) {
      logger.log('UNDO_MOVE', { fromIndex: currentHistoryIndex, toIndex: currentHistoryIndex - 1 });
      setCurrentHistoryIndex(prev => prev - 1);
    }
  }, [canUndo, currentHistoryIndex, logger]);

  const redoMove = useCallback(() => {
    if (canRedo) {
      logger.log('REDO_MOVE', { fromIndex: currentHistoryIndex, toIndex: currentHistoryIndex + 1 });
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [canRedo, currentHistoryIndex, logger]);

  // 履歴の特定位置にジャンプ
  const goToHistoryIndex = useCallback((index: number) => {
    if (index >= 0 && index < gameHistory.length) {
      logger.log('GOTO_HISTORY_INDEX', { fromIndex: currentHistoryIndex, toIndex: index });
      setCurrentHistoryIndex(index);
    }
  }, [currentHistoryIndex, gameHistory.length, logger]);



  // アクセサーメソッド
  const getValidMoves = useCallback(() => gameState.validMoves, [gameState.validMoves]);
  const getCurrentPlayer = useCallback(() => gameState.currentPlayer, [gameState.currentPlayer]);
  const getScores = useCallback(() => gameState.scores, [gameState.scores]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      if (gameState.winner === 'DRAW') {
        return '引き分け！';
      } else if (gameState.winner === 'BLACK') {
        return '勝者: 黒';
      } else if (gameState.winner === 'WHITE') {
        return '勝者: 白';
      }
      return `勝者: ${gameState.winner}`;
    } else if (gameState.gameStatus === 'GAME_OVER') {
      return 'ゲーム終了';
    } else if (gameState.gameStatus === 'SKIPPED') {
      const skippedPlayer = gameState.currentPlayer === 'BLACK' ? '白' : '黒';
      return `${skippedPlayer}はパス - ${gameState.currentPlayer === 'BLACK' ? '黒' : '白'}の番`;
    } else if (gameState.gameStatus === 'PLAYING' && gameState.currentPlayer) {
      return `${gameState.currentPlayer === 'BLACK' ? '黒' : '白'}の番`;
    } else if (gameState.status === 'ended') {
      const extendedState = gameState as ReversiGameState & { isDraw?: boolean };
      if (extendedState.isDraw) {
        return '引き分け！';
      }
      return 'ゲーム終了';
    } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      return `${gameState.currentPlayer === 'BLACK' ? '黒' : '白'}の番`;
    } else {
      return 'ゲーム開始';
    }
  }, [gameState]);

  return {
    gameState,
    dispatch: () => {}, // dispatchは直接使用しない
    resetGame,
    makeMove,
    setSelectedHintCell,
    getValidMoves,
    getCurrentPlayer,
    getScores,
    getDisplayStatus,
    // HintableGameController
    hintState,
    toggleHints,
    // HistoryGameController
    undoMove,
    redoMove,
    canUndo,
    canRedo,
    // 履歴関連の追加メソッド
    goToHistoryIndex,
    gameHistory,
    currentHistoryIndex,
  };
}