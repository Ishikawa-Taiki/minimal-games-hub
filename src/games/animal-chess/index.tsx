"use client";

import React, { CSSProperties } from 'react';
import {
  Piece,
  PieceType,
  MOVES,
  SENTE,
  GOTE,
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

const PieceDisplay: React.FC<{ piece: Piece; showIndicators: boolean, isSelectable?: boolean }> = ({ piece, showIndicators, isSelectable }) => {
  const playerPrefix = piece.owner === SENTE ? 'p1_' : 'p2_';
  const imageName = pieceImageMap[piece.type];
  const imagePath = `${basePath}/games/animal-chess/img/${playerPrefix}${imageName}`;

  const imageStyle: CSSProperties = {
    transform: piece.owner === GOTE ? 'rotate(180deg)' : 'none',
    objectFit: 'contain',
    ...(isSelectable ? styles.selectablePiece : {}),
  };

  const baseMoves = MOVES[piece.type];
  const ownerMoves = piece.owner === SENTE ? baseMoves : baseMoves.map(([r, c]) => [-r, -c] as [number, number]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Image src={imagePath} alt={`${piece.owner} ${piece.type}`} fill style={imageStyle} />
      {showIndicators && ownerMoves.map(move => {
        const key = JSON.stringify(move);
        const indicatorStyle = moveVectorToIndicatorMap[key];
        if (indicatorStyle) {
          const indicatorColor = piece.owner === SENTE ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
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

  const onCaptureClick = (player: typeof SENTE | typeof GOTE, index: number) => {
    if (!isGameInProgress) return;
    handleCaptureClick(player, index);
  };

  const getCellStyle = (row: number, col: number): CSSProperties => {
    const cellStyle: CSSProperties = {};

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
          <h3 style={styles.capturedPiecesTitle}>プレイヤー2</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[GOTE].map((pieceType, index) => (
              <button
                key={`gote-${index}`}
                style={{
                  ...styles.capturedPiece,
                  ...(gameState.selectedCaptureIndex?.player === GOTE && gameState.selectedCaptureIndex?.index === index ? styles.selectedCapturedPiece : {}),
                  cursor: isGameInProgress ? 'pointer' : 'default',
                }}
                data-testid={`captured-piece-${GOTE}-${pieceType}`}
                onClick={() => onCaptureClick(GOTE, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: GOTE }} showIndicators={false} />
              </button>
            ))}
          </div>
        </div>

        {/* Game Board */}
        <div style={styles.board} data-testid="animal-chess-board">
          {gameState.board.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isSelectable = !!(cell && cell.owner === gameState.currentPlayer && isGameInProgress);
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
                  {cell && <PieceDisplay piece={cell} showIndicators={true} isSelectable={isSelectable} />}
                </button>
              );
            })
          ))}
        </div>

        {/* Player 1's captured pieces (bottom) */}
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>プレイヤー1</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[SENTE].map((pieceType, index) => (
              <button
                key={`sente-${index}`}
                style={{
                  ...styles.capturedPiece,
                  ...(gameState.selectedCaptureIndex?.player === SENTE && gameState.selectedCaptureIndex?.index === index ? styles.selectedCapturedPiece : {}),
                  cursor: isGameInProgress ? 'pointer' : 'default',
                }}
                data-testid={`captured-piece-${SENTE}-${pieceType}`}
                onClick={() => onCaptureClick(SENTE, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: SENTE }} showIndicators={false} />
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
