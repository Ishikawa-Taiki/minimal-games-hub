import { useReducer, useCallback } from 'react';
import { 
  BaseGameState, 
  HintableGameController, 
  HistoryGameController, 
  HintState, 
  HintLevel,
  Position 
} from '../../types/game';
import {
  GameState as CoreGameState,
  createInitialState,
  handleCellClick as handleCellClickCore
} from './core';

// リバーシ固有の状態をBaseGameStateに適合させる
export interface ReversiGameState extends BaseGameState {
  // コア状態
  board: CoreGameState['board'];
  scores: CoreGameState['scores'];
  validMoves: CoreGameState['validMoves'];
  
  // ヒント機能
  hints: HintState;
  
  // 履歴機能
  history: CoreGameState[];
  currentHistoryIndex: number;
  
  // アニメーション状態
  flippingCells: [number, number][];
  isFlipping: boolean;
  visualBoard: CoreGameState['board'];
  
  // 引き分け判定用
  isDraw?: boolean;
}

// アクション型定義
export type ReversiAction = 
  | { type: 'MAKE_MOVE'; payload: { row: number; col: number } }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_HINTS' }
  | { type: 'SET_HINT_LEVEL'; payload: HintLevel }
  | { type: 'SET_SELECTED_HINT_CELL'; payload: Position | null }
  | { type: 'UNDO_MOVE' }
  | { type: 'REDO_MOVE' }
  | { type: 'GOTO_HISTORY'; payload: number }
  | { type: 'START_FLIPPING'; payload: [number, number][] }
  | { type: 'STOP_FLIPPING' }
  | { type: 'UPDATE_VISUAL_BOARD'; payload: CoreGameState['board'] };

// コア状態をBaseGameStateに変換するヘルパー
function coreStateToBaseState(coreState: CoreGameState): Pick<BaseGameState, 'status' | 'currentPlayer' | 'winner'> {
  let status: BaseGameState['status'];
  let winner: BaseGameState['winner'] = null;
  
  if (coreState.gameStatus === 'GAME_OVER') {
    status = 'ended';
    if (coreState.scores.BLACK > coreState.scores.WHITE) {
      winner = 'BLACK';
    } else if (coreState.scores.WHITE > coreState.scores.BLACK) {
      winner = 'WHITE';
    }
    // 引き分けの場合はwinnerはnullのまま
  } else {
    status = 'playing';
  }
  
  return {
    status,
    currentPlayer: coreState.currentPlayer,
    winner
  };
}

// 初期状態を作成
function createInitialReversiState(): ReversiGameState {
  const coreState = createInitialState();
  const baseState = coreStateToBaseState(coreState);
  
  return {
    ...baseState,
    board: coreState.board,
    scores: coreState.scores,
    validMoves: coreState.validMoves,
    hints: {
      level: 'off',
      highlightedCells: [],
      overlayData: [],
      selectedCell: null
    },
    history: [coreState],
    currentHistoryIndex: 0,
    flippingCells: [],
    isFlipping: false,
    visualBoard: coreState.board,
    isDraw: baseState.status === 'ended' && !baseState.winner
  };
}

