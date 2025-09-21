"use client";

import React, { useState, useMemo } from 'react';
import { Stick, Difficulty, Chunk } from './core';
import { useStickTaking, StickTakingController } from './useStickTaking';
import { styles } from './styles';
import { PositiveButton } from '@/app/components/ui';

// Define the structure for a visual group of sticks
type StickGroupInfo = {
  type: 'available' | 'taken';
  sticks: Stick[];
  originalIndices: number[];
  chunk?: Chunk;
};

interface StickTakingGameProps {
  controller?: StickTakingController;
}

const StickTakingGame = ({ controller: externalController }: StickTakingGameProps) => {
  const internalController = useStickTaking();
  const controller = externalController || internalController;

  const { gameState, selectStick, takeSticks, startGame, nimData, hintState } = controller;

  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);

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

  const renderDifficultyScreen = () => (
    <div style={styles.container}>
      <h1 style={styles.title}>ぼうけしゲーム</h1>
      <h2 style={styles.subtitle}>むずかしさをえらんでね</h2>
      <div style={styles.difficultyButtons}>
        <PositiveButton size="large" onClick={() => handleDifficultySelect('easy')}>かんたん (3だん)</PositiveButton>
        <PositiveButton size="large" onClick={() => handleDifficultySelect('normal')}>ふつう (5だん)</PositiveButton>
        <PositiveButton size="large" onClick={() => handleDifficultySelect('hard')}>むずかしい (7だん)</PositiveButton>
      </div>
    </div>
  );

  const renderStick = (stick: Stick, rowIndex: number, stickIndex: number) => {
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
        data-testid={`stick-${rowIndex}-${stickIndex}`}
        data-taken={stick.isTaken.toString()}
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
            const [, rowStr, stickIdStr] = element.getAttribute('data-testid')!.split('-');
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

  const processedRows = useMemo(() => {
    if (!gameState.rows) return [];
    return gameState.rows.map((row, rowIndex) => {
      const groups: StickGroupInfo[] = [];
      if (row.length === 0) return groups;

      const chunks = nimData.chunkLists[rowIndex] || [];
      let currentGroup: StickGroupInfo | null = null;

      row.forEach((stick, index) => {
        const type = stick.isTaken ? 'taken' : 'available';
        const chunk = chunks.find(c => index >= c.startIndex && index <= c.endIndex);

        if (!currentGroup || currentGroup.type !== type) {
          if (currentGroup) groups.push(currentGroup);
          currentGroup = { type, sticks: [], originalIndices: [], chunk };
        }

        currentGroup.sticks.push(stick);
        currentGroup.originalIndices.push(index);
      });

      if (currentGroup) groups.push(currentGroup);
      return groups;
    });
  }, [gameState.rows, nimData.chunkLists]);


  const renderGameScreen = () => {
    if (!gameState || !processedRows) return null;

    const isHintEnabled = hintState.enabled;

    return (
      <div style={styles.container} onMouseUp={handleInteractionEnd} onTouchEnd={handleInteractionEnd}>
        <div style={styles.board}>
          {processedRows.map((groups, rowIndex) => (
            <div key={rowIndex} data-testid={`row-${rowIndex}`} style={styles.row}>
              {groups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  data-testid={`group-${rowIndex}-${groupIndex}`}
                  style={{
                    ...styles.stickGroup,
                    ...(isHintEnabled && group.type === 'available' ? styles.hintBorder : {})
                  }}
                >
                  <div style={styles.stickGroupSticks}>
                    {group.sticks.map((stick, stickIndex) =>
                      renderStick(stick, rowIndex, group.originalIndices[stickIndex])
                    )}
                  </div>
                  <div style={{...styles.hintText, visibility: isHintEnabled ? 'visible' : 'hidden'}}>
                    {group.type === 'available' ? group.sticks.length : '-'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={styles.controls}>
          <PositiveButton
            size="large"
            onClick={takeSticks}
            disabled={!gameState.selectedSticks || gameState.selectedSticks.length === 0 || !!gameState.winner}
          >
            えらんだぼうをとる
          </PositiveButton>
        </div>
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
