"use client";

import React, { useState, CSSProperties } from 'react';
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
  isSquareThreatened,
  MOVES,
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
import { styles } from './styles';

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
  '[0,1]':  styles.indicatorE,
  '[1,1]':  styles.indicatorSE,
  '[1,0]':  styles.indicatorS,
  '[1,-1]': styles.indicatorSW,
  '[0,-1]': styles.indicatorW,
  '[-1,-1]':styles.indicatorNW,
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
  const [hintedMoves, setHintedMoves] = useState<{
    valid: { row: number; col: number }[];
    capturable: { row: number; col: number }[];
    threatened: { row: number; col: number }[];
  }>({ valid: [], capturable: [], threatened: [] });

  const isGameInProgress = gameState.status === 'playing';

  const clearHints = () => {
    setHintedMoves({ valid: [], capturable: [], threatened: [] });
  };

  const calculateAndSetHints = (state: GameState, from: { row: number; col: number }) => {
    if (!showHints) return;

    const validMoves = getValidMoves(state, from.row, from.col);

    const capturableMoves = validMoves.filter(move => {
      const destinationPiece = state.board[move.row][move.col];
      return destinationPiece && destinationPiece.owner !== state.currentPlayer;
    });

    const threatenedMoves = validMoves.filter(move => {
      const pieceToMove = state.board[from.row][from.col];
      if (!pieceToMove) return false;
      const tempBoard = state.board.map(r => [...r]);
      tempBoard[move.row][move.col] = pieceToMove;
      tempBoard[from.row][from.col] = null;
      return isSquareThreatened(tempBoard, move.row, move.col, state.currentPlayer);
    });

    setHintedMoves({ valid: validMoves, capturable: capturableMoves, threatened: threatenedMoves });
  };

  const onCellClick = (row: number, col: number) => {
    if (!isGameInProgress) return;

    const piece = gameState.board[row][col];
    const isReselecting = gameState.selectedCell?.row === row && gameState.selectedCell?.col === col;

    if (isReselecting || (gameState.selectedCell && (!piece || piece.owner !== gameState.currentPlayer))) {
      clearHints();
    }

    if (gameState.selectedCaptureIndex !== null) {
      const pieceType = gameState.capturedPieces[gameState.selectedCaptureIndex.player][gameState.selectedCaptureIndex.index];
      const newState = dropPiece(gameState, gameState.selectedCaptureIndex.player, pieceType, { row, col });
      setGameState(newState);
      clearHints();
      return;
    }

    const newState = coreHandleCellClick(gameState, row, col);
    setGameState(newState);

    if (newState.selectedCell && (newState.selectedCell.row !== gameState.selectedCell?.row || newState.selectedCell.col !== gameState.selectedCell?.col)) {
      calculateAndSetHints(newState, newState.selectedCell);
    } else if (!newState.selectedCell) {
      clearHints();
    }
  };

  const handleCaptureClick = (player: typeof SENTE | typeof GOTE, index: number) => {
    if (!isGameInProgress) return;
    clearHints();
    const newState = coreHandleCaptureClick(gameState, player, index);
    setGameState(newState);
  };

  const handleReset = () => {
    setGameState(createInitialState());
    clearHints();
  };

  const toggleHints = () => {
    const newShowHints = !showHints;
    setShowHints(newShowHints);
    if (!newShowHints) {
      clearHints();
    } else {
      if (gameState.selectedCell) {
        calculateAndSetHints(gameState, gameState.selectedCell);
      }
    }
  };

  const getCellStyle = (row: number, col: number): CSSProperties => {
    const cellStyle: CSSProperties = {}; // Start with an empty style object
    const piece = gameState.board[row][col];

    // Apply hints for valid moves, captures, and threats first
    if (showHints) {
      if (gameState.selectedCell) {
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
        const isDrop = getValidDrops(gameState, gameState.currentPlayer).some(d => d.row === row && d.col === col);
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
    <div style={styles.container}>
      <h1 style={styles.title}>アニマルチェス</h1>
      <GameOverModal status={gameState.status} onReset={handleReset} />

      <p style={styles.statusText} data-testid="current-player-text">
        いまのばん: {gameState.currentPlayer === SENTE ? 'プレイヤー1' : 'プレイヤー2'}
      </p>

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

      <div style={styles.controls}>
        <button style={styles.button} onClick={handleReset}>
          リセット
        </button>
        <button style={styles.button} onClick={toggleHints}>
          ヒント: {showHints ? 'ON' : 'OFF'}
        </button>
      </div>

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
                <PieceDisplay piece={{ type: pieceType, owner: SENTE }} showIndicators={false} />
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
                <PieceDisplay piece={{ type: pieceType, owner: GOTE }} showIndicators={false} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalChessPage;
