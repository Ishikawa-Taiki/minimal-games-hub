"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StyleSheet from '../styles/StyleSheet';

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGamePage = pathname.startsWith('/games/');

  return (
    <>
      {!isGamePage && (
        <header>
          <h1>
            <Link href="/">Minimal Games Hub</Link>
          </h1>
        </header>
      )}
      <main>{children}</main>
      {!isGamePage && (
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
      )}
    </>
  );
}
