"use client";

import React, { useState, useCallback, CSSProperties } from 'react';
import {
  Player,
  GameState,
  WinCondition,
  createInitialState,
  handleCellClick as handleCellClickCore,
  setWinCondition,
} from './core';

// Piece component for the game board
const Piece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    transform: player === 'PLAYER2' ? 'rotate(180deg)' : 'none',
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
};

// Piece component for the UI indicators (no rotation)
const IndicatorPiece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
};


const HasamiShogi: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hintLevel, setHintLevel] = useState<'on' | 'off'>('off');

  const initializeGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const onCellClick = (r: number, c: number) => {
    if (gameState.gameStatus === 'GAME_OVER') return;
    const newState = handleCellClickCore(gameState, r, c);
    setGameState(newState);
  };

  const onWinConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value as WinCondition;
    const newState = setWinCondition(gameState, newCondition);
    setGameState(newState);
  };

  const toggleHintLevel = () => {
    setHintLevel(prev => prev === 'on' ? 'off' : 'on');
  };

  const isGameStarted = gameState.capturedPieces.PLAYER1 > 0 || gameState.capturedPieces.PLAYER2 > 0 || !gameState.board.every((row, r) => row.every((cell, c) => cell === createInitialState().board[r][c]));


  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell, position: 'relative' };
    const { selectedPiece, validMoves, potentialCaptures } = gameState;
    const moveKey = `${r},${c}`;

    // Style for selected piece
    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      style.backgroundColor = '#f6e05e'; // Yellow
    }

    // Hint-related styling
    if (hintLevel === 'on' && selectedPiece) {
      const moveData = validMoves.get(moveKey);
      if (moveData) {
        // Style for valid move destinations
        style.backgroundColor = moveData.isUnsafe ? '#feb2b2' : '#9ae6b4'; // Red/Green
      }
      // Style for pieces that could be captured
      if (potentialCaptures.some(([capR, capC]) => capR === r && capC === c)) {
        style.backgroundColor = '#a4cafe'; // Light blue
      }
    }

    return style;
  };

  const winner = gameState.winner;
  const turnText = gameState.currentPlayer === 'PLAYER1'
    ? '歩のばん'
    : <span style={{display: 'inline-flex', alignItems: 'center', color: '#e53e3e'}}>
        <span>と</span>
        <span style={{color: 'black'}}>&nbsp;のばん</span>
      </span>;

  return (
    <div style={styles.container}>
      <div style={styles.winConditionSelector} data-testid="win-condition-selector">
        <h2 style={styles.winConditionTitle}>勝利条件</h2>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="standard" checked={gameState.winCondition === 'standard'} onChange={onWinConditionChange} disabled={isGameStarted} />
            スタンダード (5枚先取 or 3枚差)
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="five_captures" checked={gameState.winCondition === 'five_captures'} onChange={onWinConditionChange} disabled={isGameStarted} />
            5枚先取
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="total_capture" checked={gameState.winCondition === 'total_capture'} onChange={onWinConditionChange} disabled={isGameStarted} />
            全取り (相手を残り1枚に)
          </label>
        </div>
      </div>

      <div style={styles.infoPanel}>
        <div style={styles.score}>
          <span>取った駒:</span>
          <IndicatorPiece player="PLAYER2" />
          <span>x {gameState.capturedPieces.PLAYER2}</span>
        </div>
        <div style={styles.turnIndicator}>
          {winner ? 'ゲーム終了' : turnText}
        </div>
        <div style={styles.score}>
          <span>取った駒:</span>
          <IndicatorPiece player="PLAYER1" />
          <span>x {gameState.capturedPieces.PLAYER1}</span>
        </div>
      </div>

      <div style={styles.board}>
        {gameState.board.map((row, r) =>
          row.map((cell, c) => {
            return (
              <div
                key={`${r}-${c}`}
                data-testid={`cell-${r}-${c}`}
                style={getCellStyle(r, c)}
                onClick={() => onCellClick(r, c)}
              >
                {cell && <Piece player={cell} />}
                {cell === gameState.currentPlayer && !winner && (
                  <div style={styles.currentPlayerHighlight} />
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button data-testid="reset-button" onClick={initializeGame} style={styles.resetButton}>
          はじめから
        </button>
        <button
          data-testid="hint-button"
          onClick={toggleHintLevel}
          style={{...styles.resetButton, backgroundColor: hintLevel === 'on' ? '#4a5568' : '#a0aec0'}}
        >
          ヒント: {hintLevel === 'on' ? 'ON' : 'OFF'}
        </button>
      </div>

      {winner && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <div data-testid="winner-message" style={styles.winnerText}>
              {winner === 'PLAYER1'
                 ? <IndicatorPiece player="PLAYER1" />
                 : <IndicatorPiece player="PLAYER2" />
              }
              <span>の勝ち!</span>
            </div>
            <button data-testid="play-again-button" onClick={initializeGame} style={styles.resetButton}>
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  winConditionSelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f7fafc',
  },
  winConditionTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
  },
  infoPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '360px',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  score: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
  },
  turnIndicator: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 40px)',
    gridTemplateRows: 'repeat(9, 40px)',
    gap: '2px',
    backgroundColor: '#d2b48c',
    padding: '10px',
    border: '2px solid #8b4513',
  },
  cell: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f5deb3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  piece: {
    fontSize: '24px',
    fontWeight: 'bold',
    userSelect: 'none',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  resetButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1.1rem',
    backgroundColor: '#8b4513',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem 3rem',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  gameOverTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  winnerText: {
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  currentPlayerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '2px',
    pointerEvents: 'none',
  }
};

export default HasamiShogi;
