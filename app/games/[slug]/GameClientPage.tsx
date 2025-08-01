'use client';

import { useState } from 'react';
import { GameManifest } from '@/types/game';
import GameLoader from './GameLoader';
import GameLayout from '@/app/components/GameLayout';
import Modal from '@/app/components/Modal';

interface GameClientPageProps {
  manifest: GameManifest;
  rulesContent: string;
  slug: string;
}

export default function GameClientPage({ manifest, rulesContent, slug }: GameClientPageProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <>
      <GameLayout
        gameName={manifest.name}
        onShowRules={() => setIsRulesOpen(true)}
      >
        <GameLoader slug={slug} />
      </GameLayout>

      <Modal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        title="Game Rules"
      >
        <pre className="whitespace-pre-wrap font-mono text-sm">{rulesContent}</pre>
      </Modal>
    </>
  );
}
