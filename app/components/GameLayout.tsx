'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResponsive, isMobile } from '../../hooks/useResponsive';
import { BaseGameState, BaseGameController } from '../../types/game';
import { FloatingActionButton, BottomSheet } from './ui';
import { gameLayoutStyles } from './styles';

interface GameLayoutProps<TState extends BaseGameState, TAction> {
  gameName: string;
  slug: string;
  gameController?: BaseGameController<TState, TAction>;
  children: React.ReactNode;
}

// コントロールパネルコンポーネント
interface ControlPanelProps<TState extends BaseGameState, TAction> {
  gameController: BaseGameController<TState, TAction>;
  slug: string;
  isVisible?: boolean;
}

function ControlPanel<TState extends BaseGameState, TAction>({
  gameController,
  slug,
  isVisible = true
}: ControlPanelProps<TState, TAction>) {
  const { gameState, resetGame } = gameController;
  
  // ゲーム状態の表示テキストを生成
  const getStatusText = () => {
    if (gameState.winner) {
      return `勝者: ${gameState.winner}`;
    } else if (gameState.status === 'ended') {
      // 引き分けの場合の処理を追加
      const extendedState = gameState as TState & { isDraw?: boolean };
      if (extendedState.isDraw) {
        return '引き分け！';
      }
      return 'ゲーム終了';
    } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      return `${gameState.currentPlayer}の番`;
    } else {
      return 'ゲーム開始';
    }
  };

  if (!isVisible) return null;

  return (
    <div style={gameLayoutStyles.controlPanel}>
      <div style={gameLayoutStyles.statusSection}>
        <h4 style={gameLayoutStyles.sectionTitle}>ゲーム状態</h4>
        <p style={gameLayoutStyles.statusText} data-testid="status">{getStatusText()}</p>
      </div>

      <div style={gameLayoutStyles.actionsSection}>
        <Link 
          href={`/games/${slug}/rules`} 
          style={gameLayoutStyles.controlButton}
        >
          ルールを見る
        </Link>
        <button 
          style={gameLayoutStyles.controlButton}
          onClick={resetGame}
          data-testid="reset-button"
        >
          リセット
        </button>
        <Link 
          href="/" 
          style={gameLayoutStyles.controlButton}
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}



export default function GameLayout<TState extends BaseGameState, TAction>({
  gameName,
  slug,
  gameController,
  children
}: GameLayoutProps<TState, TAction>) {
  const responsiveState = useResponsive();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleFABClick = () => {
    setIsBottomSheetOpen(true);
  };

  const handleBottomSheetClose = () => {
    setIsBottomSheetOpen(false);
  };

  // gameControllerが未定義の場合は従来のレイアウトを使用
  if (!gameController) {
    return (
      <div style={gameLayoutStyles.container}>
        <header style={gameLayoutStyles.header}>
          <h1 style={gameLayoutStyles.headerTitle}>{gameName}</h1>
          <div style={gameLayoutStyles.linksContainer}>
            <Link href={`/games/${slug}/rules`} style={{...gameLayoutStyles.link, ...gameLayoutStyles.rulesLink}}>
              Rules
            </Link>
            <Link href="/" style={{...gameLayoutStyles.link, ...gameLayoutStyles.homeLink}}>
              Back to Home
            </Link>
          </div>
        </header>
        <main style={gameLayoutStyles.main}>
          {children}
        </main>
      </div>
    );
  }

  if (isMobile(responsiveState)) {
    // モバイルレイアウト: ミニマルレイアウト + FAB + ボトムシート
    return (
      <div style={gameLayoutStyles.mobileContainer}>
        {/* スリムヘッダー */}
        <header style={gameLayoutStyles.mobileHeader}>
          <h1 style={gameLayoutStyles.mobileHeaderTitle}>{gameName}</h1>
          <div style={gameLayoutStyles.mobileStatus} data-testid="status">
            {gameController.gameState.winner ? (
              `勝者: ${gameController.gameState.winner}`
            ) : gameController.gameState.status === 'ended' ? (
              // 引き分けの場合の処理を追加
              (gameController.gameState as TState & { isDraw?: boolean }).isDraw ? '引き分け！' : 'ゲーム終了'
            ) : (gameController.gameState.status === 'playing' || gameController.gameState.status === 'waiting') && gameController.gameState.currentPlayer ? (
              `${gameController.gameState.currentPlayer}の番`
            ) : (
              'ゲーム開始'
            )}
          </div>
        </header>

        {/* ゲームボード（フルエリア） */}
        <main style={gameLayoutStyles.mobileMain}>
          {children}
        </main>

        {/* フローティングアクションボタン */}
        <FloatingActionButton
          onClick={handleFABClick}
          ariaLabel="コントロールパネルを開く"
          icon="⚙️"
        />

        {/* ボトムシート */}
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={handleBottomSheetClose}
          title="コントロール"
        >
          <ControlPanel
            gameController={gameController}
            slug={slug}
          />
        </BottomSheet>
      </div>
    );
  } else {
    // PCレイアウト: サイドバーレイアウト
    return (
      <div style={gameLayoutStyles.desktopContainer}>
        {/* サイドバー（コントロールパネル） */}
        <aside style={gameLayoutStyles.sidebar}>
          <div style={gameLayoutStyles.sidebarHeader}>
            <h1 style={gameLayoutStyles.sidebarTitle}>{gameName}</h1>
          </div>
          <ControlPanel
            gameController={gameController}
            slug={slug}
          />
        </aside>

        {/* メインコンテンツ（ゲームボード） */}
        <main style={gameLayoutStyles.desktopMain}>
          {children}
        </main>
      </div>
    );
  }
}
