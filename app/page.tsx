import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

interface GameManifest {
  name: string;
  displayName: string;
  shortDescription: string;
}

async function getGames() {
  const gamesDirectory = path.join(process.cwd(), 'public', 'games');
  const gameFolders = await fs.readdir(gamesDirectory);

  const games = await Promise.all(
    gameFolders.map(async (gameFolder) => {
      const manifestPath = path.join(gamesDirectory, gameFolder, 'manifest.json');
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as GameManifest;
        return {
          slug: gameFolder,
          ...manifest,
        };
      } catch (error) {
        console.error(`Error reading manifest for ${gameFolder}:`, error);
        return null;
      }
    })
  );

  return games.filter(game => game !== null);
}

export default async function HomePage() {
  const games = await getGames();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-16 lg:p-24">
      <div className="relative flex place-items-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Welcome to MEGH!
        </h1>
      </div>

      <section className="w-full max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-transform transform hover:scale-105 dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {game.displayName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {game.shortDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
