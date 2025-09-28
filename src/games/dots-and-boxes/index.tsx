import React, { memo, useMemo } from 'react';
import { useDotsAndBoxes, type DotsAndBoxesController } from './useDotsAndBoxes';
export { useDotsAndBoxes } from './useDotsAndBoxes';
import { styles } from './styles';
import { Button } from '@/app/components/ui/Button';
import type { GameState, Line, Box, Player } from './core';

interface DotsAndBoxesGameProps {
  controller?: DotsAndBoxesController;
}

const CELL_SIZE = 50; // size of each box
const DOT_SIZE = 12;
const LINE_THICKNESS = 8;

const getLineStyle = (line: Line, baseStyle: React.CSSProperties): React.CSSProperties => {
  let style = { ...baseStyle };
  if (line.owner) {
    style = { ...style, ...styles.lineOwned };
    if (line.owner === 'player1') {
      style = { ...style, ...styles.line_player1 };
    } else {
      style = { ...style, ...styles.line_player2 };
    }
  }
  if (line.preview) {
    style = { ...style, ...styles.line_preview };
    if (line.preview === 'player1') {
      style = { ...style, ...styles.line_player1 };
    } else {
      style = { ...style, ...styles.line_player2 };
    }
  }
  return style;
};

const getBoxStyle = (box: Box): React.CSSProperties => {
  let style: React.CSSProperties = styles.box;
  if (box.owner) {
    style = box.owner === 'player1' ? { ...style, ...styles.box_player1 } : { ...style, ...styles.box_player2 };
  }
  if (box.preview) {
     style = box.preview === 'player1' ? { ...style, ...styles.previewHighlight_player1 } : { ...style, ...styles.previewHighlight_player2 };
  }
  return style;
};

const Board = ({ gameState, selectLine }: { gameState: GameState; selectLine: (r: number, c: number, type: 'h' | 'v') => void }) => {
  const { rows, cols, hLines, vLines, boxes } = gameState;

  const boardWidth = cols * CELL_SIZE + (cols + 1) * DOT_SIZE;
  const boardHeight = rows * CELL_SIZE + (rows + 1) * DOT_SIZE;

  const boardStyle = useMemo(() => ({
    ...styles.board,
    gridTemplateColumns: `repeat(${cols + 1}, ${DOT_SIZE}px)`,
    gridTemplateRows: `repeat(${rows + 1}, ${DOT_SIZE}px)`,
    gridGap: `${CELL_SIZE}px`,
    width: `${boardWidth}px`,
    height: `${boardHeight}px`,
  }), [rows, cols, boardWidth, boardHeight]);

  return (
    <div style={boardStyle} data-testid="game-board">
      {/* Render Dots */}
      {Array.from({ length: (rows + 1) * (cols + 1) }).map((_, i) => (
        <div key={`dot-${i}`} style={styles.dot} />
      ))}

      {/* Render Horizontal Lines */}
      {hLines.map((row, r) =>
        row.map((line, c) => (
          <div
            key={`h-line-${r}-${c}`}
            data-testid={`h-line-${r}-${c}`}
            style={getLineStyle(line, {
              ...styles.line,
              ...styles.hLine,
              width: `${CELL_SIZE}px`,
              left: `${c * (CELL_SIZE + DOT_SIZE) + DOT_SIZE}px`,
              top: `${r * (CELL_SIZE + DOT_SIZE) + (DOT_SIZE - LINE_THICKNESS) / 2}px`,
            })}
            onClick={() => !line.owner && selectLine(r, c, 'h')}
          />
        ))
      )}

      {/* Render Vertical Lines */}
      {vLines.map((row, r) =>
        row.map((line, c) => (
          <div
            key={`v-line-${r}-${c}`}
            data-testid={`v-line-${r}-${c}`}
            style={getLineStyle(line, {
              ...styles.line,
              ...styles.vLine,
              height: `${CELL_SIZE}px`,
              top: `${r * (CELL_SIZE + DOT_SIZE) + DOT_SIZE}px`,
              left: `${c * (CELL_SIZE + DOT_SIZE) + (DOT_SIZE - LINE_THICKNESS) / 2}px`,
            })}
            onClick={() => !line.owner && selectLine(r, c, 'v')}
          />
        ))
      )}

      {/* Render Boxes */}
      {boxes.map((row, r) =>
        row.map((box, c) => (
          <div
            key={`box-${r}-${c}`}
            data-testid={`box-${r}-${c}`}
            style={{
              ...getBoxStyle(box),
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              top: `${r * (CELL_SIZE + DOT_SIZE) + DOT_SIZE}px`,
              left: `${c * (CELL_SIZE + DOT_SIZE) + DOT_SIZE}px`,
            }}
          />
        ))
      )}
    </div>
  );
};


const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  controller: externalController,
}) => {
  const internalController = useDotsAndBoxes();
  const controller = externalController || internalController;
  const { gameState, setDifficulty, selectLine } = controller;

  if (gameState.gameStatus === 'waiting') {
    return (
      <div style={styles.difficultySelector}>
        <Button onClick={() => setDifficulty('easy')} size="large" data-testid="difficulty-easy">かんたん</Button>
        <Button onClick={() => setDifficulty('normal')} size="large" data-testid="difficulty-normal">ふつう</Button>
        <Button onClick={() => setDifficulty('hard')} size="large" data-testid="difficulty-hard">むずかしい</Button>
      </div>
    );
  }

  const getPlayerName = (player: Player) => {
    return player === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
  };

  return (
    <div style={styles.container}>
      <div style={styles.scoreBoard}>
        <div style={{...styles.scoreItem, ...styles.score_player1}}>
            <span>{getPlayerName('player1')}: </span>
            <span data-testid="score-value-player1">{gameState.scores.player1}</span>
        </div>
        <div style={{...styles.scoreItem, ...styles.score_player2}}>
            <span>{getPlayerName('player2')}: </span>
            <span data-testid="score-value-player2">{gameState.scores.player2}</span>
        </div>
      </div>

      <Board gameState={gameState} selectLine={selectLine} />

      <div style={styles.turnDisplay} data-testid="game-state-display">
        <p>「{getPlayerName(gameState.currentPlayer)}」のばん</p>
      </div>
    </div>
  );
};

export default memo(DotsAndBoxesGame);