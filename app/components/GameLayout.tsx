'use client';

import React from 'react';
import Link from 'next/link';
import { gameLayoutStyles } from './styles';

interface GameLayoutProps {
  gameName: string;
  slug: string;
  children: React.ReactNode;
}

export default function GameLayout({ gameName, slug, children }: GameLayoutProps) {
  return (
    <div style={gameLayoutStyles.container}>
      <header style={gameLayoutStyles.header}>
        <h1 style={gameLayoutStyles.headerTitle}>{gameName}</h1>
        <div style={gameLayoutStyles.linksContainer}>
          <Link href={`/games/${slug}/rules`} style={{...gameLayoutStyles.link, ...gameLayoutStyles.rulesLink}}>
            Rules
          </Link>
          <Link href="/" style={{...gameLayoutStyles.link, ...gameLayoutStyles.homeLink}}>
            Back to Home
          </Link>
        </div>
      </header>
      <main style={gameLayoutStyles.main}>
        {children}
      </main>
    </div>
  );
}
