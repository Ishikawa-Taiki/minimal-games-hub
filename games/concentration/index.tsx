"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import {
  GameState,
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  BoardCard,
  Suit,
} from './core';

const Concentration = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (gameState.status === 'evaluating') {
      const timeoutId = setTimeout(() => {
        setGameState(clearNonMatchingFlippedCards(gameState));
      }, 1200); // 1.2秒待ってからカードを裏返す
      return () => clearTimeout(timeoutId);
    }
  }, [gameState]);

  const onCardClick = (index: number) => {
    // 評価中はクリックを無視
    if (gameState.status === 'evaluating') return;
    setGameState(handleCardClick(gameState, index));
  };

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const getStatusMessage = (): string => {
    switch (gameState.status) {
      case 'player1_turn':
        return "プレイヤー1の番";
      case 'player2_turn':
        return "プレイヤー2の番";
      case 'evaluating':
        return "...";
      case 'game_over':
        if (gameState.winner === 'draw') return "引き分け！";
        return `プレイヤー${gameState.winner}の勝ち！`;
      default:
        return "";
    }
  };

  const getSuitSymbol = (suit: Suit | 'Joker'): string => {
    if (suit === 'S') return '♠';
    if (suit === 'H') return '♥';
    if (suit === 'D') return '♦';
    if (suit === 'C') return '♣';
    return 'J';
  }

  const CardComponent = ({ card, index }: { card: BoardCard; index: number }) => (
    <button
      style={getCardStyle(card, index)}
      onClick={() => onCardClick(index)}
      disabled={card.isMatched || card.isFlipped}
      data-testid={`card-${index}`}
    >
      {card.isFlipped && (
        <div style={styles.cardContent}>
           <span style={{...styles.cardText, ...styles.cardSuit, color: (card.suit === 'H' || card.suit === 'D') ? 'red' : 'black' }}>
            {getSuitSymbol(card.suit)}
          </span>
          <span style={{...styles.cardText, color: (card.suit === 'H' || card.suit === 'D') ? 'red' : 'black' }}>
            {card.rank}
          </span>
        </div>
      )}
    </button>
  );

  const getCardStyle = (card: BoardCard, index: number): CSSProperties => {
    const style = { ...styles.card };
    if (card.isFlipped) {
      style.backgroundColor = styles.cardFace.backgroundColor;
    } else if (showHints && gameState.revealedIndices.includes(index)) {
      style.backgroundColor = styles.cardHint.backgroundColor;
    }

    if (card.isMatched) {
      style.backgroundColor = styles.cardMatched.backgroundColor;
      style.opacity = styles.cardMatched.opacity;
      style.border = styles.cardMatched.border;
    }
    return style;
  };

  return (
    <div style={styles.container}>
      <div style={styles.statusBar}>
        <div style={styles.scoreBox} data-testid="score-player1">
          <p>プレイヤー1</p>
          <p>{gameState.scores.player1}</p>
        </div>
        <div style={styles.turnBox} data-testid="status-message">
          <p>{getStatusMessage()}</p>
        </div>
        <div style={styles.scoreBox} data-testid="score-player2">
           <p>プレイヤー2</p>
           <p>{gameState.scores.player2}</p>
        </div>
      </div>
      <div style={styles.board}>
        {gameState.board.map((card, index) => (
          <CardComponent key={card.id} card={card} index={index} />
        ))}
      </div>
      <div style={styles.buttonContainer}>
        <button style={styles.resetButton} onClick={handleReset} data-testid="reset-button">
          ゲームをリセット
        </button>
        <button
          style={styles.toggleButton}
          onClick={() => setShowHints(!showHints)}
          data-testid="hint-button"
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
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '10px',
    boxSizing: 'border-box',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 0',
    marginBottom: '10px',
  },
  scoreBox: {
    textAlign: 'center',
    padding: '5px 15px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    minWidth: '100px',
  },
  turnBox: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 1fr)',
    gap: '5px',
    width: '100%',
  },
  card: {
    width: '100%',
    aspectRatio: '2 / 3',
    backgroundColor: '#4a90e2',
    border: '2px solid #357abd',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.3s, background-color 0.3s',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    backgroundColor: '#ffffff',
  },
  cardMatched: {
    backgroundColor: '#d0d0d0',
    opacity: 0.5,
    border: '2px solid #a0a0a0',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontWeight: 'bold',
    fontSize: 'clamp(12px, 3vw, 24px)',
  },
  cardSuit: {
    fontSize: 'clamp(14px, 4vw, 32px)',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '20px',
  },
  cardHint: {
    backgroundColor: '#fef9c3', // light yellow
  },
};

export default Concentration;
