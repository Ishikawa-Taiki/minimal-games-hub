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

  const rulesPath = path.join(process.cwd(), manifest.rulesFile.replace(/^\//, ''));
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  const specActionPath = path.join(process.cwd(), manifest.specActionFile.replace(/^\//, ''));
  const specActionContent = fs.readFileSync(specActionPath, 'utf-8');

  const specDisplayPath = path.join(process.cwd(), manifest.specDisplayFile.replace(/^\//, ''));
  const specDisplayContent = fs.readFileSync(specDisplayPath, 'utf-8');

  return { manifest, rulesContent, specActionContent, specDisplayContent };
}

export default async function GamePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { manifest } = await getGameData(slug);

  return <GameClientPage manifest={manifest} slug={slug} rulesFile={manifest.rulesFile} specActionFile={manifest.specActionFile} specDisplayFile={manifest.specDisplayFile} />;
}