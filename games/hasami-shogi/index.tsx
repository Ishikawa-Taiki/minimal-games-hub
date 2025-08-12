"use client";

import React, { useState, useCallback, CSSProperties, useMemo } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick as handleCellClickCore,
} from './core';

// Piece component for the game board
const Piece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    transform: player === 'PLAYER2' ? 'rotate(180deg)' : 'none',
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
};

// Piece component for the UI indicators (no rotation)
const IndicatorPiece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
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

  const remainingPieces = useMemo(() => {
    let p1 = 0;
    let p2 = 0;
    gameState.board.forEach(row => row.forEach(cell => {
      if (cell === 'PLAYER1') p1++;
      else if (cell === 'PLAYER2') p2++;
    }));
    return { PLAYER1: p1, PLAYER2: p2 };
  }, [gameState.board]);

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell };
    const { board, selectedPiece, validMoves } = gameState;
    const moveKey = `${r},${c}`;

    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      style.backgroundColor = '#f6e05e'; // Yellow for selected
    }

    if (hintLevel === 'on' && selectedPiece) {
      const moveData = validMoves.get(moveKey);
      if (moveData) {
        style.backgroundColor = moveData.isUnsafe ? '#feb2b2' : '#9ae6b4'; // Red/Green
      }
    }

    if (hintLevel === 'on' && hoveredMove) {
      const moveData = validMoves.get(hoveredMove);
      if (moveData?.captures.some(([capR, capC]) => capR === r && capC === c)) {
        style.backgroundColor = '#a4cafe'; // Light blue for capture target
      }
    }

    return style;
  };

  const winner = gameState.winner;
  const turnText = gameState.currentPlayer === 'PLAYER1'
    ? '歩のばん'
    : <span style={{display: 'inline-flex', alignItems: 'center'}}>
        <span style={{color: '#e53e3e'}}>と</span>のばん
      </span>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>はさみ将棋</h1>
      <div style={styles.infoPanel}>
        <div style={styles.score}>
          <IndicatorPiece player="PLAYER1" />
          <span>: {remainingPieces.PLAYER1}</span>
        </div>
        <div style={styles.turnIndicator}>
          {winner ? 'ゲーム終了' : turnText}
        </div>
        <div style={styles.score}>
          <IndicatorPiece player="PLAYER2" />
          <span>: {remainingPieces.PLAYER2}</span>
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
                onMouseEnter={() => { if (gameState.validMoves.has(moveKey)) setHoveredMove(moveKey); }}
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
              {winner === 'PLAYER1'
                 ? <IndicatorPiece player="PLAYER1" />
                 : <IndicatorPiece player="PLAYER2" />
              }
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
    fontSize: '1.5rem',
  },
  turnIndicator: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
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
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
