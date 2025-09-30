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

async function getGameData(slug:string) {
  const manifestPath = path.join(process.cwd(), 'public', 'games', slug, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as GameManifest;

  const readFileContent = (filePath: string | undefined, defaultContent: string = '') => {
    if (!filePath) return defaultContent;
    // manifest.jsonのパスは `/src/...` のようにルートからのパスなので、先頭の / を取り除く
    const fullPath = path.join(process.cwd(), filePath.substring(1));
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : defaultContent;
  };

  const rulesContent = readFileContent(manifest.rulesFile, 'ルールが見つかりませんでした。');
  const actionContent = readFileContent(manifest.specActionFile);
  const displayContent = readFileContent(manifest.specDisplayFile);
  const hintSpecContent = readFileContent(manifest.specHintFile, 'ヒント機能の説明が見つかりませんでした。');

  const manualContent = [actionContent, displayContent]
    .filter(content => content && content.trim() !== '')
    .join('\n\n---\n\n');

  return { manifest, rulesContent, manualContent, hintSpecContent };
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
  const { manifest, rulesContent, manualContent, hintSpecContent } = await getGameData(slug);

  return <GameClientPage
    manifest={manifest}
    slug={slug}
    rulesContent={rulesContent}
    manualContent={manualContent}
    hintSpecContent={hintSpecContent}
  />;
}