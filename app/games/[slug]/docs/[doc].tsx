import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GameManifest } from '@/types/game';
import MarkdownViewer from '@/app/components/MarkdownViewer';

interface DocPageProps {
  params: Promise<{ slug: string; doc: string }>;
}

export async function generateStaticParams() {
  const gamesDirectory = path.join(process.cwd(), 'games');
  const gameFolders = fs.readdirSync(gamesDirectory);
  const params: { slug: string; doc: string }[] = [];

  for (const slug of gameFolders) {
    params.push({ slug, doc: 'rules' });
    params.push({ slug, doc: 'spec-action' });
    params.push({ slug, doc: 'spec-display' });
  }

  return params;
}

async function getDocContent(slug: string, doc: string) {
  const manifestPath = path.join(process.cwd(), 'games', slug, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as GameManifest;

  let filePath: string;
  let title: string;

  switch (doc) {
    case 'rules':
      filePath = manifest.rulesFile;
      title = `${manifest.name} Rules`;
      break;
    case 'spec-action':
      filePath = manifest.specActionFile;
      title = `${manifest.name} Action Specification`;
      break;
    case 'spec-display':
      filePath = manifest.specDisplayFile;
      title = `${manifest.name} Display Specification`;
      break;
    default:
      notFound();
  }

  const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
  const content = fs.readFileSync(fullPath, 'utf-8');

  return { gameName: manifest.name, title, content };
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const { slug, doc } = resolvedParams;
  const { title, content } = await getDocContent(slug, doc);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <MarkdownViewer content={content} />
      <div className="mt-8">
        <Link href={`/games/${slug}`} className="text-blue-500 hover:underline">
          Back to Game
        </Link>
      </div>
    </div>
  );
}