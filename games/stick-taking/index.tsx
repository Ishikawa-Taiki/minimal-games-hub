"use client";

import React, { useState, CSSProperties, useEffect, useMemo } from 'react';
import {
  Difficulty,
  GameState,
  Stick,
  createInitialState,
  selectStick,
  handleTakeSticks,
} from './core';

const StickTakingGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameState?.winner) {
      setShowModal(true);
    }
  }, [gameState?.winner]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState(createInitialState(selectedDifficulty));
  };

  const handleStickClick = (rowIndex: number, stickId: number) => {
    if (gameState) {
      setGameState(selectStick(gameState, rowIndex, stickId));
    }
  };

  const handleTakeButtonClick = () => {
    if (gameState && gameState.selectedSticks.length > 0) {
      setGameState(handleTakeSticks(gameState));
    }
  };

  const handlePlayAgain = () => {
    setDifficulty(null);
    setGameState(null);
    setShowModal(false);
  };

  const handleBackToTitle = () => {
    window.location.href = '/';
  };

  const renderDifficultyScreen = () => (
    <div style={styles.container}>
      <h1 style={styles.title}>棒消しゲーム</h1>
      <h2 style={styles.subtitle}>難易度を選択してください</h2>
      <div style={styles.difficultyButtons}>
        <button style={styles.button} onClick={() => handleDifficultySelect('easy')}>かんたん (3段)</button>
        <button style={styles.button} onClick={() => handleDifficultySelect('normal')}>ふつう (5段)</button>
        <button style={styles.button} onClick={() => handleDifficultySelect('hard')}>むずかしい (7段)</button>
      </div>
    </div>
  );

  const renderStick = (stick: Stick, rowIndex: number, stickIndex: number) => {
    const isSelected = gameState?.selectedSticks.some(s => s.row === rowIndex && s.stickId === stick.id);
    const stickStyle = {
      ...styles.stick,
      ...(stick.isTaken ? styles.takenStick : {}),
      ...(isSelected ? styles.selectedStick : {}),
    };
    return (
      <div
        key={stick.id}
        data-testid={`stick-${rowIndex}-${stickIndex}`}
        style={stickStyle}
        onClick={() => handleStickClick(rowIndex, stick.id)}
      >
        {stick.isTaken && <div style={styles.strikeThrough}></div>}
      </div>
    );
  };

  const renderGameScreen = () => {
    if (!gameState) return null;

    return (
      <div style={styles.container}>
        <h2 style={styles.turnIndicator}>{gameState.winner ? 'ゲーム終了' : `${gameState.currentPlayer}のターン`}</h2>
        <div style={styles.board}>
          {gameState.rows.map((row, rowIndex) => (
            <div key={rowIndex} data-testid={`row-${rowIndex}`} style={styles.row}>
              {row.map((stick, stickIndex) => renderStick(stick, rowIndex, stickIndex))}
            </div>
          ))}
        </div>
        <button
          style={styles.button}
          onClick={handleTakeButtonClick}
          disabled={gameState.selectedSticks.length === 0 || !!gameState.winner}
        >
          選択した棒を消す
        </button>
        {showModal && (
          <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
            <div style={styles.gameOverModal}>
              <h2 style={styles.gameOverTitle}>勝敗決定！</h2>
              <p style={styles.winnerText}>勝者: {gameState.winner}</p>
              <p style={styles.reasonText}>({gameState.currentPlayer}が最後の棒を取りました)</p>
              <div style={styles.modalButtons}>
                <button data-testid="play-again-button" style={styles.button} onClick={handlePlayAgain}>もう一度遊ぶ</button>
                <button style={styles.button} onClick={handleBackToTitle}>タイトルへ戻る</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return difficulty ? renderGameScreen() : renderDifficultyScreen();
};

const styles: { [key: string]: CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'sans-serif',
    },
    title: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: '1.5rem',
      marginBottom: '2rem',
    },
    difficultyButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    button: {
      padding: '1rem 2rem',
      fontSize: '1.2rem',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#4a90e2',
      color: 'white',
    },
    turnIndicator: {
      fontSize: '1.8rem',
      marginBottom: '1rem',
      fontWeight: 'bold',
    },
    board: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '2rem',
    },
    row: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    stick: {
      width: '12px',
      height: '60px',
      backgroundColor: '#8B4513',
      borderRadius: '3px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'relative',
    },
    takenStick: {
      backgroundColor: '#d3d3d3',
    },
    selectedStick: {
      backgroundColor: '#ffcc00',
    },
    strikeThrough: {
        position: 'absolute',
        top: '50%',
        left: '-5px',
        right: '-5px',
        height: '4px',
        backgroundColor: 'red',
        transform: 'translateY(-50%)',
    },
    gameOverOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    gameOverModal: {
      backgroundColor: 'white',
      padding: '2rem 3rem',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    gameOverTitle: {
      fontSize: '2rem',
      marginBottom: '1rem',
    },
    winnerText: {
      fontSize: '1.5rem',
      margin: '0.5rem 0',
      fontWeight: 'bold',
    },
    reasonText: {
        fontSize: '1rem',
        color: '#666',
        marginBottom: '1.5rem',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    }
  };

export default StickTakingGame;
