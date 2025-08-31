import { useReducer, useCallback, useMemo } from 'react';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState, Position, ScoreInfo } from '../../types/game';
import { 
  GameState, 
  createInitialState, 
  handleCellClick as handleCellClickCore,
  handleCaptureClick as handleCaptureClickCore,
  Player,
  SENTE,
  GOTE
} from './core';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';

// アニマルチェス固有の状態をBaseGameStateに適合させる
interface AnimalChessGameState extends BaseGameState {
  board: GameState['board'];
  currentPlayer: Player;
  capturedPieces: GameState['capturedPieces'];
  selectedCell: GameState['selectedCell'];
  selectedCaptureIndex: GameState['selectedCaptureIndex'];
  // ヒント関連
  hintsEnabled: boolean;
}

type AnimalChessAction = 
  | { type: 'CELL_CLICK'; row: number; col: number }
  | { type: 'CAPTURE_CLICK'; player: Player; index: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean };

function createInitialAnimalChessState(): AnimalChessGameState {
  const coreState = createInitialState();
  return {
    board: coreState.board,
    currentPlayer: coreState.currentPlayer,
    capturedPieces: coreState.capturedPieces,
    selectedCell: coreState.selectedCell,
    selectedCaptureIndex: coreState.selectedCaptureIndex,
    // BaseGameState required fields
    status: 'playing' as GameStatus,
    winner: coreState.status === 'sente_win' ? SENTE : 
            coreState.status === 'gote_win' ? GOTE : null,
    // ヒント関連
    hintsEnabled: false,
  };
}

function animalChessReducer(state: AnimalChessGameState, action: AnimalChessAction): AnimalChessGameState {
  switch (action.type) {
    case 'CELL_CLICK': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        capturedPieces: state.capturedPieces,
        status: state.status === 'playing' ? 'playing' : 
                state.status === 'ended' && state.winner === SENTE ? 'sente_win' :
                state.status === 'ended' && state.winner === GOTE ? 'gote_win' : 'playing',
        selectedCell: state.selectedCell,
        selectedCaptureIndex: state.selectedCaptureIndex,
      };
      
      const newCoreState = handleCellClickCore(coreState, action.row, action.col);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        capturedPieces: newCoreState.capturedPieces,
        selectedCell: newCoreState.selectedCell,
        selectedCaptureIndex: newCoreState.selectedCaptureIndex,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'sente_win' || newCoreState.status === 'gote_win' ? 'ended' : 'playing',
        winner: newCoreState.status === 'sente_win' ? SENTE : 
                newCoreState.status === 'gote_win' ? GOTE : null,
      };
    }
    
    case 'CAPTURE_CLICK': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        capturedPieces: state.capturedPieces,
        status: state.status === 'playing' ? 'playing' : 
                state.status === 'ended' && state.winner === SENTE ? 'sente_win' :
                state.status === 'ended' && state.winner === GOTE ? 'gote_win' : 'playing',
        selectedCell: state.selectedCell,
        selectedCaptureIndex: state.selectedCaptureIndex,
      };
      
      const newCoreState = handleCaptureClickCore(coreState, action.player, action.index);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        capturedPieces: newCoreState.capturedPieces,
        selectedCell: newCoreState.selectedCell,
        selectedCaptureIndex: newCoreState.selectedCaptureIndex,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'sente_win' || newCoreState.status === 'gote_win' ? 'ended' : 'playing',
        winner: newCoreState.status === 'sente_win' ? SENTE : 
                newCoreState.status === 'gote_win' ? GOTE : null,
      };
    }
    
    case 'RESET_GAME':
      return createInitialAnimalChessState();
    
    case 'SET_HINTS_ENABLED':
      return {
        ...state,
        hintsEnabled: action.enabled,
      };
    
    default:
      return state;
  }
}

export type AnimalChessController = BaseGameController<AnimalChessGameState, AnimalChessAction> & 
  HintableGameController<AnimalChessGameState, AnimalChessAction> & {
    // アニマルチェス固有のメソッド
    handleCellClick: (row: number, col: number) => void;
    handleCaptureClick: (player: Player, index: number) => void;
    // 状態アクセサー
    getCurrentPlayer: () => Player;
    getCapturedPieces: () => GameState['capturedPieces'];
    getSelectedCell: () => GameState['selectedCell'];
    getSelectedCaptureIndex: () => GameState['selectedCaptureIndex'];
    getBoard: () => GameState['board'];
    // 状態表示
    getDisplayStatus: () => string;
    // スコア情報
    getScoreInfo: () => ScoreInfo | null;
  };

