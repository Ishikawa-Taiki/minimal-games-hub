"use client";

import React, { useState, useEffect, memo } from 'react';
import { Stick, Difficulty } from './core';
import { useStickTaking, StickTakingController } from './useStickTaking';
import { styles } from './styles';
import { Button, PositiveButton, SelectableButton } from '../../app/components/ui';

interface StickTakingGameProps {
  controller?: StickTakingController;
}

const StickTakingGame = ({ controller: externalController }: StickTakingGameProps) => {
  const internalController = useStickTaking();
  const controller = externalController || internalController;

  const { gameState, selectStick, takeSticks, startGame } = controller;

  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);

  useEffect(() => {
    if (gameState?.winner) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [gameState?.winner]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    startGame(selectedDifficulty);
  };

  const handleStickInteractionStart = (rowIndex: number, stickId: number) => {
    setIsDragging(true);
    const stick = gameState?.rows?.[rowIndex]?.find(s => s.id === stickId);
    if (!stick || stick.isTaken) return;

    const isSelected = gameState?.selectedSticks?.some(s => s.row === rowIndex && s.stickId === stickId);
    const currentDragAction = isSelected ? 'deselect' : 'select';
    setDragAction(currentDragAction);
    selectStick(rowIndex, stickId);
  };

  const handleStickInteractionMove = (rowIndex: number, stickId: number) => {
    if (isDragging && gameState?.rows) {
      const stick = gameState.rows[rowIndex]?.find(s => s.id === stickId);
      if (!stick || stick.isTaken) return;

      const isSelected = gameState.selectedSticks.some(s => s.row === rowIndex && s.stickId === stickId);

      if (dragAction === 'select' && !isSelected) {
        selectStick(rowIndex, stickId);
      } else if (dragAction === 'deselect' && isSelected) {
        selectStick(rowIndex, stickId);
      }
    }
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  const handlePlayAgain = () => {
    setShowModal(false);
    controller.resetGame();
  };

  const renderDifficultyScreen = () => (
    <div style={styles.container}>
      <h1 style={styles.title}>ぼうけしゲーム</h1>
      <h2 style={styles.subtitle}>むずかしさをえらんでね</h2>
      <div style={styles.difficultyButtons}>
        <Button size="large" onClick={() => handleDifficultySelect('easy')}>かんたん (3だん)</Button>
        <Button size="large" onClick={() => handleDifficultySelect('normal')}>ふつう (5だん)</Button>
        <Button size="large" onClick={() => handleDifficultySelect('hard')}>むずかしい (7だん)</Button>
      </div>
    </div>
  );

  const renderStick = (stick: Stick, rowIndex: number) => {
    const isSelected = gameState?.selectedSticks?.some(s => s.row === rowIndex && s.stickId === stick.id);
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
    if (!gameState || !gameState.rows) return null;

    return (
      <div style={styles.container} onMouseUp={handleInteractionEnd} onTouchEnd={handleInteractionEnd}>
        <div style={styles.board}>
          {gameState.rows.map((row, rowIndex) => (
            <div key={rowIndex} data-testid={`row-${rowIndex}`} style={styles.row}>
              {row.map((stick) => renderStick(stick, rowIndex))}
            </div>
          ))}
        </div>
        <div style={styles.controls}>
          <SelectableButton
            onPress={controller.toggleHints}
            selected={controller.hintState.level !== 'off'}
          >
            ヒント
          </SelectableButton>
          <PositiveButton
            size="large"
            onClick={takeSticks}
            disabled={!gameState.selectedSticks || gameState.selectedSticks.length === 0 || !!gameState.winner}
          >
            えらんだぼうをとる
          </PositiveButton>
          <Button onClick={controller.resetGame}>リセット</Button>
        </div>
        {showModal && (
          <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
            <div style={styles.gameOverModal}>
              <h2 style={styles.gameOverTitle}>けっか</h2>
              <p style={styles.winnerText}>{controller.getDisplayStatus()}</p>
              <p style={styles.reasonText}>({gameState.currentPlayer}がさいごのぼうをとったよ)</p>
              <div style={styles.modalButtons}>
                <PositiveButton
                  size="large"
                  data-testid="play-again-button"
                  onClick={handlePlayAgain}
                >
                  もういっかい
                </PositiveButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (gameState.status === 'waiting') {
    return renderDifficultyScreen();
  }

  return renderGameScreen();
};

export { useStickTaking };
export default StickTakingGame;
