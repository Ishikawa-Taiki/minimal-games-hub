'use client';

import { memo } from 'react';
import { BaseGameState, GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';
import TicTacToe, { useTicTacToeController } from '@/games/tictactoe/index';
import Reversi, { useReversi } from '@/games/reversi';
import Concentration, { useConcentration } from '@/games/concentration/index';
import StickTaking, { useStickTaking } from '@/games/stick-taking';
import AnimalChess, { useAnimalChess } from '@/games/animal-chess';
import HasamiShogi, { useHasamiShogi } from '@/games/hasami-shogi';

interface GameClientPageProps {
  manifest: GameManifest;
  slug: string;
}

// 三目並べ用の新しいレイアウト対応コンポーネント
const TicTacToeWithNewLayout = memo(function TicTacToeWithNewLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useTicTacToeController();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
    >
      <TicTacToe controller={controller} />
    </GameLayout>
  );
});

// リバーシ用の新しいレイアウト対応コンポーネント
const ReversiWithNewLayout = memo(function ReversiWithNewLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useReversi();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
    >
      <Reversi controller={controller} />
    </GameLayout>
  );
});

// 神経衰弱用の新しいレイアウト対応コンポーネント
const ConcentrationWithNewLayout = memo(function ConcentrationWithNewLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useConcentration();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
    >
      <Concentration controller={controller} slug={slug} />
    </GameLayout>
  );
});

// 棒取りゲーム用の新しいレイアウト対応コンポーネント
const StickTakingWithNewLayout = ({ manifest, slug }: GameClientPageProps) => {
  const controller = useStickTaking();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
    >
      <StickTaking controller={controller} />
    </GameLayout>
  );
};

// アニマルチェス用の新しいレイアウト対応コンポーネント
const AnimalChessWithNewLayout = memo(function AnimalChessWithNewLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useAnimalChess();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
    >
      <AnimalChess controller={controller} />
    </GameLayout>
  );
});

// はさみ将棋用の新しいレイアウト対応コンポーネント
const HasamiShogiWithNewLayout = memo(function HasamiShogiWithNewLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useHasamiShogi();

  return (
    <GameLayout
      gameName={manifest.displayName}
      slug={slug}
      gameController={controller}
    >
      <HasamiShogi controller={controller} />
    </GameLayout>
  );
});

const GameClientPage = memo(function GameClientPage({ manifest, slug }: GameClientPageProps) {
  // 棒取りゲームの場合は新しいレイアウトを使用
  if (slug === 'stick-taking') {
    return <StickTakingWithNewLayout manifest={manifest} slug={slug} />;
  }

  // 三目並べの場合は新しいレイアウトを使用
  if (slug === 'tictactoe') {
    return <TicTacToeWithNewLayout manifest={manifest} slug={slug} />;
  }
  
  // リバーシの場合は新しいレイアウトを使用
  if (slug === 'reversi') {
    return <ReversiWithNewLayout manifest={manifest} slug={slug} />;
  }
  
  // 神経衰弱の場合は新しいレイアウトを使用
  if (slug === 'concentration') {
    return <ConcentrationWithNewLayout manifest={manifest} slug={slug} />;
  }

  if (slug === 'animal-chess') {
    return <AnimalChessWithNewLayout manifest={manifest} slug={slug} />;
  }

  if (slug === 'hasami-shogi') {
    return <HasamiShogiWithNewLayout manifest={manifest} slug={slug} />;
  }
  
  // 他のゲームは従来のレイアウトを使用
  return (
    <GameLayout<BaseGameState, never> 
      gameName={manifest.displayName} 
      slug={slug}
    >
      <GameLoader slug={slug} />
    </GameLayout>
  );
});

export default GameClientPage;
