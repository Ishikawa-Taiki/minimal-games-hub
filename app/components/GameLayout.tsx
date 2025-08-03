'use client';

import React from 'react';
import Link from 'next/link';

interface GameLayoutProps {
  gameName: string;
  slug: string;
  rulesFile: string;
  specActionFile: string;
  specDisplayFile: string;
  children: React.ReactNode;
}

export default function GameLayout({ gameName, slug, rulesFile, specActionFile, specDisplayFile, children }: GameLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{gameName}</h1>
        <div className="flex gap-4">
          <Link
            href={rulesFile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Rules
          </Link>
          <Link
            href={specActionFile}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Action Spec
          </Link>
          <Link
            href={specDisplayFile}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Display Spec
          </Link>
          <Link
            href="/"
            className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
