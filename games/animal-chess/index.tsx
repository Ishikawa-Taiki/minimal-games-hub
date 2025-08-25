"use client";

import React, { useState, CSSProperties } from 'react';
import getConfig from 'next/config';
import {
  BOARD_COLS,
  Piece,
  PieceType,
  GameState,
  createInitialState,
  handleCellClick as coreHandleCellClick,
  handleCaptureClick as coreHandleCaptureClick,
  getValidMoves,
  getValidDrops,
  SENTE,
  GOTE,
  LION,
  GIRAFFE,
  ELEPHANT,
  CHICK,
  ROOSTER,
  dropPiece,
} from './core';
import Image from 'next/image';

const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: { basePath: '' } };
const basePath = publicRuntimeConfig.basePath || '';

const pieceImageMap: Record<PieceType, string> = {
  LION: 'lion.png',
  GIRAFFE: 'giraffe.png',
  ELEPHANT: 'elephant.png',
  CHICK: 'chick.png',
  ROOSTER: 'chicken.png',
};

const PieceDisplay: React.FC<{ piece: Piece }> = ({ piece }) => {
  const playerPrefix = piece.owner === SENTE ? 'p1_' : 'p2_';
  const imageName = pieceImageMap[piece.type];
  const imagePath = `${basePath}/games/animal-chess/img/${playerPrefix}${imageName}`;

  const imageStyle: CSSProperties = {
    transform: piece.owner === GOTE ? 'rotate(180deg)' : 'none',
    width: '90%',
    height: '90%',
    objectFit: 'contain',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <Image src={imagePath} alt={`${piece.owner} ${piece.type}`} width={60} height={60} style={imageStyle} />
    </div>
  );
};

const GameOverModal: React.FC<{ status: GameState['status']; onReset: () => void }> = ({ status, onReset }) => {
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

const AnimalChessPage = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false);

  const isGameInProgress = gameState.status === 'playing';

  const onCellClick = (row: number, col: number) => {
    if (!isGameInProgress) return;

    if (gameState.selectedCaptureIndex !== null) {
      const pieceType = gameState.capturedPieces[gameState.selectedCaptureIndex.player][gameState.selectedCaptureIndex.index];
      const newState = dropPiece(gameState, gameState.selectedCaptureIndex.player, pieceType, { row, col });
      if (newState) {
        setGameState(newState);
      }
    } else {
      const newState = coreHandleCellClick(gameState, row, col);
      if (newState) {
        setGameState(newState);
      }
    }
  };

  const handleCaptureClick = (player: typeof SENTE | typeof GOTE, index: number) => {
    if (!isGameInProgress) return;
    const newState = coreHandleCaptureClick(gameState, player, index);
    if (newState) {
      setGameState(newState);
    }
  };

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const getCellBackgroundColor = (row: number, col: number): string => {
    if (gameState.selectedCell && gameState.selectedCell.row === row && gameState.selectedCell.col === col) {
      return styles.selectedCell.backgroundColor as string;
    }
    if (showHints) {
      const validMoves = gameState.selectedCell ? getValidMoves(gameState, gameState.selectedCell.row, gameState.selectedCell.col) : [];
      if (validMoves.some(move => move.row === row && move.col === col)) {
        return styles.validMoveCell.backgroundColor as string;
      }
      const validDrops = gameState.selectedCaptureIndex ? getValidDrops(gameState, gameState.currentPlayer) : [];
      if (validDrops.some(drop => drop.row === row && drop.col === col)) {
        return styles.validDropCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>アニマルチェス</h1>
      <GameOverModal status={gameState.status} onReset={handleReset} />

      <div style={styles.board}>
        {gameState.board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              data-testid={`cell-${rowIndex}-${colIndex}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(rowIndex, colIndex),
                cursor: isGameInProgress ? 'pointer' : 'default',
              }}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={!isGameInProgress}
            >
              {cell && <PieceDisplay piece={cell} />}
            </button>
          ))
        ))}
      </div>

      <div style={styles.controls}>
        <button style={styles.button} onClick={handleReset}>
          リセット
        </button>
        <button style={styles.button} onClick={() => setShowHints(!showHints)}>
          ヒント: {showHints ? 'ON' : 'OFF'}
        </button>
      </div>

      <p style={styles.statusText} data-testid="current-player-text">
        いまのばん: {gameState.currentPlayer === SENTE ? 'プレイヤー1' : 'プレイヤー2'}
      </p>

      <div style={styles.capturedPiecesContainer}>
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>プレイヤー1のとったこま</h3>
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
                onClick={() => handleCaptureClick(SENTE, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: SENTE }} />
              </button>
            ))}
          </div>
        </div>
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>プレイヤー2の とったこま</h3>
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
                onClick={() => handleCaptureClick(GOTE, index)}
                disabled={!isGameInProgress}
              >
                <PieceDisplay piece={{ type: pieceType, owner: GOTE }} />
              </button>
            ))}
          </div>
        </div>
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
    padding: '2rem',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
    gap: '4px',
    backgroundColor: '#4b5563',
    padding: '4px',
    borderRadius: '0.5rem',
  },
  cell: {
    width: '80px',
    height: '80px',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    borderRadius: '0.375rem',
    border: '1px solid #9ca3af',
  },
  selectedCell: {
    backgroundColor: '#bfdbfe',
  },
  validMoveCell: {
    backgroundColor: '#dcfce7',
  },
  validDropCell: {
    backgroundColor: '#fef9c3',
  },
  controls: {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
  statusText: {
    marginTop: '1rem',
    fontSize: '1.125rem',
  },
  capturedPiecesContainer: {
    display: 'flex',
    marginTop: '2rem',
    gap: '2rem',
  },
  capturedPiecesBox: {
    border: '1px solid #d1d5db',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
  },
  capturedPiecesTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  capturedPiecesList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  capturedPiece: {
    fontSize: '1.5rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.25rem',
    border: 'none',
  },
  selectedCapturedPiece: {
    backgroundColor: '#bfdbfe',
    boxShadow: '0 0 0 2px #3b82f6',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  modalText: {
    fontSize: '1.125rem',
    marginBottom: '1.5rem',
  },
  modalButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default AnimalChessPage;
