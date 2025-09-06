"use client";

import React, { CSSProperties, useEffect } from 'react';
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
import { useDialog } from '../../app/components/ui/DialogProvider';

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
  const { gameState, handleCellClick, handleCaptureClick, hintState, resetGame } = gameController;
  const { alert } = useDialog();

  useEffect(() => {
    const { winner, winReason } = gameState;
    if (winner) {
      const winnerText = winner === SENTE ? 'プレイヤー1' : 'プレイヤー2';
      let message = '';
      if (winReason === 'catch') {
        message = 'キャッチ！(ライオンをとったよ！)';
      } else if (winReason === 'try') {
        message = 'トライ！ (さいごのますにとうたつしたよ！)';
      }

      alert({
        title: `${winnerText}のかち`,
        message: message,
      }).then(() => {
        resetGame();
      });
    }
  }, [gameState, resetGame, alert]);
  
  const showHints = hintState.enabled;
  const isGameInProgress = gameState.status === 'playing';

  // GameControllerのgameStateをコアロジックのGameState型に変換
  const coreGameState: GameState = {
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    capturedPieces: gameState.capturedPieces,
    status: gameState.status as 'playing' | 'sente_win' | 'gote_win',
    selectedCell: gameState.selectedCell,
    selectedCaptureIndex: gameState.selectedCaptureIndex,
    winReason: gameState.winReason,
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
