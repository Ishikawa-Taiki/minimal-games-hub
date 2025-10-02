'use client';

import { memo } from 'react';
import { GameManifest } from '@/core/types/game';
import GameLayout from '@/app/components/GameLayout';
import TicTacToe, { useTicTacToe } from '@/games/tictactoe/index';
import Reversi, { useReversi } from '@/games/reversi';
import Concentration from '@/games/concentration/index';
import { useConcentration } from '@/games/concentration/useConcentration';
import StickTaking, { useStickTaking } from '@/games/stick-taking';
import AnimalChess, { useAnimalChess } from '@/games/animal-chess';
import HasamiShogi, { useHasamiShogi } from '@/games/hasami-shogi';
import DotsAndBoxes, { useDotsAndBoxes } from '@/games/dots-and-boxes';

interface GameClientPageProps {
  manifest: GameManifest;
  slug: string;
  rulesContent: string;
  manualContent: string;
  hintSpecContent: string;
}

// 三目並べ用の新しいレイアウト対応コンポーネント
const TicTacToeWithNewLayout = memo(function TicTacToeWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useTicTacToe();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <TicTacToe controller={controller} />
    </GameLayout>
  );
});

// リバーシ用の新しいレイアウト対応コンポーネント
const ReversiWithNewLayout = memo(function ReversiWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useReversi();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <Reversi controller={controller} />
    </GameLayout>
  );
});

// 神経衰弱用の新しいレイアウト対応コンポーネント
const ConcentrationWithNewLayout = memo(function ConcentrationWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useConcentration();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <Concentration controller={controller} />
    </GameLayout>
  );
});

// 棒消しゲーム用の新しいレイアウト対応コンポーネント
const StickTakingWithNewLayout = ({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) => {
  const controller = useStickTaking();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <StickTaking controller={controller} />
    </GameLayout>
  );
};

// アニマルチェス用の新しいレイアウト対応コンポーネント
const AnimalChessWithNewLayout = memo(function AnimalChessWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useAnimalChess();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <AnimalChess controller={controller} />
    </GameLayout>
  );
});

// はさみ将棋用の新しいレイアウト対応コンポーネント
const HasamiShogiWithNewLayout = memo(function HasamiShogiWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useHasamiShogi();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <HasamiShogi controller={controller} />
    </GameLayout>
  );
});

// ドット＆ボックス用の新しいレイアウト対応コンポーネント
const DotsAndBoxesWithNewLayout = memo(function DotsAndBoxesWithNewLayout({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const controller = useDotsAndBoxes();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
      rulesContent={rulesContent}
      manualContent={manualContent}
      hintSpecContent={hintSpecContent}
    >
      <DotsAndBoxes controller={controller} />
    </GameLayout>
  );
});

const GameClientPage = memo(function GameClientPage({ manifest, slug, rulesContent, manualContent, hintSpecContent }: GameClientPageProps) {
  const props = { manifest, slug, rulesContent, manualContent, hintSpecContent };
  // 棒消しゲームの場合は新しいレイアウトを使用
  if (slug === 'stick-taking') {
    return <StickTakingWithNewLayout {...props} />;
  }

  // 三目並べの場合は新しいレイアウトを使用
  if (slug === 'tictactoe') {
    return <TicTacToeWithNewLayout {...props} />;
  }
  
  // リバーシの場合は新しいレイアウトを使用
  if (slug === 'reversi') {
    return <ReversiWithNewLayout {...props} />;
  }
  
  // 神経衰弱の場合は新しいレイアウトを使用
  if (slug === 'concentration') {
    return <ConcentrationWithNewLayout {...props} />;
  }

  if (slug === 'animal-chess') {
    return <AnimalChessWithNewLayout {...props} />;
  }

  if (slug === 'hasami-shogi') {
    return <HasamiShogiWithNewLayout {...props} />;
  }

  if (slug === 'dots-and-boxes') {
    return <DotsAndBoxesWithNewLayout {...props} />;
  }
  
  // Fallback for any other case, though generateStaticParams should prevent this.
  return null;
});

export default GameClientPage;