import { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import {
  createInitialState,
  selectLine as coreSelectLine,
  calculateRemainingLinesCounts,
  getPreview,
  type Difficulty,
  type GameState,
  type Player,
  type Preview,
} from './core';
import type {
  HintableGameController,
  ScoreInfo,
} from '@/core/types/game';
import { useDialog } from '@/app/components/ui/DialogProvider';

// GameControllerの型定義を更新
export type DotsAndBoxesController = HintableGameController<GameState, Action> & {
  setDifficulty: (difficulty: Difficulty) => void;
  selectLine: (r: number, c: number, type: 'h' | 'v') => void;
  getScoreInfo: () => ScoreInfo;
  getPlayerDisplayName: (player: Player) => string;
  remainingLinesCounts: number[][];
  preview: Preview | null;
};

// Actionからプレビュー関連を削除し、よりシンプルに
type Action =
  | { type: 'SELECT_LINE'; payload: { r: number; c: number; type: 'h' | 'v' } }
  | { type: 'START_GAME'; payload: { difficulty: Difficulty } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS'; payload: { enabled: boolean } };

const initialGameState = createInitialState('easy');

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.payload.difficulty);
    case 'RESET_GAME':
      return { ...initialGameState, status: 'waiting' };
    case 'SELECT_LINE':
      return coreSelectLine(
        state,
        action.payload.r,
        action.payload.c,
        action.payload.type
      );
    case 'SET_HINTS':
      return { ...state, hintsEnabled: action.payload.enabled };
    default:
      return state;
  }
};

export const useDotsAndBoxes = (): DotsAndBoxesController => {
  const [gameState, dispatch] = useReducer(reducer, {
    ...initialGameState,
    status: 'waiting',
  });
  const [preview, setPreview] = useState<Preview | null>(null);
  const { alert } = useDialog();

  const getPlayerDisplayName = useCallback((player: Player): string => {
    return player === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const { status, winner, scores } = gameState;
  useEffect(() => {
    if (status === 'ended' && winner) {
      const title =
        winner === 'draw'
          ? 'ひきわけ'
          : `${getPlayerDisplayName(winner)}のかち！`;
      const message = `プレイヤー1: ${scores.player1} vs プレイヤー2: ${scores.player2}`;
      alert({ title, message }).then(resetGame);
    }
  }, [status, winner, scores, alert, resetGame, getPlayerDisplayName]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', payload: { difficulty } });
  }, []);

  // ヒント機能のON/OFFで処理を分岐させる
  const handleLineSelection = useCallback(
    (r: number, c: number, type: 'h' | 'v') => {
      // すでに引かれているラインは無視
      const line = type === 'h' ? gameState.hLines[r][c] : gameState.vLines[r][c];
      if (line.owner) return;

      if (!gameState.hintsEnabled) {
        // ヒントOFF: 即座に手を確定
        dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
        return;
      }

      // ヒントON: プレビューロジック
      const newPreview = getPreview(gameState, r, c, type);
      if (preview && preview.line.r === r && preview.line.c === c && preview.line.type === type) {
        // 同じラインを再度クリック: 手を確定
        dispatch({ type: 'SELECT_LINE', payload: { r, c, type } });
        setPreview(null);
      } else {
        // 違うラインをクリック: プレビューを更新
        setPreview(newPreview);
      }
    },
    [gameState, preview]
  );

  const setHints = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'SET_HINTS', payload: { enabled } });
      if (!enabled) {
        setPreview(null); // ヒントをOFFにしたらプレビューも消す
      }
    },
    []
  );

  // アーキテクチャガイドラインに準拠したスコア情報
  const getScoreInfo = useCallback((): ScoreInfo => {
    return {
      title: '獲得したかず',
      items: [
        {
          label: getPlayerDisplayName('player1'),
          value: gameState.scores.player1,
        },
        {
          label: getPlayerDisplayName('player2'),
          value: gameState.scores.player2,
        },
      ],
    };
  }, [gameState.scores, getPlayerDisplayName]);

  // 残りライン数を計算する
  const remainingLinesCounts = useMemo(() => {
    if (!gameState.hintsEnabled || gameState.status !== 'playing') {
      // 空の配列を返すか、計算しない
      return Array(gameState.rows).fill(Array(gameState.cols).fill(0));
    }
    return calculateRemainingLinesCounts(gameState);
  }, [gameState]);

  const getDisplayStatus = useCallback(() => {
     if (gameState.status === 'ended') {
      if (gameState.winner === 'draw') {
        return 'ひきわけ';
      }
      const winnerName = getPlayerDisplayName(gameState.winner as Player);
      return `${winnerName}のかち！`;
    }
    if (gameState.status === 'waiting') {
      return 'むずかしさをえらんでね';
    }
    const playerName = getPlayerDisplayName(gameState.currentPlayer);
    return `「${playerName}」のばん`;
  }, [gameState.status, gameState.winner, gameState.currentPlayer, getPlayerDisplayName]);


  return {
    gameState,
    dispatch,
    resetGame,
    setDifficulty,
    selectLine: handleLineSelection,
    setHints,
    getScoreInfo,
    getPlayerDisplayName,
    remainingLinesCounts,
    preview,
    getDisplayStatus,
  };
};