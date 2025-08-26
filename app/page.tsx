import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { homePageStyles } from './home.styles';

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
    <main style={homePageStyles.main}>
      <div style={homePageStyles.header}>
        <h1 style={homePageStyles.title}>
          Welcome to MEGH!
        </h1>
      </div>

      <section style={homePageStyles.gamesSection}>
        <h2 style={homePageStyles.gamesTitle}>Games</h2>
        <div style={homePageStyles.gamesGrid}>
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              style={homePageStyles.gameLink}
            >
              <h3 style={homePageStyles.gameTitle}>
                {game.displayName}
              </h3>
              <p style={homePageStyles.gameDescription}>
                {game.shortDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
