import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <p>&copy; 2025 Minimal Games Hub</p>
            <nav className="mt-2 sm:mt-0">
              <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <li>
                  <Link href="/license">
                    <p className="hover:underline">Licenses</p>
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/Ishikawa-Taiki/minimal-games-hub" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub Repository</a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}