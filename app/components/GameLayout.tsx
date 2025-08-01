'use client';

import React from 'react';

interface GameLayoutProps {
  gameName: string;
  onShowRules: () => void;
  children: React.ReactNode;
}

export default function GameLayout({ gameName, onShowRules, children }: GameLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{gameName}</h1>
        <div className="flex gap-4">
          <button
            onClick={onShowRules}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Rules
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
