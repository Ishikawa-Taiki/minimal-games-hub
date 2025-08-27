import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { BaseGameController, HintableGameController, BaseGameState, GameStatus, HintState, Position, ScoreInfo } from '../../types/game';
import { 
  GameState, 
  createInitialState, 
  handleCardClick as handleCardClickCore,
  clearNonMatchingFlippedCards,
  Difficulty,
  Player
} from './core';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';

// 神経衰弱固有の状態をBaseGameStateに適合させる
interface ConcentrationGameState extends BaseGameState {
  board: GameState['board'];
  currentPlayer: Player;
  scores: GameState['scores'];
  flippedIndices: GameState['flippedIndices'];
  revealedIndices: GameState['revealedIndices'];
  hintedIndices: GameState['hintedIndices'];
  gameStatus: GameState['status'];
  difficulty: Difficulty;
  // ヒント関連
  hintLevel: 'off' | 'on';
  showHints: boolean;
}

type ConcentrationAction = 
  | { type: 'CARD_CLICK'; index: number }
  | { type: 'CLEAR_NON_MATCHING' }
  | { type: 'RESET_GAME'; difficulty?: Difficulty }
  | { type: 'TOGGLE_HINT' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty };

function createInitialConcentrationState(difficulty: Difficulty = 'easy'): ConcentrationGameState {
  const coreState = createInitialState(difficulty);
  return {
    board: coreState.board,
    currentPlayer: coreState.currentPlayer,
    scores: coreState.scores,
    flippedIndices: coreState.flippedIndices,
    revealedIndices: coreState.revealedIndices,
    hintedIndices: coreState.hintedIndices,
    gameStatus: coreState.status,
    difficulty,
    // BaseGameState required fields
    status: 'playing' as GameStatus,
    winner: coreState.winner === 'draw' ? 'DRAW' : 
            coreState.winner === 1 ? 'player1' :
            coreState.winner === 2 ? 'player2' : null,
    // ヒント関連
    hintLevel: 'off',
    showHints: false,
  };
}

function concentrationReducer(state: ConcentrationGameState, action: ConcentrationAction): ConcentrationGameState {
  switch (action.type) {
    case 'CARD_CLICK': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        scores: state.scores,
        flippedIndices: state.flippedIndices,
        revealedIndices: state.revealedIndices,
        hintedIndices: state.hintedIndices,
        status: state.gameStatus,
        winner: state.winner === 'DRAW' ? 'draw' :
                state.winner === 'player1' ? 1 :
                state.winner === 'player2' ? 2 : null,
      };
      
      const newCoreState = handleCardClickCore(coreState, action.index);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        scores: newCoreState.scores,
        flippedIndices: newCoreState.flippedIndices,
        revealedIndices: newCoreState.revealedIndices,
        hintedIndices: newCoreState.hintedIndices,
        gameStatus: newCoreState.status,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'game_over' ? 'ended' : 'playing',
        winner: newCoreState.winner === 'draw' ? 'DRAW' : 
                newCoreState.winner === 1 ? 'player1' :
                newCoreState.winner === 2 ? 'player2' : null,
      };
    }
    
    case 'CLEAR_NON_MATCHING': {
      const coreState: GameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        scores: state.scores,
        flippedIndices: state.flippedIndices,
        revealedIndices: state.revealedIndices,
        hintedIndices: state.hintedIndices,
        status: state.gameStatus,
        winner: state.winner === 'DRAW' ? 'draw' :
                state.winner === 'player1' ? 1 :
                state.winner === 'player2' ? 2 : null,
      };
      
      const newCoreState = clearNonMatchingFlippedCards(coreState);
      
      return {
        ...state,
        board: newCoreState.board,
        currentPlayer: newCoreState.currentPlayer,
        scores: newCoreState.scores,
        flippedIndices: newCoreState.flippedIndices,
        revealedIndices: newCoreState.revealedIndices,
        hintedIndices: newCoreState.hintedIndices,
        gameStatus: newCoreState.status,
        // BaseGameState必須フィールドを明示的に更新
        status: newCoreState.status === 'game_over' ? 'ended' : 'playing',
        winner: newCoreState.winner === 'draw' ? 'DRAW' : 
                newCoreState.winner === 1 ? 'player1' :
                newCoreState.winner === 2 ? 'player2' : null,
      };
    }
    
    case 'RESET_GAME':
      return createInitialConcentrationState(action.difficulty || state.difficulty);
    
    case 'TOGGLE_HINT':
      return {
        ...state,
        hintLevel: state.hintLevel === 'off' ? 'on' : 'off',
        showHints: !state.showHints,
      };
    
    case 'SET_DIFFICULTY':
      return createInitialConcentrationState(action.difficulty);
    
    default:
      return state;
  }
}

