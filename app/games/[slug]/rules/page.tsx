import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { GameManifest } from '@/types/game';
import MarkdownViewer from '@/app/components/MarkdownViewer';

interface RulesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const gamesDirectory = path.join(process.cwd(), 'public', 'games');
  const gameFolders = fs.readdirSync(gamesDirectory);

  return gameFolders.map((slug) => ({
    slug,
  }));
}

async function getDocContents(slug: string) {
  const manifestPath = path.join(process.cwd(), 'public', 'games', slug, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as GameManifest;

  const rulesPath = path.join(process.cwd(), manifest.rulesFile);
  const specActionPath = path.join(process.cwd(), manifest.specActionFile
  );
  const specDisplayPath = path.join(process.cwd(), manifest.
    specDisplayFile);

  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  const specActionContent = fs.readFileSync(specActionPath, 'utf-8');
  const specDisplayContent = fs.readFileSync(specDisplayPath, 'utf-8');

  const combinedContent = `
${rulesContent}

---

${specActionContent}

---

${specDisplayContent}
`;

  return { gameName: manifest.displayName, combinedContent };
}

export default async function RulesPage({ params }: RulesPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { gameName, combinedContent } = await getDocContents(slug);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{gameName} ドキュメント</h1>
      <MarkdownViewer content={combinedContent} />
      <div className="mt-8">
        <Link href={`/games/${slug}`} className="text-blue-500 hover:underline">
          Back to Game
        </Link>
      </div>
    </div>
  );
}
