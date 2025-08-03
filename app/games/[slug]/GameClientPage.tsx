'use client';

import { memo } from 'react';
import { GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';

interface GameClientPageProps {
  manifest: GameManifest;
  slug: string;
  rulesFile: string;
  specActionFile: string;
  specDisplayFile: string;
}

const GameClientPage = memo(function GameClientPage({ manifest, slug, rulesFile, specActionFile, specDisplayFile }: GameClientPageProps) {
  return (
    <GameLayout 
      gameName={manifest.name} 
      slug={slug}
      rulesFile={rulesFile}
      specActionFile={specActionFile}
      specDisplayFile={specDisplayFile}
    >
      <GameLoader slug={slug} />
    </GameLayout>
  );
});

export default GameClientPage;
