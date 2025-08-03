import fs from 'fs';
import path from 'path';
import { GameManifest } from '@/types/game';
import GameClientPage from './GameClientPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const gamesDirectory = path.join(process.cwd(), 'games');
  const gameFolders = fs.readdirSync(gamesDirectory);

  return gameFolders.map((slug) => ({
    slug,
  }));
}

async function getGameData(slug: string) {
  const manifestPath = path.join(process.cwd(), 'games', slug, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as GameManifest;

  return { manifest };
}

export default async function GamePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { manifest } = await getGameData(slug);

  return <GameClientPage manifest={manifest} slug={slug} />;
}