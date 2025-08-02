import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto flex justify-between items-center">
            <p>&copy; 2023 Minimal Games Hub</p>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/license">
                    <p className="hover:underline">Licenses</p>
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/your-repo-link" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub Repository</a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}