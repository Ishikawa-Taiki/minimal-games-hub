"use client";

import React, { useState, useEffect } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick,
} from './core';
import { styles } from './styles';

const TicTacToe = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showHints, setShowHints] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameState.winner || gameState.isDraw) {
      setShowModal(true);
    }
  }, [gameState.winner, gameState.isDraw]);

  const handleClick = (row: number, col: number) => {
    const newState = handleCellClick(gameState, row, col);
    if (newState) {
      setGameState(newState);
    }
  };

  const handlePlayAgain = () => {
    setGameState(createInitialState());
    setShowModal(false);
  };

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const getStatus = () => {
    if (gameState.winner) {
      return `勝者: ${gameState.winner}`;
    } else if (gameState.isDraw) {
      return "引き分け！";
    } else {
      return `現在のプレイヤー: ${gameState.currentPlayer}`;
    }
  };

  const isBothPlayersReaching = (index: number): boolean => {
    const xReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'X');
    const oReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'O');
    return xReaching && oReaching;
  };

  const getCellBackgroundColor = (index: number): string => {
    if (gameState.winningLines && gameState.winningLines.some(line => line.includes(index))) {
      return styles.winningCell.backgroundColor as string;
    }
    if (showHints) {
      if (isBothPlayersReaching(index)) {
        return styles.bothReachingCell.backgroundColor as string;
      } else if (gameState.reachingLines.some(rl => rl.index === index)) {
        return styles.reachingCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  const getReachingPlayerMark = (index: number): Player => {
    const reaching = gameState.reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.board}>
        {gameState.board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const reachingPlayerMark = getReachingPlayerMark(index);

          return (
            <button
              key={`${row}-${col}`}
              data-testid={`cell-${row}-${col}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(index),
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!gameState.winner || gameState.isDraw}
            >
              {cell ? cell : (
                showHints && reachingPlayerMark && !isBothPlayersReaching(index) && (
                  <span style={styles.faintMark}>
                    {reachingPlayerMark}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      <p data-testid="status" style={styles.status}>{getStatus()}</p>
      <div>
        <button
          data-testid="reset-button"
          style={styles.resetButton}
          onClick={handleReset}
        >
          ゲームをリセット
        </button>
        <button
          data-testid="hint-button"
          style={styles.toggleButton}
          onClick={() => setShowHints(!showHints)}
        >
          ヒント: {showHints ? 'ON' : 'OFF'}
        </button>
      </div>

      {showModal && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <div data-testid="winner-message">
              {gameState.winner ? `勝者: ${gameState.winner}` : '引き分け！'}
            </div>
            <button
              data-testid="play-again-button"
              style={styles.resetButton}
              onClick={handlePlayAgain}
            >
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;