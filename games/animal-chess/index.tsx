"use client";

import React, { useState, useMemo } from 'react';
import {
  createInitialState,
  handleCellClick,
  handleCaptureClick,
  getValidMoves,
  getValidDrops,
  GameState,
  Piece,
  PieceType,
  Player,
} from './core';
import { styles } from './styles';

// =============================================================================
// Helper Components & Functions
// =============================================================================

const PIECE_LABEL: { [key in PieceType]: string } = {
  [PieceType.LION]: 'ラ',
  [PieceType.GIRAFFE]: 'キ',
  [PieceType.ELEPHANT]: 'ゾ',
  [PieceType.CHICK]: 'ヒ',
  [PieceType.ROOSTER]: 'ニ',
};

const PIECE_MOVES: { [key in PieceType]: [number, number][] } = {
    [PieceType.LION]:    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
    [PieceType.GIRAFFE]: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    [PieceType.ELEPHANT]:[[-1, -1], [-1, 1], [1, -1], [1, 1]],
    [PieceType.CHICK]:   [[-1, 0]],
    [PieceType.ROOSTER]: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
};

const PieceComponent: React.FC<{ piece: Piece, isSelected: boolean }> = ({ piece, isSelected }) => {
  const playerColor = piece.owner === Player.SENTE ? 'red' : 'blue';
  const moves = PIECE_MOVES[piece.type];

  return (
    <div style={{ ...styles.piece, ...(isSelected ? styles.selectedPiece : {}) }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {/* Piece Body */}
        <polygon points="50,5 95,35 85,95 15,95 5,35" fill={playerColor} stroke="black" strokeWidth="2" />
        {/* Piece Label */}
        <text x="50" y="65" fontSize="40" textAnchor="middle" fill="white" fontWeight="bold">
          {PIECE_LABEL[piece.type]}
        </text>
        {/* Move Indicators */}
        {moves.map(([dr, dc], i) => {
          const angle = Math.atan2(dr, dc) * (180 / Math.PI) + 90;
          return (
            <path
              key={i}
              d="M 50,0 L 45,10 L 55,10 Z"
              fill="rgba(255, 255, 0, 0.9)"
              transform={`translate(50, 50) rotate(${angle}) translate(0, -45) scale(0.8)`}
            />
          );
        })}
      </svg>
    </div>
  );
};

const GameEndModal: React.FC<{ status: GameState['status'], onReset: () => void }> = ({ status, onReset }) => {
    if (status === 'playing') return null;

    const message = status === 'sente_win' ? 'プレイヤー1の勝ち！' : 'プレイヤー2の勝ち！';

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2>{message}</h2>
                <button onClick={onReset} style={styles.button}>もう一度プレイ</button>
            </div>
        </div>
    );
};

// =============================================================================
// Main Game Component
// =============================================================================

const AnimalChess: React.FC = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false);

  const onCellClick = (row: number, col: number) => {
    setState(prevState => handleCellClick(prevState, row, col));
    setShowHints(false); // Hide hints after any move attempt
  };

  const onCaptureClick = (player: Player, index: number) => {
    setState(prevState => handleCaptureClick(prevState, player, index));
    setShowHints(false);
  };

  const onResetClick = () => {
    setState(createInitialState());
    setShowHints(false);
  };

  const onHintClick = () => {
    setShowHints(s => !s);
  };

  const validMoves = useMemo(() => {
    if (!state.selectedCell) return [];
    return getValidMoves(state, state.selectedCell.row, state.selectedCell.col);
  }, [state]);

  const validDrops = useMemo(() => {
    if (!state.selectedCaptureIndex) return [];
    return getValidDrops(state, state.selectedCaptureIndex.player);
  }, [state]);

  const isHighlighted = (row: number, col: number): boolean => {
    if (!showHints) return false;
    if (state.selectedCell) {
        return validMoves.some(move => move.row === row && move.col === col);
    }
    if (state.selectedCaptureIndex) {
        return validDrops.some(drop => drop.row === row && drop.col === col);
    }
    return false;
  };

  return (
    <>
        <GameEndModal status={state.status} onReset={onResetClick} />
        <div style={styles.gameContainer}>
            {/* Player 2 (GOTE) Captured Pieces */}
            <div style={{...styles.captureArea, ...(state.currentPlayer === Player.GOTE ? styles.activePlayerArea : {})}}>
                <div style={styles.captureBox}>
                {state.capturedPieces[Player.GOTE].map((pt, i) => (
                    <div key={i} onClick={() => onCaptureClick(Player.GOTE, i)}>
                        <PieceComponent piece={{type: pt, owner: Player.GOTE}} isSelected={state.selectedCaptureIndex?.player === Player.GOTE && state.selectedCaptureIndex?.index === i} />
                    </div>
                ))}
                </div>
            </div>

            {/* Board */}
            <div style={styles.board}>
                {state.board.map((row, r) => (
                    <div key={r} style={styles.boardRow}>
                        {row.map((cell, c) => (
                            <div key={c} style={{...styles.cell, ...(isHighlighted(r, c) ? styles.hintCell : {})}} onClick={() => onCellClick(r, c)}>
                                {cell && <PieceComponent piece={cell} isSelected={state.selectedCell?.row === r && state.selectedCell?.col === c} />}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Player 1 (SENTE) Captured Pieces */}
            <div style={{...styles.captureArea, ...(state.currentPlayer === Player.SENTE ? styles.activePlayerArea : {})}}>
                 <div style={styles.captureBox}>
                {state.capturedPieces[Player.SENTE].map((pt, i) => (
                    <div key={i} onClick={() => onCaptureClick(Player.SENTE, i)}>
                        <PieceComponent piece={{type: pt, owner: Player.SENTE}} isSelected={state.selectedCaptureIndex?.player === Player.SENTE && state.selectedCaptureIndex?.index === i} />
                    </div>
                ))}
                </div>
            </div>

             {/* Controls */}
            <div style={styles.controls}>
                <p>てばん: プレイヤー {state.currentPlayer + 1}</p>
                <button onClick={onHintClick} style={styles.button}>
                    {showHints ? "ヒントをかくす" : "ヒントをみる"}
                </button>
                <button onClick={onResetClick} style={styles.button}>
                    リセット
                </button>
            </div>
        </div>
    </>
  );
};

export default AnimalChess;