// リデューサー関数
function reversiReducer(state: ReversiGameState, action: ReversiAction): ReversiGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { row, col } = action.payload;
      const currentCoreState = state.history[state.currentHistoryIndex];
      
      // フルヒントモードの場合の処理
      if (state.hints.level === 'advanced' && state.hints.selectedCell) {
        if (state.hints.selectedCell.row === row && state.hints.selectedCell.col === col) {
          // 同じセルを再度タップ：実際に移動を実行
          const newCoreState = handleCellClickCore(currentCoreState, row, col);
          if (!newCoreState) return state;
          
          const baseState = coreStateToBaseState(newCoreState);
          const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
          newHistory.push(newCoreState);
          
          return {
            ...state,
            ...baseState,
            board: newCoreState.board,
            scores: newCoreState.scores,
            validMoves: newCoreState.validMoves,
            history: newHistory,
            currentHistoryIndex: newHistory.length - 1,
            visualBoard: newCoreState.board,
            hints: {
              ...state.hints,
              selectedCell: null
            },
            isDraw: baseState.status === 'ended' && !baseState.winner
          };
        } else {
          // 異なるセルをタップ：選択を変更
          return {
            ...state,
            hints: {
              ...state.hints,
              selectedCell: { row, col }
            }
          };
        }
      } else {
        // 通常の移動処理
        const newCoreState = handleCellClickCore(currentCoreState, row, col);
        if (!newCoreState) return state;
        
        const baseState = coreStateToBaseState(newCoreState);
        const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
        newHistory.push(newCoreState);
        
        return {
          ...state,
          ...baseState,
          board: newCoreState.board,
          scores: newCoreState.scores,
          validMoves: newCoreState.validMoves,
          history: newHistory,
          currentHistoryIndex: newHistory.length - 1,
          visualBoard: newCoreState.board,
          isDraw: baseState.status === 'ended' && !baseState.winner
        };
      }
    }
    
    case 'RESET_GAME': {
      return createInitialReversiState();
    }
    
    case 'TOGGLE_HINTS': {
      let newLevel: HintLevel;
      if (state.hints.level === 'off') newLevel = 'basic';
      else if (state.hints.level === 'basic') newLevel = 'advanced';
      else newLevel = 'off';
      
      return {
        ...state,
        hints: {
          ...state.hints,
          level: newLevel,
          selectedCell: null
        }
      };
    }
    
    case 'SET_HINT_LEVEL': {
      return {
        ...state,
        hints: {
          ...state.hints,
          level: action.payload,
          selectedCell: null
        }
      };
    }
    
    case 'SET_SELECTED_HINT_CELL': {
      return {
        ...state,
        hints: {
          ...state.hints,
          selectedCell: action.payload
        }
      };
    }
    
    case 'UNDO_MOVE': {
      if (state.currentHistoryIndex <= 0) return state;
      
      const newIndex = state.currentHistoryIndex - 1;
      const coreState = state.history[newIndex];
      const baseState = coreStateToBaseState(coreState);
      
      return {
        ...state,
        ...baseState,
        board: coreState.board,
        scores: coreState.scores,
        validMoves: coreState.validMoves,
        currentHistoryIndex: newIndex,
        visualBoard: coreState.board,
        isDraw: baseState.status === 'ended' && !baseState.winner
      };
    }
    
    case 'REDO_MOVE': {
      if (state.currentHistoryIndex >= state.history.length - 1) return state;
      
      const newIndex = state.currentHistoryIndex + 1;
      const coreState = state.history[newIndex];
      const baseState = coreStateToBaseState(coreState);
      
      return {
        ...state,
        ...baseState,
        board: coreState.board,
        scores: coreState.scores,
        validMoves: coreState.validMoves,
        currentHistoryIndex: newIndex,
        visualBoard: coreState.board,
        isDraw: baseState.status === 'ended' && !baseState.winner
      };
    }
    
    case 'GOTO_HISTORY': {
      const newIndex = Math.max(0, Math.min(action.payload, state.history.length - 1));
      const coreState = state.history[newIndex];
      const baseState = coreStateToBaseState(coreState);
      
      return {
        ...state,
        ...baseState,
        board: coreState.board,
        scores: coreState.scores,
        validMoves: coreState.validMoves,
        currentHistoryIndex: newIndex,
        visualBoard: coreState.board,
        isDraw: baseState.status === 'ended' && !baseState.winner
      };
    }
    
    case 'START_FLIPPING': {
      return {
        ...state,
        flippingCells: action.payload,
        isFlipping: true
      };
    }
    
    case 'STOP_FLIPPING': {
      return {
        ...state,
        flippingCells: [],
        isFlipping: false
      };
    }
    
    case 'UPDATE_VISUAL_BOARD': {
      return {
        ...state,
        visualBoard: action.payload
      };
    }
    
    default:
      return state;
  }
}

// リバーシ固有のコントローラー型
export interface ReversiController extends 
  HintableGameController<ReversiGameState, ReversiAction>, 
  HistoryGameController<ReversiGameState, ReversiAction> {
  makeMove: (row: number, col: number) => void;
  gotoHistory: (index: number) => void;
  setSelectedHintCell: (position: Position | null) => void;
}

// GameControllerインターフェースを実装したフック
export function useReversi(): ReversiController {
  const [gameState, dispatch] = useReducer(reversiReducer, undefined, createInitialReversiState);
  
  // ゲームリセット
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);
  
  // ヒント機能
  const toggleHints = useCallback(() => {
    dispatch({ type: 'TOGGLE_HINTS' });
  }, []);
  
  const clearHints = useCallback(() => {
    dispatch({ type: 'SET_HINT_LEVEL', payload: 'off' });
  }, []);
  
  // 履歴機能
  const undoMove = useCallback(() => {
    dispatch({ type: 'UNDO_MOVE' });
  }, []);
  
  const redoMove = useCallback(() => {
    dispatch({ type: 'REDO_MOVE' });
  }, []);
  
  const canUndo = gameState.currentHistoryIndex > 0;
  const canRedo = gameState.currentHistoryIndex < gameState.history.length - 1;
  
  // セル移動処理
  const makeMove = useCallback((row: number, col: number) => {
    if (gameState.isFlipping) return;
    dispatch({ type: 'MAKE_MOVE', payload: { row, col } });
  }, [gameState.isFlipping]);
  
  // 履歴ナビゲーション
  const gotoHistory = useCallback((index: number) => {
    dispatch({ type: 'GOTO_HISTORY', payload: index });
  }, []);
  
  // ヒントセル選択
  const setSelectedHintCell = useCallback((position: Position | null) => {
    dispatch({ type: 'SET_SELECTED_HINT_CELL', payload: position });
  }, []);
  
  return {
    gameState,
    dispatch,
    resetGame,
    toggleHints,
    hintState: gameState.hints,
    clearHints,
    undoMove,
    redoMove,
    canUndo,
    canRedo,
    // リバーシ固有のメソッド
    makeMove,
    gotoHistory,
    setSelectedHintCell
  };
}