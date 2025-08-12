"use client";

import React, { useState, useCallback, CSSProperties } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick as handleCellClickCore,
} from './core';

// Piece component with player-specific styling
const Piece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    transform: player === 'PLAYER2' ? 'rotate(180deg)' : 'none',
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000', // Red for Player 2
  };
  return <div style={pieceStyle}>歩</div>;
};

const HasamiShogi: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hintLevel, setHintLevel] = useState<'on' | 'off'>('off');
  const [hoveredMove, setHoveredMove] = useState<string | null>(null);

  const initializeGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const onCellClick = (r: number, c: number) => {
    const newState = handleCellClickCore(gameState, r, c);
    setGameState(newState);
  };

  const toggleHintLevel = () => {
    setHintLevel(prev => prev === 'on' ? 'off' : 'on');
  };

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell };
    const { board, selectedPiece, validMoves } = gameState;
    const moveKey = `${r},${c}`;

    // Style for selected piece
    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      style.backgroundColor = '#f6e05e'; // Yellow
    }

    // Hint-related styling
    if (hintLevel === 'on' && selectedPiece) {
      const moveData = validMoves.get(moveKey);
      if (moveData) {
        // Style for valid move destinations
        style.backgroundColor = moveData.isUnsafe ? '#feb2b2' : '#9ae6b4'; // Red for unsafe, Green for safe
      }
    }

    // Style for pieces that will be captured by a hovered move
    if (hoveredMove) {
      const moveData = validMoves.get(hoveredMove);
      if (moveData?.captures.some(([capR, capC]) => capR === r && capC === c)) {
        style.backgroundColor = '#a4cafe'; // Light blue
      }
    }

    return style;
  };

  const winner = gameState.winner;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>はさみ将棋</h1>
      <div style={styles.infoPanel}>
        <div style={styles.score}>
          <Piece player="PLAYER1" />
          <span>: {gameState.capturedPieces.PLAYER2}</span>
        </div>
        <div style={styles.turnIndicator}>
          {winner ? 'ゲーム終了' : `ターン: ${gameState.currentPlayer === 'PLAYER1' ? 'あなた' : '相手'}`}
        </div>
        <div style={styles.score}>
          <Piece player="PLAYER2" />
          <span>: {gameState.capturedPieces.PLAYER1}</span>
        </div>
      </div>

      <div style={styles.board}>
        {gameState.board.map((row, r) =>
          row.map((cell, c) => {
            const moveKey = `${r},${c}`;
            return (
              <div
                key={moveKey}
                data-testid={`cell-${r}-${c}`}
                style={getCellStyle(r, c)}
                onClick={() => onCellClick(r, c)}
                onMouseEnter={() => setHoveredMove(moveKey)}
                onMouseLeave={() => setHoveredMove(null)}
              >
                {cell && <Piece player={cell} />}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button data-testid="reset-button" onClick={initializeGame} style={styles.resetButton}>
          はじめから
        </button>
        <button
          data-testid="hint-button"
          onClick={toggleHintLevel}
          style={{...styles.resetButton, backgroundColor: hintLevel === 'on' ? '#4a5568' : '#a0aec0'}}
        >
          ヒント: {hintLevel === 'on' ? 'ON' : 'OFF'}
        </button>
      </div>

      {winner && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <div data-testid="winner-message" style={styles.winnerText}>
              <Piece player={winner} />
              <span>の勝ち!</span>
            </div>
            <button data-testid="play-again-button" onClick={initializeGame} style={styles.resetButton}>
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  infoPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '360px',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  score: {
    display: 'flex',
    alignItems: 'center',
  },
  turnIndicator: {
    fontWeight: 'bold',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 40px)',
    gridTemplateRows: 'repeat(9, 40px)',
    gap: '2px',
    backgroundColor: '#d2b48c',
    padding: '10px',
    border: '2px solid #8b4513',
  },
  cell: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f5deb3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  piece: {
    fontSize: '24px',
    fontWeight: 'bold',
    userSelect: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  resetButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1.1rem',
    backgroundColor: '#8b4513',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem 3rem',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  gameOverTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  winnerText: {
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
};

export default HasamiShogi;
