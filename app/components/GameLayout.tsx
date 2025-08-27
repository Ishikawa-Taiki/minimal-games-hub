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

  // ゲーム状態の表示テキストを生成
  const getStatusText = () => {
    // リバーシ固有の状態チェック
    const reversiState = gameState as TState & {
      gameStatus?: 'PLAYING' | 'SKIPPED' | 'GAME_OVER';
      currentPlayer?: 'BLACK' | 'WHITE';
    };

    // はさみ将棋固有の状態チェック
    const hasamiShogiState = gameState as TState & {
      gameStatus?: 'PLAYING' | 'GAME_OVER';
      currentPlayer?: 'PLAYER1' | 'PLAYER2';
      winCondition?: string;
    };

    if (gameState.winner) {
      if (gameState.winner === 'DRAW') {
        return '引き分け！';
      }
      // はさみ将棋の勝者表示
      if (gameState.winner === 'PLAYER1') {
        return '勝者: 歩';
      } else if (gameState.winner === 'PLAYER2') {
        return '勝者: と';
      }
      return `勝者: ${gameState.winner === 'BLACK' ? '黒' : gameState.winner === 'WHITE' ? '白' : gameState.winner}`;
    } else if (reversiState.gameStatus === 'GAME_OVER' || hasamiShogiState.gameStatus === 'GAME_OVER') {
      return 'ゲーム終了';
    } else if (reversiState.gameStatus === 'SKIPPED') {
      const skippedPlayer = reversiState.currentPlayer === 'BLACK' ? '白' : '黒';
      return `${skippedPlayer}はパス - ${reversiState.currentPlayer === 'BLACK' ? '黒' : '白'}の番`;
    } else if (hasamiShogiState.gameStatus === 'PLAYING' && hasamiShogiState.currentPlayer) {
      return `「${hasamiShogiState.currentPlayer === 'PLAYER1' ? '歩' : 'と'}」の番`;
    } else if (reversiState.gameStatus === 'PLAYING' && reversiState.currentPlayer) {
      return `${reversiState.currentPlayer === 'BLACK' ? '黒' : '白'}の番`;
    } else if (gameState.status === 'ended') {
      // 引き分けの場合の処理を追加
      const extendedState = gameState as TState & { isDraw?: boolean };
      if (extendedState.isDraw) {
        return '引き分け！';
      }
      return 'ゲーム終了';
    } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      // はさみ将棋のプレイヤー名変換
      if (gameState.currentPlayer === 'PLAYER1') {
        return '「歩」の番';
      } else if (gameState.currentPlayer === 'PLAYER2') {
        return '「と」の番';
      }
      return `${gameState.currentPlayer}の番`;
    } else {
      return 'ゲーム開始';
    }
  };

  // ゲーム固有のスコア表示
  const renderScoreInfo = () => {
    // リバーシのスコア表示
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

    // はさみ将棋の捕獲数表示
    const hasamiShogiState = gameState as TState & { capturedPieces?: { PLAYER1: number; PLAYER2: number } };
    if (hasamiShogiState.capturedPieces) {
      return (
        <div style={gameLayoutStyles.scoreInfo}>
          <h4 style={gameLayoutStyles.sectionTitle}>捕獲数</h4>
          <div style={gameLayoutStyles.scoreDisplay}>
            <span>「歩」: {hasamiShogiState.capturedPieces.PLAYER2}</span>
            <span>「と」: {hasamiShogiState.capturedPieces.PLAYER1}</span>
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
        <header style={gameLayoutStyles.header}>
          <h1 style={gameLayoutStyles.headerTitle}>{gameName}</h1>
          <div style={gameLayoutStyles.linksContainer}>
            <Link href={`/games/${slug}/rules`} style={{ ...gameLayoutStyles.link, ...gameLayoutStyles.rulesLink }}>
              Rules
            </Link>
            <Link href="/" style={{ ...gameLayoutStyles.link, ...gameLayoutStyles.homeLink }}>
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
    console.log('Using mobile layout');
    // モバイルレイアウト: ミニマルレイアウト + FAB + ボトムシート
    return (
      <div style={gameLayoutStyles.mobileContainer}>
        {/* スリムヘッダー */}
        <header style={gameLayoutStyles.mobileHeader}>
          <h1 style={gameLayoutStyles.mobileHeaderTitle}>{gameName}</h1>
          <div style={gameLayoutStyles.mobileStatus} data-testid="status">
            {(() => {
              if (gameController.gameState.winner) {
                if (gameController.gameState.winner === 'DRAW') {
                  return '引き分け！';
                } else if (gameController.gameState.winner === 'PLAYER1') {
                  return '勝者: 「歩」';
                } else if (gameController.gameState.winner === 'PLAYER2') {
                  return '勝者: 「と」';
                } else if (gameController.gameState.winner === 'BLACK') {
                  return '勝者: 黒';
                } else if (gameController.gameState.winner === 'WHITE') {
                  return '勝者: 白';
                }
                return `勝者: ${gameController.gameState.winner}`;
              } else if (gameController.gameState.status === 'ended') {
                const extendedState = gameController.gameState as TState & { isDraw?: boolean };
                return extendedState.isDraw ? '引き分け！' : 'ゲーム終了';
              } else if ((gameController.gameState.status === 'playing' || gameController.gameState.status === 'waiting') && gameController.gameState.currentPlayer) {
                if (gameController.gameState.currentPlayer === 'PLAYER1') {
                  return '「歩」の番';
                } else if (gameController.gameState.currentPlayer === 'PLAYER2') {
                  return '「と」の番';
                } else if (gameController.gameState.currentPlayer === 'BLACK') {
                  return '黒の番';
                } else if (gameController.gameState.currentPlayer === 'WHITE') {
                  return '白の番';
                }
                return `${gameController.gameState.currentPlayer}の番`;
              } else {
                return 'ゲーム開始';
              }
            })()}
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

        {/* デバッガー（開発環境でのみ表示） */}
        <GameStateDebugger
          isVisible={process.env.NODE_ENV === 'development'}
          position="bottom-right"
        />
      </div>
    );
  }
}
