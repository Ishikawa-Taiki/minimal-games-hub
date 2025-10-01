"use client";

import React, { CSSProperties, useState, useEffect } from 'react';
import { BoardCard, Difficulty } from './core';
import { styles } from './styles';
import { useConcentration } from './useConcentration';
import { useResponsive } from '@/core/hooks/useResponsive';
import { PositiveButton } from '@/app/components/ui';
import { useDialog } from '@/app/components/ui/DialogProvider';
import { CardFaceContent } from './CardFaceContent';

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
    getNewlyMatchedIndices,
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
  const newlyMatchedIndices = getNewlyMatchedIndices();
  const showHints = hintState.enabled;

  const CardComponent = ({ card, index }: { card: BoardCard; index: number }) => {
    const isFlipped = card.isFlipped;
    const isSelected = gameState.flippedIndices.includes(index) && gameState.flippedIndices.length === 1;
    const isNewlyMatched = newlyMatchedIndices.includes(index);

    const cardInnerStyle: CSSProperties = {
      ...styles.cardInner,
      transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
    };

    const cardFaceStyle: CSSProperties = { ...styles.cardFace };
    if (card.isMatched) {
      if (card.matchedBy === 1) Object.assign(cardFaceStyle, styles.cardMatchedPlayer1);
      else if (card.matchedBy === 2) Object.assign(cardFaceStyle, styles.cardMatchedPlayer2);
    }

    const cardBackStyle: CSSProperties = { ...styles.cardBack };
    if (showHints) {
      if (hintedIndices.includes(index)) {
        cardBackStyle.backgroundColor = styles.cardHintStrong.backgroundColor;
      } else if (gameState.revealedIndices.includes(index)) {
        cardBackStyle.backgroundColor = styles.cardHint.backgroundColor;
      }
    }

    const cardContainerStyle: CSSProperties = {
      ...styles.card,
      ...(isSelected && styles.cardSelected),
      ...(isNewlyMatched && styles.cardMatchedHighlight),
    };

    return (
      <div
        style={cardContainerStyle}
        onClick={() => onCardClick(index)}
        data-testid={`card-${index}`}
      >
        <div style={cardInnerStyle}>
          <div style={cardFaceStyle}>
            <CardFaceContent suit={card.suit} rank={card.rank} />
          </div>
          <div style={cardBackStyle} />
        </div>
      </div>
    );
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

  const ScoreBoard = () => {
    const { scores, currentPlayer } = gameState;
    const player1ScoreStyle = currentPlayer === 'player1' ? styles.activePlayerScore : styles.score;
    const player2ScoreStyle = currentPlayer === 'player2' ? styles.activePlayerScore : styles.score;

    return (
      <div style={styles.scoreBoard}>
        <div style={player1ScoreStyle} data-testid="score-player1">
          プレイヤー1のペア: {scores.player1}
        </div>
        <div style={player2ScoreStyle} data-testid="score-player2">
          プレイヤー2のペア: {scores.player2}
        </div>
      </div>
    );
  };

  const gameContent = (
    <div style={styles.gameContent}>
      <ScoreBoard />
      <div style={styles.boardContainer}>
        <div style={boardStyle} data-testid="game-board">
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
