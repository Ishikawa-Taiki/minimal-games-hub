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
  variant?: 'default' | 'slim';
}

/**
 * ゲームの状態（手番や勝敗など）を表示するための共通コンポーネント
 */
export function GameStateDisplay<TState extends BaseGameState, TAction>({
  gameController,
  variant = 'default',
}: GameStateDisplayProps<TState, TAction>) {
  const { isTurnOnly, displayInfo } = gameController;

  if (variant === 'slim' && isTurnOnly) {
    return null;
  }

  const containerStyle = variant === 'slim' ? { ...styles.container, padding: '0', boxShadow: 'none', backgroundColor: 'transparent', margin: 0 } : styles.container;
  const titleStyle = variant === 'slim' ? { ...styles.title, fontSize: '0.75rem' } : styles.title;
  const statusTextStyle = variant === 'slim' ? { ...styles.statusText, fontSize: '1rem', margin: 0 } : styles.statusText;


  return (
    <div style={containerStyle} data-testid="game-state-display">
      {variant === 'default' && <h4 style={titleStyle}>ゲーム状態</h4>}
      <p style={statusTextStyle}>{displayInfo.statusText}</p>
    </div>
  );
}
