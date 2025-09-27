import React, { memo, useCallback } from 'react';
import { useDotsAndBoxes, type DotsAndBoxesController } from './useDotsAndBoxes';
export { useDotsAndBoxes } from './useDotsAndBoxes';
import { styles } from './styles';
import type { Difficulty, GameState, Player } from './core';
import { Button } from '@/app/components/ui/Button';

const DOT_SIZE = 12;
const CELL_SIZE = 60;

interface DotsAndBoxesGameProps {
  controller?: DotsAndBoxesController;
}

const renderDots = (rows: number, cols: number) => {
  const dots = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      dots.push(
        <div
          key={`dot-${r}-${c}`}
          style={{
            ...styles.dot,
            position: 'absolute',
            top: r * CELL_SIZE - DOT_SIZE / 2,
            left: c * CELL_SIZE - DOT_SIZE / 2,
          }}
        />
      );
    }
  }
  return dots;
};

const getLineStyle = (line: GameState['hLines'][0][0]) => {
  const owner = line.preview || line.owner;
  return {
    ...styles.line,
    ...(owner && styles.lineOwned),
    ...(owner === 'player1' && styles.line_player1),
    ...(owner === 'player2' && styles.line_player2),
    ...(line.preview && styles.line_preview),
  };
};

const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  controller: externalController,
}) => {
  const internalController = useDotsAndBoxes();
  const { gameState, setDifficulty, selectLine, setPreview } =
    externalController || internalController;

  const handleLineClick = useCallback((r: number, c: number, type: 'h' | 'v') => {
    const line = type === 'h' ? gameState.hLines[r][c] : gameState.vLines[r][c];
    if (line.owner) return;

    if (gameState.hintsEnabled) {
      if (line.preview) {
        selectLine(r, c, type);
        setPreview(null, null, null);
      } else {
        setPreview(r, c, type);
      }
    } else {
      selectLine(r, c, type);
    }
  }, [gameState, selectLine, setPreview]);

  const boardWidth = gameState.cols * CELL_SIZE;
  const boardHeight = gameState.rows * CELL_SIZE;

  const getRemainingLines = useCallback((box_r: number, box_c: number) => {
    const { hLines, vLines } = gameState;
    let count = 4;
    if (hLines[box_r][box_c].owner || hLines[box_r][box_c].preview) count--;
    if (hLines[box_r + 1][box_c].owner || hLines[box_r + 1][box_c].preview) count--;
    if (vLines[box_r][box_c].owner || vLines[box_r][box_c].preview) count--;
    if (vLines[box_r][box_c + 1].owner || vLines[box_r][box_c + 1].preview) count--;
    return count;
  }, [gameState]);

  if (gameState.gameStatus === 'waiting') {
    return (
      <div style={styles.difficultySelector}>
        <Button onClick={() => setDifficulty('easy')} size="large">かんたん</Button>
        <Button onClick={() => setDifficulty('normal')} size="large">ふつう</Button>
        <Button onClick={() => setDifficulty('hard')} size="large">むずかしい</Button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.board, width: boardWidth, height: boardHeight }}>
        {renderDots(gameState.rows, gameState.cols)}
        {gameState.boxes.map((row, r) =>
          row.map((box, c) => {
            const owner = box.preview || box.owner;
            const boxStyle = {
              ...styles.box,
              top: r * CELL_SIZE,
              left: c * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              ...(owner === 'player1' ? styles.box_player1 : {}),
              ...(owner === 'player2' ? styles.box_player2 : {}),
              ...(box.preview === 'player1' ? styles.previewHighlight_player1 : {}),
              ...(box.preview === 'player2' ? styles.previewHighlight_player2 : {}),
            };
            const hintNumberStyle = {
                ...styles.hintNumber,
                ...(box.preview === 'player1' && styles.hintNumber_preview_player1),
                ...(box.preview === 'player2' && styles.hintNumber_preview_player2),
            };

            return (
              <div key={`box-${r}-${c}`} style={boxStyle}>
                {gameState.hintsEnabled && !box.owner && (
                  <span style={hintNumberStyle}>
                    {getRemainingLines(r, c)}
                  </span>
                )}
              </div>
            );
          })
        )}
        {gameState.hLines.map((row, r) =>
          row.map((line, c) => (
            <div
              key={`h-line-${r}-${c}`}
              data-testid={`h-line-${r}-${c}`}
              style={{ ...getLineStyle(line), ...styles.hLine, top: r * CELL_SIZE - 4, left: c * CELL_SIZE, width: CELL_SIZE }}
              onClick={() => handleLineClick(r, c, 'h')}
            />
          ))
        )}
        {gameState.vLines.map((row, r) =>
          row.map((line, c) => (
            <div
              key={`v-line-${r}-${c}`}
              data-testid={`v-line-${r}-${c}`}
              style={{ ...getLineStyle(line), ...styles.vLine, top: r * CELL_SIZE, left: c * CELL_SIZE - 4, height: CELL_SIZE }}
              onClick={() => handleLineClick(r, c, 'v')}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(DotsAndBoxesGame);