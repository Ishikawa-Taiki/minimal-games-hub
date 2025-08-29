import Link from 'next/link';
import StyleSheet from './styles/StyleSheet';
import React from 'react';

const bodyStyle: React.CSSProperties = {
  font: '14px "Century Gothic", Futura, sans-serif',
  margin: '20px',
};

const footerStyle = StyleSheet.create({
  footer: {
    backgroundColor: '#1f2937', // bg-gray-800
    color: '#ffffff', // text-white
    padding: '1rem', // p-4
    marginTop: '2rem', // mt-8
  },
  container: {
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
  },
  nav: {
    marginTop: '0.5rem',
  },
  ul: {
    display: 'flex',
    listStyle: 'none',
    padding: 0,
    gap: '1rem',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
  linkHover: {
    textDecoration: 'underline',
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Minimal Games Hub</title>
        <meta name="description" content="A simple hub for minimal browser games." />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.1.0/github-markdown.css" />
        <style>{`
          ol, ul {
            padding-left: 30px;
          }
          .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
        `}</style>
      </head>
      <body style={bodyStyle}>
        {children}
        <footer style={footerStyle.footer}>
          <div style={footerStyle.container}>
            <p>&copy; 2025 Minimal Games Hub</p>
            <nav style={footerStyle.nav}>
              <ul style={footerStyle.ul}>
                <li>
                  <Link href="/license">
                    <p style={footerStyle.link}>Licenses</p>
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/Ishikawa-Taiki/minimal-games-hub" target="_blank" rel="noopener noreferrer" style={footerStyle.link}>GitHub Repository</a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}