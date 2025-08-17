'use client';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

interface GameLoaderProps {
  slug: string;
}

const getGameComponent = (slug: string) => {
  if (slug === 'tictactoe') {
    return dynamic(() => import('../../../games/tictactoe/index'), { ssr: false });
  }
  if (slug === 'reversi') {
    return dynamic(() => import('../../../games/reversi/index'), { ssr: false });
  }
  if (slug === 'hasami-shogi') {
    return dynamic(() => import('../../../games/hasami-shogi/index'), { ssr: false });
  }
  if (slug === 'concentration') {
    return dynamic(() => import('../../../games/concentration/index'), { ssr: false });
  }
  // Add other games here
  return null;
};

export default function GameLoader({ slug }: GameLoaderProps) {
  const GameComponent = getGameComponent(slug);

  if (!GameComponent) {
    notFound();
  }

  return <GameComponent />;
}
