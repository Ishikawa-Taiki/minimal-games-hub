'use client';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

interface GameLoaderProps {
  slug: string;
}

// 三目並べ用のラッパーコンポーネント（新しいGameLayoutに対応済み）
const TicTacToeWithController = dynamic(() => import('../../../games/tictactoe/index'), { ssr: false });

// レガシーゲームコンポーネント（まだ新しいGameLayoutに対応していない）
const getGameComponent = (slug: string) => {
  if (slug === 'tictactoe') {
    return TicTacToeWithController;
  }
  if (slug === 'animal-chess') {
    return dynamic(() => import('../../../games/animal-chess/index'), { ssr: false });
  }
  if (slug === 'reversi') {
    return dynamic(() => import('../../../games/reversi'), { ssr: false });
  }
  if (slug === 'hasami-shogi') {
    return dynamic(() => import('../../../games/hasami-shogi/index'), { ssr: false });
  }
  if (slug === 'concentration') {
    return dynamic(() => import('../../../games/concentration/index'), { ssr: false });
  }
  if (slug === 'stick-taking') {
    return dynamic(() => import('../../../games/stick-taking/index'), { ssr: false });
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
