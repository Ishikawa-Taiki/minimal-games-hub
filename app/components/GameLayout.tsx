'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResponsive, isMobile } from '../../hooks/useResponsive';
import { BaseGameState, BaseGameController, HintableGameController, HistoryGameController } from '../../types/game';
import { FloatingActionButton, BottomSheet } from './ui';
import GameStateDebugger from './GameStateDebugger';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';
import { gameLayoutStyles } from './styles';

interface GameLayoutProps<TState extends BaseGameState, TAction> {
  gameName: string;
  slug: string;
  gameController?: BaseGameController<TState, TAction> |
  HintableGameController<TState, TAction> |
  HistoryGameController<TState, TAction> |
  (HintableGameController<TState, TAction> & HistoryGameController<TState, TAction>);
  children: React.ReactNode;
}

// コントロールパネルコンポーネント
interface ControlPanelProps<TState extends BaseGameState, TAction> {
  gameController: BaseGameController<TState, TAction> |
  HintableGameController<TState, TAction> |
  HistoryGameController<TState, TAction> |
  (HintableGameController<TState, TAction> & HistoryGameController<TState, TAction>);
  slug: string;
  isVisible?: boolean;
}

function ControlPanel<TState extends BaseGameState, TAction>({
  gameController,
  slug,
  isVisible = true
}: ControlPanelProps<TState, TAction>) {
  const { gameState, resetGame } = gameController;

  // ゲーム状態の表示テキストを生成（ポリモーフィック設計）
  const getStatusText = () => {
    // 各ゲームコントローラーが自身の状態表示ロジックを持つ
    if ('getDisplayStatus' in gameController && typeof gameController.getDisplayStatus === 'function') {
      return gameController.getDisplayStatus();
    }
    
    // フォールバック: 汎用的な状態表示
    if (gameState.winner) {
      if (gameState.winner === 'DRAW') {
        return '引き分け！';
      }
      return `勝者: ${gameState.winner}`;
    } else if (gameState.status === 'ended') {
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

  // ゲーム固有のスコア表示（ポリモーフィック設計）
  const renderScoreInfo = () => {
    // 新しい設計: 各ゲームコントローラーが自身のスコア情報を提供
    if ('getScoreInfo' in gameController && typeof gameController.getScoreInfo === 'function') {
      const scoreInfo = gameController.getScoreInfo();
      if (scoreInfo) {
        return (
          <div style={gameLayoutStyles.scoreInfo}>
            <h4 style={gameLayoutStyles.sectionTitle}>{scoreInfo.title}</h4>
            <div style={gameLayoutStyles.scoreDisplay}>
              {scoreInfo.items.map((item, index) => (
                <span key={index}>{item.label}: {item.value}</span>
              ))}
            </div>
          </div>
        );
      }
    }

    // レガシー対応: リバーシ（まだ新しい設計に対応していない）
    const reversiState = gameState as TState & { scores?: { BLACK: number; WHITE: number } };
    if (reversiState.scores) {
      return (
        <div style={gameLayoutStyles.scoreInfo}>
          <h4 style={gameLayoutStyles.sectionTitle}>スコア</h4>
          <div style={gameLayoutStyles.scoreDisplay}>
            <span>黒: {reversiState.scores.BLACK}</span>
            <span>白: {reversiState.scores.WHITE}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  // ヒント機能のボタン
  const renderHintButton = () => {
    const hintController = gameController as BaseGameController<TState, TAction> & { toggleHints?: () => void };
    if (hintController.toggleHints) {
      return (
        <button
          style={gameLayoutStyles.controlButton}
          onClick={hintController.toggleHints}
          data-testid="control-panel-hint-button"
        >
          ヒント切り替え
        </button>
      );
    }
    return null;
  };

  if (!isVisible) return null;

  return (
    <div style={gameLayoutStyles.controlPanel}>
      <div style={gameLayoutStyles.statusSection}>
        <h4 style={gameLayoutStyles.sectionTitle}>ゲーム状態</h4>
        <p style={gameLayoutStyles.statusText} data-testid="status">{getStatusText()}</p>
      </div>

      {renderScoreInfo()}

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
          data-testid="control-panel-reset-button"
        >
          リセット
        </button>
        {renderHintButton()}
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
  console.log('GameLayout rendered with:', { gameName, slug, gameController: !!gameController });
  const responsiveState = useResponsive();
  console.log('Responsive state:', responsiveState);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // ログ機能
  const logger = useGameStateLogger('GameLayout', gameController?.gameState || {}, {
    gameName,
    slug,
    responsiveState,
    hasGameController: !!gameController
  });

  const handleFABClick = () => {
    logger.log('FAB_CLICKED', { isBottomSheetOpen });
    setIsBottomSheetOpen(true);
  };

  const handleBottomSheetClose = () => {
    logger.log('BOTTOM_SHEET_CLOSED', {});
    setIsBottomSheetOpen(false);
  };

  // gameControllerが未定義の場合は従来のレイアウトを使用
  if (!gameController) {
    console.log('Using legacy layout - gameController is undefined');
    return (
      <div style={gameLayoutStyles.container}>
        <main style={gameLayoutStyles.main}>
          {children}
        </main>
      </div>
    );
  }

  if (isMobile(responsiveState)) {
    console.log('Using mobile layout');
    // モバイルレイアウト: ミニマルレイアウト + FAB + ボトムシート
    return (
      <div style={gameLayoutStyles.mobileContainer}>
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

        {/* デバッガー（開発環境でのみ表示） */}
        <GameStateDebugger
          isVisible={process.env.NODE_ENV === 'development'}
          position="bottom-left"
        />
      </div>
    );
  } else {
    console.log('Using desktop layout');
    // PCレイアウト: サイドバーレイアウト
    return (
      <div style={gameLayoutStyles.desktopContainer}>
        {/* サイドバー（コントロールパネル） */}
        <aside style={gameLayoutStyles.sidebar}>
          <ControlPanel
            gameController={gameController}
            slug={slug}
          />
        </aside>

        {/* メインコンテンツ（ゲームボード） */}
        <main style={gameLayoutStyles.desktopMain}>
          {children}
        </main>

        {/* デバッガー（開発環境でのみ表示） */}
        <GameStateDebugger
          isVisible={process.env.NODE_ENV === 'development'}
          position="bottom-right"
        />
      </div>
    );
  }
}
