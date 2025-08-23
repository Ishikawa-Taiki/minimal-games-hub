"use client";

import React, { useState, CSSProperties } from 'react';
import {
  BOARD_ROWS,
  BOARD_COLS,
  Player,
  PieceType,
  Piece,
  GameState,
  createInitialState,
  handleCellClick as coreHandleCellClick, // core.ts の handleCellClick を別名でインポート
  handleCaptureClick,
  getValidMoves,
  getValidDrops,
  SENTE,
  GOTE,
  LION,
  GIRAFFE,
  ELEPHANT,
  CHICK,
  ROOSTER,
} from './core';

// 駒の表示用コンポーネント (SVGは後で実装)
const PieceDisplay: React.FC<{ piece: Piece }> = ({ piece }) => {
  let pieceChar = '';
  switch (piece.type) {
    case LION: pieceChar = '獅'; break;
    case GIRAFFE: pieceChar = '麒'; break;
    case ELEPHANT: pieceChar = '象'; break;
    case CHICK: pieceChar = '雛'; break;
    case ROOSTER: pieceChar = '鶏'; break;
  }
  return (
    <span style={{ color: piece.owner === SENTE ? 'blue' : 'red' }}>
      {pieceChar}
    </span>
  );
};

const AnimalChessPage = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false); // ヒント表示状態

  // コンポーネント内のクリックハンドラ
  const onCellClick = (row: number, col: number) => { // 名前を変更
    const newState = coreHandleCellClick(gameState, row, col); // core.ts の関数を呼び出す
    if (newState) {
      setGameState(newState);
    }
  };

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const getCellBackgroundColor = (row: number, col: number): string => {
    if (gameState.selectedCell && gameState.selectedCell.row === row && gameState.selectedCell.col === col) {
      return styles.selectedCell.backgroundColor as string; // 選択中のセル
    }
    // 有効な移動先をハイライト (ヒントONの場合)
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
      <h1 style={styles.title}>Animal Chess</h1>

      <div style={styles.board}>
        {gameState.board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              data-testid={`cell-${rowIndex}-${colIndex}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(rowIndex, colIndex),
              }}
              onClick={() => onCellClick(rowIndex, colIndex)} // ここも変更
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

      <p style={styles.statusText}>
        現在のプレイヤー: {gameState.currentPlayer === SENTE ? '先手' : '後手'}
      </p>
      {gameState.status !== 'playing' && (
        <p style={styles.statusText}>
          ゲーム終了: {gameState.status === 'sente_win' ? '先手の勝利' : '後手の勝利'}
        </p>
      )}

      <div style={styles.capturedPiecesContainer}>
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>先手の持ち駒</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[SENTE].map((pieceType, index) => (
              <button
                key={`sente-${index}`}
                style={styles.capturedPiece}
                onClick={() => {
                  const newState = handleCaptureClick(gameState, SENTE, index);
                  if (newState) {
                    setGameState(newState);
                  }
                }}
              >
                <PieceDisplay piece={{ type: pieceType, owner: SENTE }} />
              </button>
            ))}
          </div>
        </div>
        <div style={styles.capturedPiecesBox}>
          <h3 style={styles.capturedPiecesTitle}>後手の持ち駒</h3>
          <div style={styles.capturedPiecesList}>
            {gameState.capturedPieces[GOTE].map((pieceType, index) => (
              <button
                key={`gote-${index}`}
                style={styles.capturedPiece}
                onClick={() => {
                  const newState = handleCaptureClick(gameState, GOTE, index);
                  if (newState) {
                    setGameState(newState);
                  }
                }}
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

// styles オブジェクトを定義
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
    cursor: 'pointer',
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
  },
};

export default AnimalChessPage;