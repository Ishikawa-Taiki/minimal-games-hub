"use client";

import React, { useState, CSSProperties } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick,
} from './core';

const TicTacToe = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false);

  const handleClick = (row: number, col: number) => {
    const newState = handleCellClick(gameState, row, col);
    if (newState) {
      setGameState(newState);
    }
  };

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const getStatus = () => {
    if (gameState.winner) {
      return `勝者: ${gameState.winner}`;
    } else if (gameState.isDraw) {
      return "引き分け！";
    } else {
      return `現在のプレイヤー: ${gameState.currentPlayer}`;
    }
  };

  const isBothPlayersReaching = (index: number): boolean => {
    const xReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'X');
    const oReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'O');
    return xReaching && oReaching;
  };

  const getCellBackgroundColor = (index: number): string => {
    if (gameState.winningLines && gameState.winningLines.some(line => line.includes(index))) {
      return styles.winningCell.backgroundColor as string;
    }
    if (showHints) {
      if (isBothPlayersReaching(index)) {
        return styles.bothReachingCell.backgroundColor as string;
      } else if (gameState.reachingLines.some(rl => rl.index === index)) {
        return styles.reachingCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  const getReachingPlayerMark = (index: number): Player => {
    const reaching = gameState.reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>○×ゲーム</h1>
      <div style={styles.board}>
        {gameState.board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const reachingPlayerMark = getReachingPlayerMark(index);

          return (
            <button
              key={`${row}-${col}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(index),
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!gameState.winner || gameState.isDraw}
            >
              {cell ? cell : (
                showHints && reachingPlayerMark && !isBothPlayersReaching(index) && (
                  <span style={styles.faintMark}>
                    {reachingPlayerMark}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      <p style={styles.status}>{getStatus()}</p>
      <div>
        <button
          style={styles.resetButton}
          onClick={handleReset}
        >
          ゲームをリセット
        </button>
        <button
          style={styles.toggleButton}
          onClick={() => setShowHints(!showHints)}
        >
          ヒント: {showHints ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    backgroundColor: '#d1d5db',
    padding: '4px',
    borderRadius: '8px',
  },
  cell: {
    width: '80px',
    height: '80px',
    border: '1px solid #9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    position: 'relative',
    color: '#000000',
  },
  winningCell: {
    backgroundColor: '#dcfce7', // light green
  },
  bothReachingCell: {
    backgroundColor: '#fecaca', // light red
  },
  reachingCell: {
    backgroundColor: '#fef9c3', // light yellow
  },
  faintMark: {
    position: 'absolute',
    color: 'rgba(0, 0, 0, 0.1)',
  },
  status: {
    marginTop: '1rem',
    fontSize: '1.25rem',
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
  toggleButton: {
    marginTop: '1rem',
    marginLeft: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
};

export default TicTacToe;