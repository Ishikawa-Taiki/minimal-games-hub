'use client';

import React from 'react';
import { BaseGameState, BaseGameController } from '@/core/types/game';

/**
 * GameStateDisplayのスタイル定義
 */
const styles = {
  container: {
    padding: '0.5rem 1rem',
    textAlign: 'center',
    backgroundColor: 'var(--background-color, #f3f4f6)',
    borderRadius: '8px',
    margin: '0 auto 1rem auto',
    width: 'fit-content',
    minWidth: '200px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'var(--text-color-secondary, #6b7280)',
  },
  statusText: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--text-color-primary, #1f2937)',
  },
} as const;


/**
 * GameStateDisplayのプロップ定義
 * @template TState - 各ゲームのgameStateの型
 * @template TAction - 各ゲームのactionの型
 */
interface GameStateDisplayProps<TState extends BaseGameState, TAction> {
  gameController: BaseGameController<TState, TAction>;
  isSlim?: boolean; // モバイルのスリムヘッダーとの重複を避けるためのフラグ
}

/**
 * ゲームの状態（手番や勝敗など）を表示するための共通コンポーネント
 */
export function GameStateDisplay<TState extends BaseGameState, TAction>({
  gameController,
  isSlim = false,
}: GameStateDisplayProps<TState, TAction>) {
  const { gameState } = gameController;

  // ゲーム状態の表示テキストを生成する内部関数
  const getStatusText = (): string => {
    // 各ゲームコントローラーが自身の状態表示ロジックを持つ場合、それを優先する
    if ('getDisplayStatus' in gameController && typeof gameController.getDisplayStatus === 'function') {
      return gameController.getDisplayStatus();
    }

    // フォールバックとしての汎用的な状態表示
    if (gameState.winner) {
      if (gameState.winner === 'DRAW') return '引き分け！';
      return `勝者: ${gameState.winner}`;
    }

    if (gameState.status === 'ended') {
      // isDrawプロパティを持つ可能性のある拡張されたStateとして型アサーション
      const extendedState = gameState as TState & { isDraw?: boolean };
      return extendedState.isDraw ? '引き分け！' : 'ゲーム終了';
    }

    if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      return `${gameState.currentPlayer}の番`;
    }

    return 'ゲーム開始';
  };

  const statusText = getStatusText();

  // isSlimがtrueで、かつ情報が手番表示のみの場合、コンポーネントを描画しない
  const isTurnInfoOnly = (gameState.status === 'playing' || gameState.status === 'waiting') && !gameState.winner && !('isDraw' in gameState && gameState.isDraw);
  if (isSlim && isTurnInfoOnly) {
    return null;
  }

  return (
    <div style={styles.container} data-testid="game-state-display">
      <h4 style={styles.title}>ゲーム状態</h4>
      <p style={styles.statusText}>{statusText}</p>
    </div>
  );
}
