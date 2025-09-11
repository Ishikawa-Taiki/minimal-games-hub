import path from 'path';
import { GameManifest } from '@/core/types/game';
import GameClientPage from './GameClientPage';
import fs from 'fs'; // generateStaticParams で必要なので残す
import { Metadata } from 'next'; // 追加

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const gamesDirectory = path.join(process.cwd(), 'public', 'games');
  const gameFolders = fs.readdirSync(gamesDirectory);

  return gameFolders.map((slug) => ({
    slug,
  }));
}

async function getGameData(slug: string) {
  const manifestPath = path.join(process.cwd(), 'public', 'games', slug, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as GameManifest;

  const rulesPath = manifest.rulesFile ? path.join(process.cwd(), manifest.rulesFile.substring(1)) : '';
  const rulesContent = rulesPath && fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf-8') : 'ルールが見つかりませんでした。';

  return { manifest, rulesContent };
}

// generateMetadata 関数を追加
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
  const { manifest, rulesContent } = await getGameData(slug);

  return <GameClientPage manifest={manifest} slug={slug} rulesContent={rulesContent} />;
}