interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  // For now, we'll just provide a single static slug for testing purposes.
  // In a real application, you would fetch all possible game slugs here.
  return [
    { slug: 'sample-game' },
  ];
}

export default async function GamePage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div>
      <h1>Game: {resolvedParams.slug}</h1>
      <p>This is a placeholder for the game content.</p>
    </div>
  );
}
