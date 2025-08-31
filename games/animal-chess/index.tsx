"use client";

import React, { CSSProperties } from 'react';
import {
  Piece,
  PieceType,
  GameState,
  getValidMoves,
  getValidDrops,
  isSquareThreatened,
  MOVES,
  SENTE,
  GOTE,
} from './core';
import Image from 'next/image';
import { styles } from './styles';
import { AnimalChessController, useAnimalChess } from './useAnimalChess';
import GameLayout from '../../app/components/GameLayout';

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

const PieceDisplay: React.FC<{ piece: Piece; showIndicators: boolean }> = ({ piece, showIndicators }) => {
  const playerPrefix = piece.owner === SENTE ? 'p1_' : 'p2_';
  const imageName = pieceImageMap[piece.type];
  const imagePath = `${basePath}/games/animal-chess/img/${playerPrefix}${imageName}`;

  const imageStyle: CSSProperties = {
    transform: piece.owner === GOTE ? 'rotate(180deg)' : 'none',
    objectFit: 'contain',
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

const GameOverModal: React.FC<{ status: 'playing' | 'sente_win' | 'gote_win'; onReset: () => void }> = ({ status, onReset }) => {
  if (status === 'playing') return null;

  const winnerText = status === 'sente_win' ? 'プレイヤー1の勝ち！' : 'プレイヤー2の勝ち！';

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>ゲーム終了</h2>
        <p style={styles.modalText}>{winnerText}</p>
        <button style={styles.modalButton} onClick={onReset}>
          もう一度遊ぶ
        </button>
      </div>
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
  
  const showHints = hintState.enabled;
  const isGameInProgress = gameState.status === 'playing';

  // GameControllerのgameStateをコアロジックのGameState型に変換
  const coreGameState: GameState = {
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    capturedPieces: gameState.capturedPieces,
    status: gameState.status as 'playing' | 'sente_win' | 'gote_win',
    selectedCell: gameState.selectedCell,
    selectedCaptureIndex: gameState.selectedCaptureIndex
  };

  // ヒント計算のヘルパー関数
  const calculateHints = (from: { row: number; col: number }) => {
    if (!showHints) return { valid: [], capturable: [], threatened: [] };

    const validMoves = getValidMoves(coreGameState, from.row, from.col);

    const capturableMoves = validMoves.filter(move => {
      const destinationPiece = gameState.board[move.row][move.col];
      return destinationPiece && destinationPiece.owner !== gameState.currentPlayer;
    });

    const threatenedMoves = validMoves.filter(move => {
      const pieceToMove = coreGameState.board[from.row][from.col];
      if (!pieceToMove) return false;
      const tempBoard = coreGameState.board.map(r => [...r]);
      tempBoard[move.row][move.col] = pieceToMove;
      tempBoard[from.row][from.col] = null;
      return isSquareThreatened(tempBoard, move.row, move.col, coreGameState.currentPlayer);
    });

    return { valid: validMoves, capturable: capturableMoves, threatened: threatenedMoves };
  };

  const onCellClick = (row: number, col: number) => {
    if (!isGameInProgress) return;
    handleCellClick(row, col);
  };

  const onCaptureClick = (player: typeof SENTE | typeof GOTE, index: number) => {
    if (!isGameInProgress) return;
    handleCaptureClick(player, index);
  };

  const getCellStyle = (row: number, col: number): CSSProperties => {
    const cellStyle: CSSProperties = {}; // Start with an empty style object
    const piece = gameState.board[row][col];

    // Apply hints for valid moves, captures, and threats first
    if (showHints) {
      if (gameState.selectedCell) {
        const hintedMoves = calculateHints(gameState.selectedCell);
        const isCapturable = hintedMoves.capturable.some(m => m.row === row && m.col === col);
        const isValid = hintedMoves.valid.some(m => m.row === row && m.col === col);
        if (isCapturable) {
          cellStyle.backgroundColor = styles.capturableCell.backgroundColor;
        } else if (isValid) {
          cellStyle.backgroundColor = styles.validMoveCell.backgroundColor;
        }

        const isThreatened = hintedMoves.threatened.some(m => m.row === row && m.col === col);
        if (isThreatened) {
          cellStyle.boxShadow = styles.threatenedCell.boxShadow;
        }
      }
      if (gameState.selectedCaptureIndex) {
        const isDrop = getValidDrops(coreGameState, gameState.currentPlayer).some(d => d.row === row && d.col === col);
        if (isDrop) {
          cellStyle.backgroundColor = styles.validDropCell.backgroundColor;
        }
      }
    }

    // If the cell is not a move target, check if it contains a piece that can be selected
    if (showHints && !cellStyle.backgroundColor && piece && piece.owner === gameState.currentPlayer && isGameInProgress) {
      cellStyle.backgroundColor = styles.selectableCellHighlight.backgroundColor;
    }

    // The currently selected piece's highlight should have the highest priority
    if (gameState.selectedCell?.row === row && gameState.selectedCell?.col === col) {
      cellStyle.backgroundColor = styles.selectedCell.backgroundColor;
    }

    return cellStyle;
  };

  return (
    <>
      <GameOverModal 
        status={gameState.winner === SENTE ? 'sente_win' : 
               gameState.winner === GOTE ? 'gote_win' : 'playing'} 
        onReset={gameController.resetGame} 
      />

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
            row.map((cell, colIndex) => (
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
                {cell && <PieceDisplay piece={cell} showIndicators={true} />}
              </button>
            ))
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
