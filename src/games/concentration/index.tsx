"use client";

import React, { CSSProperties, useState, useEffect } from 'react';
import { BoardCard, Suit, Difficulty } from './core';
import { styles } from './styles';
import { useConcentration } from './useConcentration';
import { useResponsive } from '@/core/hooks/useResponsive';
import { PositiveButton } from '@/app/components/ui';
import { useDialog } from '@/app/components/ui/DialogProvider';

interface ConcentrationProps {
  controller?: ReturnType<typeof useConcentration>;
  slug?: string;
}

const PreGameScreen = ({ onSelect }: { onSelect: (difficulty: Difficulty) => void }) => (
  <div style={styles.preGameContainer} data-testid="pre-game-screen">
    <h2 style={styles.preGameTitle}>難易度を選んでください</h2>
    <div style={styles.preGameButtonContainer}>
      <PositiveButton onClick={() => onSelect('easy')} data-testid="difficulty-easy">
        かんたん
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('normal')} data-testid="difficulty-normal">
        ふつう
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('hard')} data-testid="difficulty-hard">
        むずかしい
      </PositiveButton>
    </div>
  </div>
);

const Concentration = ({ controller }: ConcentrationProps) => {
  const concentrationHook = useConcentration('easy');
  const gameController = controller || concentrationHook;
  const {
    gameState,
    handleCardClick,
    setDifficulty,
    getDifficulty,
    getBoard,
    getHintedIndices,
    resetGame,
    hintState,
  } = gameController;

  const { screenWidth } = useResponsive();
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);
  const { alert } = useDialog();

  useEffect(() => {
    if (gameState.winner) {
      if (gameState.winner === 'DRAW') {
        alert({
          title: 'ひきわけ',
          message: `プレイヤー1もプレイヤー2も ${gameState.scores.player1}ペアとったよ！`,
        }).then(() => {
          resetGame();
        });
      } else {
        const winnerText = gameState.winner === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
        alert({
          title: `${winnerText}のかち`,
          message: `プレイヤー1が${gameState.scores.player1}ペア、プレイヤー2が${gameState.scores.player2}ペアとったよ！`,
        }).then(() => {
          resetGame();
        });
      }
    }
  }, [gameState.winner, gameState.scores, alert, resetGame]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onCardClick = (index: number) => {
    handleCardClick(index);
  };

  const difficulty = getDifficulty();
  const board = getBoard();
  const hintedIndices = getHintedIndices();
  const showHints = hintState.enabled;

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

  const gameContent = (
    <div style={styles.gameContent}>
      <div style={styles.boardContainer}>
        <div style={boardStyle}>
          {board.map((card, index) => (
            <CardComponent key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState.status === 'waiting' ? (
        <PreGameScreen onSelect={setDifficulty} />
      ) : (
        gameContent
      )}
    </>
  );
};

export default Concentration;
export { useConcentration };
