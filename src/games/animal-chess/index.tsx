"use client";

import React, { CSSProperties } from 'react';
import {
  Piece,
  PieceType,
  Player,
  MOVES,
  OKASHI_TEAM,
  OHANA_TEAM,
} from './core';
import Image from 'next/image';
import { styles } from './styles';
import { AnimalChessController, useAnimalChess } from './useAnimalChess';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const pieceImageMap: Record<PieceType, string> = {
  LION: 'lion.png',
  GIRAFFE: 'giraffe.png',
  ELEPHANT: 'elephant.png',
  CHICK: 'chick.png',
  ROOSTER: 'chicken.png',
};

const moveVectorToIndicatorMap: { [key: string]: React.CSSProperties } = {
  '[-1,0]': styles.indicatorN,
  '[-1,1]': styles.indicatorNE,
  '[0,1]': styles.indicatorE,
  '[1,1]': styles.indicatorSE,
  '[1,0]': styles.indicatorS,
  '[1,-1]': styles.indicatorSW,
  '[0,-1]': styles.indicatorW,
  '[-1,-1]': styles.indicatorNW,
};

const PieceDisplay: React.FC<{ piece: Piece; showIndicators: boolean, isGrayedOut?: boolean }> = ({ piece, showIndicators, isGrayedOut }) => {
  const playerPrefix = piece.owner === OKASHI_TEAM ? 'p1_' : 'p2_';
  const imageName = pieceImageMap[piece.type];
  const imagePath = `${basePath}/games/animal-chess/img/${playerPrefix}${imageName}`;

  const imageStyle: CSSProperties = {
    transform: piece.owner === OHANA_TEAM ? 'rotate(180deg)' : 'none',
    objectFit: 'contain',
    ...(isGrayedOut ? styles.grayedOutPiece : {}),
    zIndex: 2,
  };

  const baseMoves = MOVES[piece.type];
  const ownerMoves = piece.owner === OKASHI_TEAM ? baseMoves : baseMoves.map(([r, c]) => [-r, -c] as [number, number]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Image src={imagePath} alt={`${piece.owner} ${piece.type}`} fill style={imageStyle} />
      {showIndicators && ownerMoves.map(move => {
        const key = JSON.stringify(move);
        const indicatorStyle = moveVectorToIndicatorMap[key];
        if (indicatorStyle) {
          const indicatorColor = piece.owner === OKASHI_TEAM ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
          const dynamicStyle = { ...styles.moveIndicator, ...indicatorStyle, backgroundColor: indicatorColor };
          return <div key={key} style={dynamicStyle} />;
        }
        return null;
      })}
    </div>
  );
};


interface AnimalChessProps {
  controller?: AnimalChessController;
}

const AnimalChessPage = ({ controller: externalController }: AnimalChessProps = {}) => {
  const internalController = useAnimalChess();
  const gameController = externalController || internalController;
  const { gameState, handleCellClick, handleCaptureClick, hintState } = gameController;

  const isGameInProgress = gameState.status === 'playing';

  const onCellClick = (row: number, col: number) => {
    if (!isGameInProgress) return;
    handleCellClick(row, col);
  };

  const onCaptureClick = (player: Player, index: number) => {
    if (!isGameInProgress) return;
    handleCaptureClick(player, index);
  };

  const getCellStyle = (row: number, col: number): CSSProperties => {
    const cell = gameState.board[row][col];
    const isSelectable = !!(cell && cell.owner === gameState.currentPlayer && isGameInProgress);
    const cellStyle: CSSProperties = {};

    // Apply selectable cell style if the piece can be moved and no piece is currently selected.
    if (isSelectable && !gameState.selectedCell) {
      cellStyle.backgroundColor = styles.selectableCell.backgroundColor;
    }

    const highlightedCell = hintState.highlightedCells?.find(h => h.row === row && h.col === col);
    if (highlightedCell && highlightedCell.color) {
      cellStyle.backgroundColor = highlightedCell.color;
    }

    // The currently selected piece's highlight should have the highest priority
    if (gameState.selectedCell?.row === row && gameState.selectedCell?.col === col) {
      cellStyle.backgroundColor = styles.selectedCell.backgroundColor;
    }

    return cellStyle;
  };

  return (
    <>
      <div style={styles.gameArea}>
        {/* Player 2's captured pieces (top) */}
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>おはなチーム</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[OHANA_TEAM].map((pieceType, index) => (
              <button
                key={`gote-${index}`}
                style={{
                  ...styles.capturedPiece,
                  ...(gameState.selectedCaptureIndex?.player === OHANA_TEAM && gameState.selectedCaptureIndex?.index === index ? styles.selectedCapturedPiece : {}),
                  cursor: isGameInProgress ? 'pointer' : 'default',
                }}
                data-testid={`captured-piece-${OHANA_TEAM}-${pieceType}`}
                onClick={() => onCaptureClick(OHANA_TEAM, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: OHANA_TEAM }} showIndicators={false} />
              </button>
            ))}
          </div>
        </div>

        {/* Game Board */}
        <div style={styles.board} data-testid="animal-chess-board">
          {gameState.board.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isSelected = gameState.selectedCell?.row === rowIndex && gameState.selectedCell?.col === colIndex;
              const isHighlighted = hintState.highlightedCells?.some(h => h.row === rowIndex && h.col === colIndex);
              const showOverlay = gameState.selectedCell && !isSelected && !isHighlighted;

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  data-testid={`cell-${rowIndex}-${colIndex}`}
                  style={{
                    ...styles.cell,
                    ...getCellStyle(rowIndex, colIndex),
                    cursor: isGameInProgress ? 'pointer' : 'default',
                  }}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  disabled={!isGameInProgress}
                >
                  {showOverlay && <div style={styles.cellOverlay} />}
                  {cell && <PieceDisplay piece={cell} showIndicators={true} isGrayedOut={showOverlay} />}
                </button>
              );
            })
          ))}
        </div>

        {/* Player 1's captured pieces (bottom) */}
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>おかしチーム</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[OKASHI_TEAM].map((pieceType, index) => (
              <button
                key={`sente-${index}`}
                style={{
                  ...styles.capturedPiece,
                  ...(gameState.selectedCaptureIndex?.player === OKASHI_TEAM && gameState.selectedCaptureIndex?.index === index ? styles.selectedCapturedPiece : {}),
                  cursor: isGameInProgress ? 'pointer' : 'default',
                }}
                data-testid={`captured-piece-${OKASHI_TEAM}-${pieceType}`}
                onClick={() => onCaptureClick(OKASHI_TEAM, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: OKASHI_TEAM }} showIndicators={false} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export { useAnimalChess };
export default AnimalChessPage;
