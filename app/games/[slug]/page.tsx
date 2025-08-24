import path from 'path';
import { GameManifest } from '@/types/game';
import GameClientPage from './GameClientPage';
import fs from 'fs'; // generateStaticParams で必要なので残す
import { Metadata } from 'next'; // 追加

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const gamesDirectory = path.join(process.cwd(), 'public', 'games');
  const gameFolders = fs.readdirSync(gamesDirectory);

  return gameFolders.map((slug) => ({
    slug,
  }));
}

async function getGameData(slug: string) {
  // fetch API を使用して manifest.json を読み込む
  // Playwright の webServer で起動される URL を考慮
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''; // 環境に応じて変更
  const manifestUrl = `${baseUrl}/games/${slug}/manifest.json`;
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest for ${slug}: ${response.statusText}`);
  }
  const manifest = await response.json() as GameManifest;

  return { manifest };
}

// generateMetadata 関数を追加
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { manifest } = await getGameData(slug);
  return {
    title: manifest.displayName,
  };
}

export default async function GamePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { manifest } = await getGameData(slug);

  return <GameClientPage manifest={manifest} slug={slug} />;
}