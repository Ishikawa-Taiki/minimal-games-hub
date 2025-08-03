"use client";

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick as handleCellClickCore,
  getValidMoves,
} from './core';

const Reversi: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [flippingCells, setFlippingCells] = useState<[number, number][]>([]);

  const initializeGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCellClick = async (r: number, c: number) => {
    const stonesToFlip = gameState.validMoves.get(`${r},${c}`);
    if (gameState.gameStatus === 'GAME_OVER' || !stonesToFlip) return;

    // Place the stone immediately without waiting for logic
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[r][c] = gameState.currentPlayer;
    setGameState(prevState => ({ ...prevState, board: newBoard }));

    // Animate flipping
    for (let i = 0; i < stonesToFlip.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFlippingCells(prev => [...prev, stonesToFlip[i]]);
        await new Promise(resolve => setTimeout(resolve, 150)); // Duration of flip animation
        
        const [fr, fc] = stonesToFlip[i];
        newBoard[fr][fc] = gameState.currentPlayer;
        setGameState(prevState => ({ ...prevState, board: newBoard.map(row => [...row])}));
        setFlippingCells(prev => prev.filter(cell => cell[0] !== fr || cell[1] !== fc));
    }

    const newState = handleCellClickCore(gameState, r, c);
    if (newState) {
      setGameState(newState);
    }
  };

  const getWinner = (): Player | 'DRAW' | null => {
    if (gameState.gameStatus !== 'GAME_OVER') return null;
    if (gameState.scores.BLACK > gameState.scores.WHITE) return 'BLACK';
    if (gameState.scores.WHITE > gameState.scores.BLACK) return 'WHITE';
    return 'DRAW';
  };

  const winner = getWinner();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>リバーシ</h1>
      <div style={styles.scoreBoard}>
        <div style={{ ...styles.score, ...(gameState.currentPlayer === 'BLACK' ? styles.currentPlayerHighlightBlack : {}) }}>
          黒: {gameState.scores.BLACK}
        </div>
        <div style={{ ...styles.score, ...(gameState.currentPlayer === 'WHITE' ? styles.currentPlayerHighlightWhite : {}) }}>
          白: {gameState.scores.WHITE}
        </div>
      </div>
      <div style={styles.board}>
        {gameState.board.map((row, r) =>
          row.map((cell, c) => {
            const isFlipping = flippingCells.some(([fr, fc]) => fr === r && fc === c);
            const moveInfo = gameState.validMoves.get(`${r},${c}`);
            return (
              <div
                key={`${r}-${c}`}
                style={styles.cellContainer}
                onClick={() => handleCellClick(r, c)}
              >
                {cell && (
                   <div
                   style={{
                     ...styles.disc,
                     transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
                     backgroundColor: cell === 'BLACK' ? 'black' : 'white',
                   }}
                 />
                )}
                {moveInfo && (
                  <span style={styles.moveHint}>
                    {moveInfo.length}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      {gameState.gameStatus === 'SKIPPED' && <div style={styles.skippedMessage}>{gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK'}はパスしました。</div>}
      {winner && (
        <div style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <p style={styles.winnerText}>
              {winner === 'DRAW' ? '引き分け' : `${winner === 'BLACK' ? '黒' : '白'}の勝ち!`}
            </p>
            <button onClick={initializeGame} style={styles.resetButton}>
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
    backgroundColor: '#f7fafc',
    minHeight: '100vh'
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '28rem',
    marginBottom: '1rem'
  },
  score: {
    padding: '0.5rem',
    borderRadius: '0.25rem'
  },
  currentPlayerHighlightBlack: {
    backgroundColor: '#4299e1',
    color: 'white'
  },
  currentPlayerHighlightWhite: {
    backgroundColor: '#f56565',
    color: 'white'
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.25rem',
    backgroundColor: '#2f855a',
    padding: '0.5rem',
    borderRadius: '0.375rem'
  },
  cellContainer: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#48bb78',
    borderRadius: '0.125rem',
    cursor: 'pointer',
    position: 'relative',
    perspective: '1000px'
  },
  disc: {
    width: '83.3333%',
    height: '83.3333%',
    borderRadius: '9999px',
    transition: 'transform 0.3s',
    transformStyle: 'preserve-3d'
  },
  moveHint: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  skippedMessage: {
    marginTop: '1rem',
    fontSize: '1.125rem',
    fontWeight: '600'
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center'
  },
  gameOverTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  winnerText: {
    fontSize: '1.25rem'
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#4299e1',
    color: 'white',
    borderRadius: '0.25rem'
  }
};

export default Reversi;