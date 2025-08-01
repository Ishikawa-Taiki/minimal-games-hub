'use client';

import { GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';

interface GameClientPageProps {
  manifest: GameManifest;
  rulesContent: string;
  slug: string;
}

export default function GameClientPage({ manifest, slug }: GameClientPageProps) {
  return (
    <GameLayout gameName={manifest.name}>
      <GameLoader slug={slug} />
    </GameLayout>
  );
}
