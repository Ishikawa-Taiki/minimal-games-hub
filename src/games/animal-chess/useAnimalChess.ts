import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { useDialog } from '@/app/components/ui/DialogProvider';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState } from '@/core/types/game';
import { 
  GameState, 
  createInitialState, 
  handleCellClick as handleCellClickCore,
  handleCaptureClick as handleCaptureClickCore,
  Player,
  OKASHI_TEAM,
  OHANA_TEAM,
  BOARD_ROWS,
  BOARD_COLS,
  getValidMoves,
  getValidDrops,
  isSquareThreatened,
  getValidMovesForPiece,
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
  winner: Player | null;
  lastMove: GameState['lastMove'];
  // ヒント関連
  hintsEnabled: boolean;
}

type AnimalChessAction =
  | { type: 'CELL_CLICK'; row: number; col: number }
  | { type: 'CAPTURE_CLICK'; player: Player; index: number }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_LAST_MOVE' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean }
  | { type: 'SET_GAME_STATE_FOR_TEST'; state: AnimalChessGameState };

function createInitialAnimalChessState(): AnimalChessGameState {
  const coreState = createInitialState();
  return {
    board: coreState.board,
    currentPlayer: coreState.currentPlayer,
    capturedPieces: coreState.capturedPieces,
    selectedCell: coreState.selectedCell,
    selectedCaptureIndex: coreState.selectedCaptureIndex,
    winReason: null,
    lastMove: null,
    // BaseGameState required fields
    status: 'playing' as GameStatus,
    winner: coreState.status === 'okashi_win' ? OKASHI_TEAM :
            coreState.status === 'ohana_win' ? OHANA_TEAM : null,
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
                state.status === 'ended' && state.winner === OKASHI_TEAM ? 'okashi_win' :
                state.status === 'ended' && state.winner === OHANA_TEAM ? 'ohana_win' : 'playing',
        selectedCell: state.selectedCell,
        selectedCaptureIndex: state.selectedCaptureIndex,
        winReason: state.winReason,
        lastMove: state.lastMove,
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
        lastMove: newCoreState.lastMove,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'okashi_win' || newCoreState.status === 'ohana_win' ? 'ended' : 'playing',
        winner: newCoreState.status === 'okashi_win' ? OKASHI_TEAM :
                newCoreState.status === 'ohana_win' ? OHANA_TEAM : null,
      };
    }
    
    case 'CAPTURE_CLICK': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        capturedPieces: state.capturedPieces,
        status: state.status === 'playing' ? 'playing' : 
                state.status === 'ended' && state.winner === OKASHI_TEAM ? 'okashi_win' :
                state.status === 'ended' && state.winner === OHANA_TEAM ? 'ohana_win' : 'playing',
        selectedCell: state.selectedCell,
        selectedCaptureIndex: state.selectedCaptureIndex,
        winReason: state.winReason,
        lastMove: state.lastMove,
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
        lastMove: newCoreState.lastMove,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'okashi_win' || newCoreState.status === 'ohana_win' ? 'ended' : 'playing',
        winner: newCoreState.status === 'okashi_win' ? OKASHI_TEAM :
                newCoreState.status === 'ohana_win' ? OHANA_TEAM : null,
      };
    }
    
    case 'RESET_GAME':
      return createInitialAnimalChessState();

    case 'CLEAR_LAST_MOVE':
      return {
        ...state,
        lastMove: null,
      };
    
    case 'SET_HINTS_ENABLED':
      return {
        ...state,
        hintsEnabled: action.enabled,
      };
    
    case 'SET_GAME_STATE_FOR_TEST':
      return action.state;

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
  };

const TEAM_NAMES: { [key in Player]: string } = {
  OKASHI: 'おかしチーム',
  OHANA: 'おはなチーム',
};

