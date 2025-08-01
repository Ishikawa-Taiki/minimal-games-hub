'use client';

import { memo } from 'react';
import { GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';

interface GameClientPageProps {
  manifest: GameManifest;
  rulesContent: string; // rulesContent を追加
  slug: string;
}

const GameClientPage = memo(function GameClientPage({ manifest, rulesContent, slug }: GameClientPageProps) {
  return (
    <GameLayout gameName={manifest.name} slug={slug}>
      <GameLoader slug={slug} />
    </GameLayout>
  );
});

export default GameClientPage;
