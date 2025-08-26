"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import {
  GameState,
  createInitialState,
  handleCardClick,
  clearNonMatchingFlippedCards,
  BoardCard,
  Suit,
  Player,
  Difficulty,
} from './core';
import { styles } from './styles';

const Concentration = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(createInitialState(difficulty));
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
    setGameState(createInitialState(difficulty));
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDifficulty = e.target.value as Difficulty;
    setDifficulty(newDifficulty);
    setGameState(createInitialState(newDifficulty));
  };

  const isGameStarted = gameState.flippedIndices.length > 0 || gameState.revealedIndices.length > 0 || gameState.scores.player1 > 0 || gameState.scores.player2 > 0;

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
    const isFlippedInTurn = gameState.flippedIndices.includes(index);

    if (card.isFlipped) {
      style.backgroundColor = styles.cardFace.backgroundColor;

      // 1枚目選択時の強調表示
      if (gameState.flippedIndices.length === 1 && isFlippedInTurn) {
        Object.assign(style, styles.cardSelected);
      }

    } else if (showHints && gameState.hintedIndices.includes(index)) {
      style.backgroundColor = styles.cardHintStrong.backgroundColor;
    } else if (showHints && gameState.revealedIndices.includes(index)) {
      style.backgroundColor = styles.cardHint.backgroundColor;
    }

    if (card.isMatched) {
      if (card.matchedBy === 1) {
        Object.assign(style, styles.cardMatchedPlayer1);
      } else if (card.matchedBy === 2) {
        Object.assign(style, styles.cardMatchedPlayer2);
      }
    }
    return style;
  };

  const getBoardStyle = (): CSSProperties => {
    const columns = {
      easy: 5,
      normal: 8,
      hard: 9,
    };
    return {
      ...styles.board,
      gridTemplateColumns: `repeat(${columns[difficulty]}, 1fr)`,
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.difficultySelector} data-testid="difficulty-selector">
        <h2 style={styles.difficultyTitle}>難易度選択</h2>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input type="radio" name="difficulty" value="easy" checked={difficulty === 'easy'} onChange={handleDifficultyChange} disabled={isGameStarted} />
            かんたん
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="difficulty" value="normal" checked={difficulty === 'normal'} onChange={handleDifficultyChange} disabled={isGameStarted} />
            ふつう
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="difficulty" value="hard" checked={difficulty === 'hard'} onChange={handleDifficultyChange} disabled={isGameStarted} />
            むずかしい
          </label>
        </div>
      </div>
      <div style={styles.statusBar}>
        <div style={{...styles.scoreBox, ...styles.scoreBoxPlayer1}} data-testid="score-player1">
          <p>プレイヤー1</p>
          <p style={styles.scoreText}>{gameState.scores.player1}</p>
        </div>
        <div style={styles.turnBox} data-testid="status-message">
          <p>{getStatusMessage()}</p>
        </div>
        <div style={{...styles.scoreBox, ...styles.scoreBoxPlayer2}} data-testid="score-player2">
           <p>プレイヤー2</p>
           <p style={styles.scoreText}>{gameState.scores.player2}</p>
        </div>
      </div>
      <div style={getBoardStyle()}>
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
      <GameOverModal winner={gameState.winner} onReset={handleReset} />
    </div>
  );
};

const GameOverModal = ({ winner, onReset }: { winner: Player | 'draw' | null, onReset: () => void }) => {
  if (!winner) return null;

  const getWinnerText = () => {
    if (winner === 'draw') return "引き分け！";
    return `プレイヤー${winner}の勝ち！`;
  };

  return (
    <div style={styles.gameOverOverlay} data-testid="game-over-modal">
      <div style={styles.gameOverModal}>
        <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
        <p style={styles.winnerText} data-testid="winner-message">{getWinnerText()}</p>
        <button onClick={onReset} style={styles.resetButton} data-testid="play-again-button">
          もう一度プレイ
        </button>
      </div>
    </div>
  );
};

export default Concentration;
