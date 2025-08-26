'use client';

import { memo } from 'react';
import { GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';
import TicTacToe, { useTicTacToeController } from '@/games/tictactoe/index';

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

const GameClientPage = memo(function GameClientPage({ manifest, slug }: GameClientPageProps) {
  // 三目並べの場合は新しいレイアウトを使用
  if (slug === 'tictactoe') {
    return <TicTacToeWithNewLayout manifest={manifest} slug={slug} />;
  }
  
  // 他のゲームは従来のレイアウトを使用
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
    >
      <GameLoader slug={slug} />
    </GameLayout>
  );
});

export default GameClientPage;
