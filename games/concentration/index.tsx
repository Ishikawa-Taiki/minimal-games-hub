"use client";

import React, { CSSProperties, useState, useEffect } from 'react';
import { BoardCard, Suit, Difficulty } from './core';
import { styles } from './styles';
import { useConcentration } from './useConcentration';
import { useResponsive } from '../../hooks/useResponsive';

interface ConcentrationProps {
  controller?: ReturnType<typeof useConcentration>;
  slug?: string;
}

const Concentration = ({ controller, slug = 'concentration' }: ConcentrationProps) => {
  const gameController = controller || useConcentration('easy');
  const {
    gameState,
    handleCardClick,
    setDifficulty,
    getDifficulty,
    getBoard,
    getHintedIndices,
    getShowHints,
    isGameStarted,
    resetGame,
  } = gameController;

  const { screenWidth } = useResponsive();
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onCardClick = (index: number) => {
    handleCardClick(index);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDifficulty = e.target.value as Difficulty;
    setDifficulty(newDifficulty);
  };

  const difficulty = getDifficulty();
  const board = getBoard();
  const hintedIndices = getHintedIndices();
  const showHints = getShowHints();

  const getSuitSymbol = (suit: Suit | 'Joker'): string => {
    if (suit === 'S') return '♠';
    if (suit === 'H') return '♥';
    if (suit === 'D') return '♦';
    if (suit === 'C') return '♣';
    return 'J';
  };

  const CardComponent = ({ card, index }: { card: BoardCard; index: number }) => (
    <button
      style={getCardStyle(card, index)}
      onClick={() => onCardClick(index)}
      disabled={card.isMatched || card.isFlipped}
      data-testid={`card-${index}`}
    >
      {card.isFlipped && (
        <div style={styles.cardContent}>
          <span style={{ ...styles.cardSuit, color: (card.suit === 'H' || card.suit === 'D') ? 'red' : 'black' }}>
            {getSuitSymbol(card.suit)}
          </span>
          <span style={{ ...styles.cardText, color: (card.suit === 'H' || card.suit === 'D') ? 'red' : 'black' }}>
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

      if (gameState.flippedIndices.length === 1 && isFlippedInTurn) {
        Object.assign(style, styles.cardSelected);
      }
    } else if (showHints && hintedIndices.includes(index)) {
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

  const getBoardDimensions = () => {
    const columns = { easy: 5, normal: 8, hard: 9 };
    const rows = { easy: 4, normal: 5, hard: 6 };
    const numCols = columns[difficulty];
    const numRows = rows[difficulty];

    const cardAspectRatio = 2 / 3;
    const gap = 5;

    // Calculate board aspect ratio
    const boardAspectRatio = (numCols * cardAspectRatio) / numRows;

    // Calculate container dimensions (maintaining aspect ratio)
    const containerWidth = screenWidth - 40; // padding
    const containerHeight = windowHeight - 250; // Approximate height of other UI elements

    let boardWidth, boardHeight;

    if (containerWidth / containerHeight > boardAspectRatio) {
      boardHeight = containerHeight;
      boardWidth = boardHeight * boardAspectRatio;
    } else {
      boardWidth = containerWidth;
      boardHeight = containerWidth / boardAspectRatio;
    }

    // Ensure board is not larger than container
    boardWidth = Math.min(boardWidth, containerWidth);
    boardHeight = Math.min(boardHeight, containerHeight);


    return {
      gridTemplateColumns: `repeat(${numCols}, 1fr)`,
      width: `${boardWidth}px`,
      height: `${boardHeight}px`,
      gap: `${gap}px`,
    };
  };

  const boardStyle = {
    ...styles.board,
    ...getBoardDimensions(),
  };

  return (
    <div style={styles.gameContent}>
      {!isGameStarted() && (
        <div style={styles.difficultySelector} data-testid="difficulty-selector">
          <h2 style={styles.difficultyTitle}>難易度選択</h2>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input type="radio" name="difficulty" value="easy" checked={difficulty === 'easy'} onChange={handleDifficultyChange} disabled={isGameStarted()} />
              かんたん
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="difficulty" value="normal" checked={difficulty === 'normal'} onChange={handleDifficultyChange} disabled={isGameStarted()} />
              ふつう
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="difficulty" value="hard" checked={difficulty === 'hard'} onChange={handleDifficultyChange} disabled={isGameStarted()} />
              むずかしい
            </label>
          </div>
        </div>
      )}
      <div style={styles.boardContainer}>
        <div style={boardStyle}>
          {board.map((card, index) => (
            <CardComponent key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
      <GameOverModal winner={gameState.winner} onReset={() => resetGame()} />
    </div>
  );
};

const GameOverModal = ({ winner, onReset }: { winner: string | 'DRAW' | null, onReset: () => void }) => {
  if (!winner) return null;

  const getWinnerText = () => {
    if (winner === 'DRAW') return "引き分け！";
    if (winner === 'player1') return "プレイヤー1の勝ち！";
    if (winner === 'player2') return "プレイヤー2の勝ち！";
    return `${winner}の勝ち！`;
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
export { useConcentration };