export type ConcentrationController = BaseGameController<ConcentrationGameState, ConcentrationAction> & 
  HintableGameController<ConcentrationGameState, ConcentrationAction> & {
    // 神経衰弱固有のメソッド
    handleCardClick: (index: number) => void;
    clearNonMatchingCards: () => void;
    setDifficulty: (difficulty: Difficulty) => void;
    // 状態アクセサー
    getCurrentPlayer: () => Player;
    getScores: () => GameState['scores'];
    getFlippedIndices: () => number[];
    getRevealedIndices: () => number[];
    getHintedIndices: () => number[];
    getBoard: () => GameState['board'];
    getDifficulty: () => Difficulty;
    // ヒント関連
    getHintLevel: () => 'off' | 'on';
    getShowHints: () => boolean;
    // 状態表示
    getDisplayStatus: () => string;
    // スコア情報
    getScoreInfo: () => ScoreInfo | null;
    // ゲーム状態チェック
    isGameStarted: () => boolean;
    isEvaluating: () => boolean;
  };

export function useConcentration(initialDifficulty: Difficulty = 'easy'): ConcentrationController {
  const [gameState, dispatch] = useReducer(concentrationReducer, createInitialConcentrationState(initialDifficulty));
  
  // ログ機能
  const logger = useGameStateLogger('useConcentration', gameState, {
    hintLevel: gameState.hintLevel,
    showHints: gameState.showHints,
    difficulty: gameState.difficulty,
    flippedCount: gameState.flippedIndices.length,
    revealedCount: gameState.revealedIndices.length,
    hintedCount: gameState.hintedIndices.length,
    scores: gameState.scores
  });

  // 評価中の自動処理
  useEffect(() => {
    if (gameState.gameStatus === 'evaluating') {
      const timeoutId = setTimeout(() => {
        logger.log('AUTO_CLEAR_NON_MATCHING', { flippedIndices: gameState.flippedIndices });
        dispatch({ type: 'CLEAR_NON_MATCHING' });
      }, 1200); // 1.2秒待ってからカードを裏返す
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.gameStatus, gameState.flippedIndices, logger]);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    try {
      logger.log('RESET_GAME_CALLED', { difficulty: difficulty || gameState.difficulty });
    } catch (error) {
      console.warn('Logger error:', error);
    }
    dispatch({ type: 'RESET_GAME', difficulty });
  }, [gameState.difficulty, logger]);

  const handleCardClick = useCallback((index: number) => {
    // 評価中はクリックを無視
    if (gameState.gameStatus === 'evaluating') {
      try {
        logger.log('CARD_CLICK_IGNORED_EVALUATING', { index });
      } catch (error) {
        console.warn('Logger error:', error);
      }
      return;
    }
    
    try {
      logger.log('CARD_CLICK_CALLED', { 
        index, 
        currentPlayer: gameState.currentPlayer, 
        hintLevel: gameState.hintLevel,
        flippedCount: gameState.flippedIndices.length,
        isCardFlipped: gameState.board[index]?.isFlipped,
        isCardMatched: gameState.board[index]?.isMatched
      });
    } catch (error) {
      console.warn('Logger error:', error);
    }
    dispatch({ type: 'CARD_CLICK', index });
  }, [gameState.currentPlayer, gameState.hintLevel, gameState.flippedIndices.length, gameState.gameStatus, gameState.board, logger]);

  const clearNonMatchingCards = useCallback(() => {
    logger.log('CLEAR_NON_MATCHING_CALLED', {});
    dispatch({ type: 'CLEAR_NON_MATCHING' });
  }, [logger]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    try {
      logger.log('SET_DIFFICULTY_CALLED', { difficulty });
    } catch (error) {
      console.warn('Logger error:', error);
    }
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, [logger]);

  // ヒント関連
  const hintState: HintState = useMemo(() => {
    const highlightedCells: Position[] = [];
    
    // ヒントが有効な場合、ヒント対象のカードをハイライト
    if (gameState.hintLevel === 'on' && gameState.showHints) {
      gameState.hintedIndices.forEach(index => {
        const row = Math.floor(index / getBoardColumns(gameState.difficulty));
        const col = index % getBoardColumns(gameState.difficulty);
        highlightedCells.push({ row, col });
      });
    }

    return {
      level: gameState.hintLevel === 'off' ? 'off' : 'basic',
      highlightedCells,
    };
  }, [gameState.hintLevel, gameState.showHints, gameState.hintedIndices, gameState.difficulty]);

  const toggleHints = useCallback(() => {
    logger.log('TOGGLE_HINTS_CALLED', { currentLevel: gameState.hintLevel, currentShow: gameState.showHints });
    dispatch({ type: 'TOGGLE_HINT' });
  }, [gameState.hintLevel, gameState.showHints, logger]);

  // アクセサーメソッド
  const getCurrentPlayer = useCallback(() => gameState.currentPlayer, [gameState.currentPlayer]);
  const getScores = useCallback(() => gameState.scores, [gameState.scores]);
  const getFlippedIndices = useCallback(() => gameState.flippedIndices, [gameState.flippedIndices]);
  const getRevealedIndices = useCallback(() => gameState.revealedIndices, [gameState.revealedIndices]);
  const getHintedIndices = useCallback(() => gameState.hintedIndices, [gameState.hintedIndices]);
  const getBoard = useCallback(() => gameState.board, [gameState.board]);
  const getDifficulty = useCallback(() => gameState.difficulty, [gameState.difficulty]);
  const getHintLevel = useCallback(() => gameState.hintLevel, [gameState.hintLevel]);
  const getShowHints = useCallback(() => gameState.showHints, [gameState.showHints]);

  const getDisplayStatus = useCallback(() => {
    if (gameState.winner) {
      if (gameState.winner === 'DRAW') {
        return '引き分け！';
      } else if (gameState.winner === 'player1') {
        return 'プレイヤー1の勝ち！';
      } else if (gameState.winner === 'player2') {
        return 'プレイヤー2の勝ち！';
      }
      return 'ゲーム終了';
    } else if (gameState.gameStatus === 'evaluating') {
      return '...';
    } else if (gameState.gameStatus === 'player1_turn') {
      return 'プレイヤー1の番';
    } else if (gameState.gameStatus === 'player2_turn') {
      return 'プレイヤー2の番';
    } else if (gameState.status === 'ended') {
      return 'ゲーム終了';
    } else if (gameState.flippedIndices.length === 0 && gameState.revealedIndices.length === 0 && gameState.scores.player1 === 0 && gameState.scores.player2 === 0) {
      return 'ゲーム開始';
    } else {
      return 'プレイヤー1の番';
    }
  }, [gameState]);

  const getScoreInfo = useCallback((): ScoreInfo | null => {
    return {
      title: 'スコア',
      items: [
        { label: 'プレイヤー1', value: gameState.scores.player1 },
        { label: 'プレイヤー2', value: gameState.scores.player2 }
      ]
    };
  }, [gameState.scores]);

  const isGameStarted = useCallback(() => {
    return gameState.flippedIndices.length > 0 || 
           gameState.revealedIndices.length > 0 || 
           gameState.scores.player1 > 0 || 
           gameState.scores.player2 > 0;
  }, [gameState.flippedIndices.length, gameState.revealedIndices.length, gameState.scores]);

  const isEvaluating = useCallback(() => {
    return gameState.gameStatus === 'evaluating';
  }, [gameState.gameStatus]);

  return {
    gameState,
    dispatch,
    resetGame,
    handleCardClick,
    clearNonMatchingCards,
    setDifficulty,
    getCurrentPlayer,
    getScores,
    getFlippedIndices,
    getRevealedIndices,
    getHintedIndices,
    getBoard,
    getDifficulty,
    getHintLevel,
    getShowHints,
    getDisplayStatus,
    getScoreInfo,
    isGameStarted,
    isEvaluating,
    // HintableGameController
    hintState,
    toggleHints,
  };
}

// ヘルパー関数：難易度に応じた列数を取得
function getBoardColumns(difficulty: Difficulty): number {
  const columns = {
    easy: 5,
    normal: 8,
    hard: 9,
  };
  return columns[difficulty];
}