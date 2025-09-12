import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { useDialog } from '@/app/components/ui/DialogProvider';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState, ScoreInfo } from '@/core/types/game';
import { 
  GameState, 
  createInitialState, 
  handleCellClick as handleCellClickCore,
  handleCaptureClick as handleCaptureClickCore,
  Player,
  SENTE,
  BOARD_ROWS,
  BOARD_COLS,
  GOTE,
  getValidMoves,
  getValidDrops,
  isSquareThreatened,
} from './core';
import { useGameStateLogger } from '@/core/hooks/useGameStateLogger';

// アニマルチェス固有の状態をBaseGameStateに適合させる
interface AnimalChessGameState extends BaseGameState {
  board: GameState['board'];
  currentPlayer: Player;
  capturedPieces: GameState['capturedPieces'];
  selectedCell: GameState['selectedCell'];
  selectedCaptureIndex: GameState['selectedCaptureIndex'];
  winReason: 'catch' | 'try' | null;
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
    winReason: null,
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
        winReason: state.winReason,
      };
      
      const newCoreState = handleCellClickCore(coreState, action.row, action.col);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        capturedPieces: newCoreState.capturedPieces,
        selectedCell: newCoreState.selectedCell,
        selectedCaptureIndex: newCoreState.selectedCaptureIndex,
        winReason: newCoreState.winReason,
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
        winReason: state.winReason,
      };
      
      const newCoreState = handleCaptureClickCore(coreState, action.player, action.index);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        capturedPieces: newCoreState.capturedPieces,
        selectedCell: newCoreState.selectedCell,
        selectedCaptureIndex: newCoreState.selectedCaptureIndex,
        winReason: newCoreState.winReason,
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
  const { alert } = useDialog();

  useEffect(() => {
    if (gameState.winner) {
      const winnerName = gameState.winner;
      const reasonText = gameState.winReason === 'catch'
        ? 'キャッチ！(ライオンをとったよ！)'
        : 'トライ！ (さいごのますにとうたつしたよ！)';

      alert({
        title: `${winnerName}のかち！`,
        message: reasonText,
      }).then(() => {
        dispatch({ type: 'RESET_GAME' });
      });
    }
  }, [gameState.winner, gameState.winReason, alert]);
  
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
    const highlightedCells: HintState['highlightedCells'] = [];
    if (!gameState.hintsEnabled) {
      return { enabled: false, highlightedCells, selectedCell: gameState.selectedCell };
    }

    const coreState: GameState = {
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      capturedPieces: gameState.capturedPieces,
      status: 'playing',
      selectedCell: gameState.selectedCell,
      selectedCaptureIndex: gameState.selectedCaptureIndex,
      winReason: gameState.winReason,
    };

    // 持ち駒選択時のヒント
    if (gameState.selectedCaptureIndex !== null) {
      const pieceType = gameState.capturedPieces[gameState.currentPlayer][gameState.selectedCaptureIndex.index];
      const drops = getValidDrops(coreState, gameState.currentPlayer, pieceType);
      drops.forEach(drop => {
        highlightedCells.push({ ...drop, color: 'rgba(251, 191, 36, 0.7)' }); // Yellow
      });
    }
    // 盤上の駒選択時のヒント
    else if (gameState.selectedCell) {
      const moves = getValidMoves(coreState, gameState.selectedCell.row, gameState.selectedCell.col);
      moves.forEach(move => {
        // Simulate the move to check for threats
        const tempBoard = coreState.board.map(r => [...r]);
        tempBoard[move.row][move.col] = tempBoard[gameState.selectedCell!.row][gameState.selectedCell!.col];
        tempBoard[gameState.selectedCell!.row][gameState.selectedCell!.col] = null;

        const isThreatened = isSquareThreatened(tempBoard, move.row, move.col, gameState.currentPlayer);

        if (isThreatened) {
          highlightedCells.push({ ...move, color: 'rgba(196, 181, 253, 0.7)' }); // Light purple for danger
        } else {
          const isCapture = !!gameState.board[move.row][move.col];
          const color = isCapture ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'; // Red or Green
          highlightedCells.push({ ...move, color });
        }
      });
    }
    // 駒未選択時のヒント (取られる可能性がある駒)
    else {
      const opponent = gameState.currentPlayer === SENTE ? GOTE : SENTE;
      const threatenedCells = new Set<string>();

      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          const piece = gameState.board[r][c];
          if (piece && piece.owner === opponent) {
            const moves = getValidMoves(coreState, r, c);
            moves.forEach(move => {
              const targetPiece = gameState.board[move.row][move.col];
              if (targetPiece && targetPiece.owner === gameState.currentPlayer) {
                threatenedCells.add(`${move.row},${move.col}`);
              }
            });
          }
        }
      }
      threatenedCells.forEach(cell => {
        const [row, col] = cell.split(',').map(Number);
        highlightedCells.push({ row, col, color: 'rgba(59, 130, 246, 0.7)' }); // Blue for "can be captured"
      });
    }

    return {
      enabled: gameState.hintsEnabled,
      highlightedCells,
      selectedCell: gameState.selectedCell
    };
  }, [gameState]);

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
      return `勝者: ${gameState.winner}`;
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