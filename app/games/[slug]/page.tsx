import GameLoader from './GameLoader';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  // In a real application, you would fetch all possible game slugs here.
  return [{ slug: 'sample-game' }, { slug: 'tictactoe' }];
}

export default function GamePage({ params }: PageProps) {
  const { slug } = params;

  return (
    <div>
      <h1>Game: {slug}</h1>
      <GameLoader slug={slug} />
    </div>
  );
}