export function useAnimalChess(): AnimalChessController {
  const [gameState, dispatch] = useReducer(animalChessReducer, createInitialAnimalChessState());
  
  // ログ機能
  const logger = useGameStateLogger('useAnimalChess', gameState, {
    hintsEnabled: gameState.hintsEnabled,
    selectedCell: gameState.selectedCell,
    selectedCaptureIndex: gameState.selectedCaptureIndex,
    capturedPiecesCount: {
      SENTE: gameState.capturedPieces.SENTE.length,
      GOTE: gameState.capturedPieces.GOTE.length
    }
  });

  const resetGame = useCallback(() => {
    logger.log('RESET_GAME_CALLED', {});
    dispatch({ type: 'RESET_GAME' });
  }, [logger]);

  const handleCellClick = useCallback((row: number, col: number) => {
    logger.log('CELL_CLICK_CALLED', { 
      row, 
      col, 
      currentPlayer: gameState.currentPlayer, 
      hintsEnabled: gameState.hintsEnabled,
      hasSelectedCell: !!gameState.selectedCell,
      hasSelectedCaptureIndex: !!gameState.selectedCaptureIndex
    });
    dispatch({ type: 'CELL_CLICK', row, col });
  }, [gameState.currentPlayer, gameState.hintsEnabled, gameState.selectedCell, gameState.selectedCaptureIndex, logger]);

  const handleCaptureClick = useCallback((player: Player, index: number) => {
    logger.log('CAPTURE_CLICK_CALLED', { 
      player, 
      index, 
      currentPlayer: gameState.currentPlayer 
    });
    dispatch({ type: 'CAPTURE_CLICK', player, index });
  }, [gameState.currentPlayer, logger]);

  // ヒント関連
  const hintState: HintState = useMemo(() => {
    const highlightedCells: Position[] = [];
    
    // 選択されたセルがある場合、有効な移動先をハイライト
    if (gameState.hintsEnabled && gameState.selectedCell) {
      // ここでは簡単な実装として、選択されたセルのみをハイライト
      highlightedCells.push({
        row: gameState.selectedCell.row,
        col: gameState.selectedCell.col
      });
    }

    return {
      enabled: gameState.hintsEnabled,
      highlightedCells,
      selectedCell: gameState.selectedCell ? 
        { row: gameState.selectedCell.row, col: gameState.selectedCell.col } : null
    };
  }, [gameState.hintsEnabled, gameState.selectedCell]);

  const setHints = useCallback((enabled: boolean) => {
    logger.log('SET_HINTS_CALLED', { enabled });
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  }, [logger]);

  // アクセサーメソッド
  const getCurrentPlayer = useCallback(() => gameState.currentPlayer, [gameState.currentPlayer]);
  const getCapturedPieces = useCallback(() => gameState.capturedPieces, [gameState.capturedPieces]);
  const getSelectedCell = useCallback(() => gameState.selectedCell, [gameState.selectedCell]);
  const getSelectedCaptureIndex = useCallback(() => gameState.selectedCaptureIndex, [gameState.selectedCaptureIndex]);
  const getBoard = useCallback(() => gameState.board, [gameState.board]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      if (gameState.winner === SENTE) {
        return '勝者: プレイヤー1';
      } else if (gameState.winner === GOTE) {
        return '勝者: プレイヤー2';
      }
      return 'ゲーム終了'; // その他の勝者の場合
    } else if (gameState.status === 'ended') {
      return 'ゲーム終了';
    } else if (gameState.status === 'playing' && gameState.currentPlayer) {
      return `いまのばん: ${gameState.currentPlayer === SENTE ? 'プレイヤー1' : 'プレイヤー2'}`;
    } else {
      return 'ゲーム開始';
    }
  }, [gameState.winner, gameState.status, gameState.currentPlayer]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    return {
      title: '捕獲駒数',
      items: [
        { label: 'プレイヤー1', value: `${gameState.capturedPieces.SENTE.length}個` },
        { label: 'プレイヤー2', value: `${gameState.capturedPieces.GOTE.length}個` }
      ]
    };
  }, [gameState.capturedPieces]);

  return {
    gameState,
    dispatch,
    resetGame,
    handleCellClick,
    handleCaptureClick,
    getCurrentPlayer,
    getCapturedPieces,
    getSelectedCell,
    getSelectedCaptureIndex,
    getBoard,
    getDisplayStatus,
    getScoreInfo,
    // HintableGameController
    hintState,
    setHints,
  };
}