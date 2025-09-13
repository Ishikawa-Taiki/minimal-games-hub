import React from 'react';
import { Suit } from './core';

interface CardFaceContentProps {
  suit: Suit | 'Joker';
  rank: string;
}

const getSuitSymbol = (suit: Suit | 'Joker'): string => {
  if (suit === 'S') return '♠';
  if (suit === 'H') return '♥';
  if (suit === 'D') return '♦';
  if (suit === 'C') return '♣';
  return 'J';
};

export const CardFaceContent = ({ suit, rank }: CardFaceContentProps) => {
  const suitSymbol = getSuitSymbol(suit);
  const color = (suit === 'H' || suit === 'D') ? 'red' : 'black';

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 40 60"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
      data-testid="card-face-svg"
    >
      <style>
        {`
          .rank { font-family: sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; }
          .suit { font-family: sans-serif; font-size: 24px; text-anchor: middle; }
        `}
      </style>
      <text x="20" y="28" className="suit" fill={color}>
        {suitSymbol}
      </text>
      <text x="20" y="52" className="rank" fill={color}>
        {rank}
      </text>
    </svg>
  );
};
