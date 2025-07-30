import GameLoader from './GameLoader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // In a real application, you would fetch all possible game slugs here.
  return [{ slug: 'sample-game' }, { slug: 'tictactoe' }];
}

export default async function GamePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return (
    <div>
      <h1>Game: {slug}</h1>
      <GameLoader slug={slug} />
    </div>
  );
}