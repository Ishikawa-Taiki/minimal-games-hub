"use client";

import React, { useState, CSSProperties, useEffect } from 'react';
import {
  Difficulty,
  GameState,
  Stick,
  createInitialState,
  selectStick,
  handleTakeSticks,
  toggleHintVisibility,
  getHintData,
} from './core';
import { styles } from './styles';

const StickTakingGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);

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

  const handleStickInteractionStart = (rowIndex: number, stickId: number) => {
    setIsDragging(true);
    const stick = gameState?.rows[rowIndex].find(s => s.id === stickId);
    if (!stick || stick.isTaken) return;

    const isSelected = gameState?.selectedSticks.some(s => s.row === rowIndex && s.stickId === stickId);
    const currentDragAction = isSelected ? 'deselect' : 'select';
    setDragAction(currentDragAction);

    // Apply the initial action immediately
    if (gameState) {
      setGameState(selectStick(gameState, rowIndex, stickId));
    }
  };

  const handleStickInteractionMove = (rowIndex: number, stickId: number) => {
    if (isDragging && gameState) {
      const stick = gameState.rows[rowIndex].find(s => s.id === stickId);
      if (!stick || stick.isTaken) return;

      const isSelected = gameState.selectedSticks.some(s => s.row === rowIndex && s.stickId === stickId);

      if (dragAction === 'select' && !isSelected) {
        setGameState(selectStick(gameState, rowIndex, stickId));
      } else if (dragAction === 'deselect' && isSelected) {
        setGameState(selectStick(gameState, rowIndex, stickId));
      }
    }
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    setDragAction(null);
  };


  const handleTakeButtonClick = () => {
    if (gameState && gameState.selectedSticks.length > 0) {
      setGameState(handleTakeSticks(gameState));
    }
  };

  const handleToggleHint = () => {
    if (gameState) {
      setGameState(toggleHintVisibility(gameState));
    }
  };

  const handlePlayAgain = () => {
    setDifficulty(null);
    setGameState(null);
    setShowModal(false);
  };

  const handleBackToTitle = () => {
    window.location.reload();
  };

  const renderDifficultyScreen = () => (
    <div style={styles.container}>
      <h1 style={styles.title}>ぼうけしゲーム</h1>
      <h2 style={styles.subtitle}>むずかしさをえらんでね</h2>
      <div style={styles.difficultyButtons}>
        <button style={styles.button} onClick={() => handleDifficultySelect('easy')}>かんたん (3だん)</button>
        <button style={styles.button} onClick={() => handleDifficultySelect('normal')}>ふつう (5だん)</button>
        <button style={styles.button} onClick={() => handleDifficultySelect('hard')}>むずかしい (7だん)</button>
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

    const strikeThroughStyle = {
      ...styles.strikeThrough,
      backgroundColor: stick.takenBy === 'プレイヤー1' ? '#ff4136' : '#0074d9',
    };

    return (
      <div
        key={stick.id}
        data-testid={`stick-${rowIndex}-${stick.id}`}
        style={stickStyle}
        onMouseDown={() => handleStickInteractionStart(rowIndex, stick.id)}
        onMouseEnter={() => handleStickInteractionMove(rowIndex, stick.id)}
        onMouseUp={handleInteractionEnd}
        onTouchStart={(e) => {
          e.preventDefault();
          handleStickInteractionStart(rowIndex, stick.id);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const element = document.elementFromPoint(touch.clientX, touch.clientY);
          if (element && element.getAttribute('data-testid')?.startsWith('stick-')) {
            const [_, rowStr, stickIdStr] = element.getAttribute('data-testid')!.split('-');
            handleStickInteractionMove(parseInt(rowStr), parseInt(stickIdStr));
          }
        }}
        onTouchEnd={handleInteractionEnd}
        onMouseLeave={isDragging ? undefined : handleInteractionEnd}
      >
        {stick.isTaken && <div style={strikeThroughStyle}></div>}
      </div>
    );
  };

  const renderGameScreen = () => {
    if (!gameState) return null;

    const turnIndicatorStyle = {
      ...styles.turnIndicator,
      color: gameState.currentPlayer === 'プレイヤー1' ? '#ff4136' : '#0074d9',
    };

    return (
      <div style={styles.container} onMouseUp={handleInteractionEnd} onTouchEnd={handleInteractionEnd}>
        <h2 style={turnIndicatorStyle}>{gameState.winner ? 'おしまい！' : `${gameState.currentPlayer}のばん`}</h2>
        <div style={styles.topBar}>
          <div style={styles.hintBoxLeft}>
            {gameState.isHintVisible && (
              <div data-testid="hint-box-left">
                <p>のこりのぼう</p>
                <p style={styles.hintValue}>{getHintData(gameState).remainingSticksCount}本</p>
              </div>
            )}
          </div>
          <div style={styles.hintBoxRight}>
            {gameState.isHintVisible && (
              <div data-testid="hint-box-right">
                <p>かたまりの数</p>
                <p style={styles.hintValue}>{getHintData(gameState).totalChunkCount}個</p>
              </div>
            )}
          </div>
        </div>
        <div style={styles.board}>
          {gameState.rows.map((row, rowIndex) => (
            <div key={rowIndex} data-testid={`row-${rowIndex}`} style={styles.row}>
              {row.map((stick, stickIndex) => renderStick(stick, rowIndex, stickIndex))}
            </div>
          ))}
        </div>
        <div style={styles.controls}>
          <button
            style={styles.button}
            onClick={handleTakeButtonClick}
            disabled={gameState.selectedSticks.length === 0 || !!gameState.winner}
          >
            えらんだぼうをとる
          </button>
        </div>
        <div style={styles.hintButtonContainer}>
          <button
            style={{...styles.button, ...styles.hintButton}}
            onClick={handleToggleHint}
            data-testid="hint-button"
          >
            ヒント: {gameState.isHintVisible ? 'ON' : 'OFF'}
          </button>
        </div>
        {showModal && (
          <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
            <div style={styles.gameOverModal}>
              <h2 style={styles.gameOverTitle}>けっか</h2>
              <p style={styles.winnerText}>かったのは {gameState.winner}！</p>
              <p style={styles.reasonText}>({gameState.currentPlayer}がさいごのぼうをとったよ)</p>
              <div style={styles.modalButtons}>
                <button data-testid="play-again-button" style={styles.button} onClick={handlePlayAgain}>もういっかい</button>
                <button style={styles.button} onClick={handleBackToTitle}>タイトルにもどる</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return difficulty ? renderGameScreen() : renderDifficultyScreen();
};

export default StickTakingGame;