export function useAnimalChess(): AnimalChessController {
  const [gameState, dispatch] = useReducer(animalChessReducer, createInitialAnimalChessState());
  const { alert } = useDialog();

  // ログ機能
  const logger = useGameStateLogger('useAnimalChess', gameState, {
    hintsEnabled: gameState.hintsEnabled,
    selectedCell: gameState.selectedCell,
    selectedCaptureIndex: gameState.selectedCaptureIndex,
    capturedPiecesCount: {
      OKASHI: gameState.capturedPieces.OKASHI.length,
      OHANA: gameState.capturedPieces.OHANA.length
    }
  });

  const resetGame = useCallback(() => {
    // logger is not included in dependencies as it's for debugging and changes on every render.
    logger.log('RESET_GAME_CALLED', {});
    dispatch({ type: 'RESET_GAME' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (gameState.winner) {
      const winnerName = TEAM_NAMES[gameState.winner];
      const reasonText = gameState.winReason === 'catch'
        ? 'キャッチ！(ライオンをとったよ！)'
        : 'トライ！ (さいごのますにとうたつしたよ！)';

      alert({
        title: `${winnerName}のかち！`,
        message: reasonText,
      }).then(resetGame);
    }
  }, [gameState.winner, gameState.winReason, alert, resetGame]);

  // アニメーション用にlastMoveを少し遅れてクリアする
  useEffect(() => {
    if (gameState.lastMove) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_LAST_MOVE' });
      }, 500); // アニメーション時間
      return () => clearTimeout(timer);
    }
  }, [gameState.lastMove]);

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
    const coreState: GameState = {
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      capturedPieces: gameState.capturedPieces,
      status: 'playing',
      selectedCell: gameState.selectedCell,
      selectedCaptureIndex: gameState.selectedCaptureIndex,
      winReason: gameState.winReason,
      lastMove: gameState.lastMove,
    };

    const validMoveColor = '#f9fafb'; // Same as selectableCell
    const dangerColor = 'rgba(239, 68, 68, 0.7)'; // Red for danger
    const captureColor = 'rgba(196, 181, 253, 0.7)'; // Light purple for capture
    const canBeCapturedColor = 'rgba(59, 130, 246, 0.7)'; // Blue for "can be captured"

    // 持ち駒選択時のヒント
    if (gameState.selectedCaptureIndex !== null) {
      const pieceType = gameState.capturedPieces[gameState.currentPlayer][gameState.selectedCaptureIndex.index];
      const drops = getValidDrops(coreState, gameState.currentPlayer, pieceType);
      drops.forEach(drop => {
        let color = validMoveColor;
        if (gameState.hintsEnabled) {
          const tempBoard = coreState.board.map(r => [...r]);
          tempBoard[drop.row][drop.col] = { type: pieceType, owner: gameState.currentPlayer };
          const isThreatened = isSquareThreatened(tempBoard, drop.row, drop.col, gameState.currentPlayer);
          if (isThreatened) {
            color = dangerColor;
          }
        }
        highlightedCells.push({ ...drop, color });
      });
    }
    // 盤上の駒選択時のヒント
    else if (gameState.selectedCell) {
      const moves = getValidMoves(coreState, gameState.selectedCell.row, gameState.selectedCell.col);
      moves.forEach(move => {
        let color = validMoveColor;
        if (gameState.hintsEnabled) {
          const tempBoard = coreState.board.map(r => [...r]);
          tempBoard[move.row][move.col] = tempBoard[gameState.selectedCell!.row][gameState.selectedCell!.col];
          tempBoard[gameState.selectedCell!.row][gameState.selectedCell!.col] = null;
          const isThreatened = isSquareThreatened(tempBoard, move.row, move.col, gameState.currentPlayer);
          const isCapture = !!gameState.board[move.row][move.col];

          if (isThreatened) {
            color = dangerColor;
          } else if (isCapture) {
            color = captureColor;
          }
        }
        highlightedCells.push({ ...move, color });
      });
    }
    // 駒未選択時のヒント (取られる可能性がある駒)
    else if (gameState.hintsEnabled) {
      const opponent = gameState.currentPlayer === OKASHI_TEAM ? OHANA_TEAM : OKASHI_TEAM;
      const threatenedCells = new Set<string>();

      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          const piece = gameState.board[r][c];
          if (piece && piece.owner === opponent) {
            const moves = getValidMovesForPiece(coreState.board, opponent, r, c);
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
        highlightedCells.push({ row, col, color: canBeCapturedColor });
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

  const displayInfo = useMemo(() => {
    if (gameState.winner) {
      return { statusText: `${TEAM_NAMES[gameState.winner]}のかち` };
    } else if (gameState.status === 'ended') {
      return { statusText: 'ゲーム終了' };
    } else if (gameState.status === 'playing' && gameState.currentPlayer) {
      return { statusText: `「${TEAM_NAMES[gameState.currentPlayer]}」のばん` };
    } else {
      return { statusText: 'ゲーム開始' };
    }
  }, [gameState.winner, gameState.status, gameState.currentPlayer]);

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
    // HintableGameController
    hintState,
    setHints,
    isTurnOnly: useMemo(() => {
      return (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner;
    }, [gameState.status, gameState.winner]),
    displayInfo,
  };
}