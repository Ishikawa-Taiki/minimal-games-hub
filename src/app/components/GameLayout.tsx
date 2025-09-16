'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive, isMobile } from '@/core/hooks/useResponsive';
import { BaseGameState, BaseGameController, HintableGameController, HistoryGameController } from '@/core/types/game';
import { FloatingActionButton, BottomSheet } from './ui';
import GameDebugger from './GameDebugger';
import { useGameStateLogger } from '@/core/hooks/useGameStateLogger';
import { gameLayoutStyles } from './styles';
import MarkdownViewer from './MarkdownViewer';
import { Button, NegativeButton, SelectableButton } from './ui';
import { useDialog } from './ui';

interface GameLayoutProps<TState extends BaseGameState, TAction> {
  gameName: string;
  slug: string;
  gameController: BaseGameController<TState, TAction> |
  HintableGameController<TState, TAction> |
  HistoryGameController<TState, TAction> |
  (HintableGameController<TState, TAction> & HistoryGameController<TState, TAction>);
  children: React.ReactNode;
  rulesContent: string;
}

// コントロールパネルコンポーネント
interface ControlPanelProps<TState extends BaseGameState, TAction> {
  gameController: BaseGameController<TState, TAction> |
  HintableGameController<TState, TAction> |
  HistoryGameController<TState, TAction> |
  (HintableGameController<TState, TAction> & HistoryGameController<TState, TAction>);
  isVisible?: boolean;
  onShowRules: () => void;
}

function ControlPanel<TState extends BaseGameState, TAction>({
  gameController,
  isVisible = true,
  onShowRules,
}: ControlPanelProps<TState, TAction>) {
  const { gameState, resetGame } = gameController;
  const { confirm } = useDialog();
  const router = useRouter();

  const handleReset = async () => {
    const result = await confirm({
      title: 'かくにん',
      message: 'いまのゲームは きえちゃうけど いいかな？',
    });
    if (result) {
      resetGame();
    }
  };

  const handleGoHome = async () => {
    const result = await confirm({
      title: 'かくにん',
      message: 'ゲームをとめて ホームに もどるけど いいかな？',
    });
    if (result) {
      router.push('/');
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
    const hintController = gameController as HintableGameController<TState, TAction>;
    if (hintController.setHints && hintController.hintState) {
      return (
        <SelectableButton
          isSelected={hintController.hintState.enabled}
          onStateChange={(isSelected) => hintController.setHints(isSelected)}
          ariaLabel="おしえて！機能のON/OFFを切り替える"
          data-testid="control-panel-hint-button"
        >
          おしえて！
        </SelectableButton>
      );
    }
    return null;
  };

  if (!isVisible) return null;

  return (
    <div style={gameLayoutStyles.controlPanel}>
      {renderScoreInfo()}

      <div style={gameLayoutStyles.actionsSection}>
        <Button variant="ghost" onClick={onShowRules}>
          ルールを見る
        </Button>
        <NegativeButton onClick={handleReset} data-testid="control-panel-reset-button">
          リセット
        </NegativeButton>
        {renderHintButton()}
        <Button variant="secondary" onClick={handleGoHome}>
          ホームにもどる
        </Button>
      </div>
    </div>
  );
}

export default function GameLayout<TState extends BaseGameState, TAction>({
  gameName,
  slug,
  gameController,
  children,
  rulesContent,
}: GameLayoutProps<TState, TAction>) {
  console.log('GameLayout rendered with:', { gameName, slug, gameController: !!gameController });
  const responsiveState = useResponsive();
  console.log('Responsive state:', responsiveState);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

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

  const modalStyles: { [key: string]: React.CSSProperties } = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    },
    content: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#333',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      paddingBottom: '1rem',
      marginBottom: '1rem',
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
    },
    body: {
      overflowY: 'auto',
    },
  };

  const RulesModal = () => (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>{gameName}のルール</h2>
          <Button variant="ghost" onClick={() => setIsRulesModalOpen(false)} aria-label="閉じる">
            ×
          </Button>
        </div>
        <div style={modalStyles.body}>
          <MarkdownViewer content={rulesContent} />
        </div>
      </div>
    </div>
  );

  if (isMobile(responsiveState)) {
    console.log('Using mobile layout');
    // モバイルレイアウト: ミニマルレイアウト + FAB + ボトムシート
    return (
      <>
        <div style={gameLayoutStyles.mobileContainer}>
          {/* スリムヘッダー */}
          <header style={gameLayoutStyles.mobileHeader}>
            <h1 style={gameLayoutStyles.mobileHeaderTitle}>{gameName}</h1>
            <div style={gameLayoutStyles.mobileStatus} data-testid="status">
              {(() => {
                // ポリモーフィック設計: 各ゲームコントローラーが自身の状態表示ロジックを持つ
                if ('getDisplayStatus' in gameController && typeof gameController.getDisplayStatus === 'function') {
                  return gameController.getDisplayStatus();
                }

                // フォールバック: 汎用的な状態表示
                if (gameController.gameState.winner) {
                  if (gameController.gameState.winner === 'DRAW') {
                    return '引き分け！';
                  }
                  return `勝者: ${gameController.gameState.winner}`;
                } else if (gameController.gameState.status === 'ended') {
                  const extendedState = gameController.gameState as TState & { isDraw?: boolean };
                  return extendedState.isDraw ? '引き分け！' : 'ゲーム終了';
                } else if ((gameController.gameState.status === 'playing' || gameController.gameState.status === 'waiting') && gameController.gameState.currentPlayer) {
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
              onShowRules={() => setIsRulesModalOpen(true)}
            />
          </BottomSheet>

          {/* デバッガー（開発環境でのみ表示） */}
          <GameDebugger
            isVisible={process.env.NODE_ENV === 'development'}
            position="bottom-left"
          />
        </div>
        {isRulesModalOpen && <RulesModal />}
      </>
    );
  } else {
    console.log('Using desktop layout');
    // PCレイアウト: サイドバーレイアウト
    return (
      <>
        <div style={gameLayoutStyles.desktopContainer}>
          {/* サイドバー（コントロールパネル） */}
          <aside style={gameLayoutStyles.sidebar}>
            <div style={gameLayoutStyles.sidebarHeader}>
              <h1 style={gameLayoutStyles.sidebarTitle}>{gameName}</h1>
            </div>
            <ControlPanel
              gameController={gameController}
              onShowRules={() => setIsRulesModalOpen(true)}
            />
          </aside>

          {/* メインコンテンツ（ゲームボード） */}
          <main style={gameLayoutStyles.desktopMain}>
            {children}
          </main>

          {/* デバッガー（開発環境でのみ表示） */}
          <GameDebugger
            isVisible={process.env.NODE_ENV === 'development'}
            position="bottom-right"
          />
        </div>
        {isRulesModalOpen && <RulesModal />}
      </>
    );
  }
}
