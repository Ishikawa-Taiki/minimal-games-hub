import React, { memo, useState, useMemo } from 'react';
import { useDotsAndBoxes, type DotsAndBoxesController } from './useDotsAndBoxes';
import { styles } from './styles';
import { Button } from '@/app/components/ui/Button';
import type { Player, Preview } from './core';

// --- Prop Types ---
interface DotsAndBoxesGameProps {
  controller?: DotsAndBoxesController;
}

// --- Style Helper ---
const isPreviewLine = (
  r: number,
  c: number,
  type: 'h' | 'v',
  preview: Preview | null
) => {
  if (!preview) return false;
  return (
    preview.line.r === r &&
    preview.line.c === c &&
    preview.line.type === type
  );
};

const isPreviewBox = (r: number, c: number, preview: Preview | null) => {
  if (!preview) return false;
  return preview.boxes.some((box) => box.r === r && box.c === c);
};

// --- Sub-components ---
const Dot = memo(function Dot({ r, c }: { r: number; c: number }) {
  return (
    <div
      style={{ ...styles.dot, gridRow: r, gridColumn: c }}
      data-testid={`dot-${r}-${c}`}
    />
  );
});

const Line = memo(function Line({
  r,
  c,
  type,
  owner,
  preview,
  currentPlayer,
  onSelect,
}: {
  r: number;
  c: number;
  type: 'h' | 'v';
  owner: Player | null;
  preview: Preview | null;
  currentPlayer: Player;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isPreview = isPreviewLine(r, c, type, preview);

  const lineStyle = useMemo(() => {
    let style = {
      ...styles.line,
      gridRow: type === 'h' ? 2 * r + 1 : 2 * r + 2,
      gridColumn: type === 'h' ? 2 * c + 2 : 2 * c + 1,
    };
    if (owner) {
      style = { ...style, ...styles.lineOwned };
      style =
        owner === 'player1'
          ? { ...style, ...styles.line_player1 }
          : { ...style, ...styles.line_player2 };
    } else {
      if (isHovered) style = { ...style, ...styles.lineHover };
      if (isPreview) {
        style = { ...style, ...styles.line_preview };
        style =
          currentPlayer === 'player1'
            ? { ...style, ...styles.line_player1 }
            : { ...style, ...styles.line_player2 };
      }
    }
    return style;
  }, [owner, isHovered, isPreview, currentPlayer, r, c, type]);

  return (
    <div
      style={lineStyle}
      onClick={owner ? undefined : onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`${type}-line-${r}-${c}`}
    />
  );
});

const Box = memo(function Box({
  r,
  c,
  owner,
  preview,
  currentPlayer,
  remainingCount,
}: {
  r: number;
  c: number;
  owner: Player | null;
  preview: Preview | null;
  currentPlayer: Player;
  remainingCount: number;
}) {
  const isPreview = isPreviewBox(r, c, preview);

  const boxStyle = useMemo(() => {
    let style = {
      ...styles.box,
      gridRow: 2 * r + 2,
      gridColumn: 2 * c + 2,
    };
    if (owner) {
      return owner === 'player1'
        ? { ...style, ...styles.box_player1 }
        : { ...style, ...styles.box_player2 };
    }
    if (isPreview) {
      style = { ...style, ...styles.previewHighlight };
      return currentPlayer === 'player1'
        ? { ...style, ...styles.previewHighlight_player1 }
        : { ...style, ...styles.previewHighlight_player2 };
    }
    return style;
  }, [owner, isPreview, currentPlayer, r, c]);

  const hintStyle = useMemo(() => {
    let style = { ...styles.hintNumber };
    if (isPreview) {
      style = { ...style, ...styles.hintNumber_preview };
      return currentPlayer === 'player1'
        ? { ...style, ...styles.hintNumber_preview_player1 }
        : { ...style, ...styles.hintNumber_preview_player2 };
    }
    return style;
  }, [isPreview, currentPlayer]);

  return (
    <div style={boxStyle} data-testid={`box-${r}-${c}`}>
      {remainingCount > 0 && <div style={hintStyle}>{remainingCount}</div>}
    </div>
  );
});

const Board = memo(function Board({
  controller,
}: {
  controller: DotsAndBoxesController;
}) {
  const { gameState, selectLine, remainingLinesCounts, preview } = controller;
  const { rows, cols, hLines, vLines, boxes, currentPlayer } = gameState;

  const boardStyle = useMemo(
    () => ({
      ...styles.board,
      gridTemplateRows: `repeat(${rows * 2 + 1}, auto)`,
      gridTemplateColumns: `repeat(${cols * 2 + 1}, auto)`,
      aspectRatio: `${cols * 2 + 1} / ${rows * 2 + 1}`,
    }),
    [rows, cols]
  );

  return (
    <div style={boardStyle} data-testid="game-board">
      {/* Dots */}
      {Array.from({ length: (rows + 1) * (cols + 1) }).map((_, i) => {
        const r = Math.floor(i / (cols + 1));
        const c = i % (cols + 1);
        return <Dot key={`dot-${r}-${c}`} r={2 * r + 1} c={2 * c + 1} />;
      })}

      {/* Horizontal Lines */}
      {hLines.map((row, r) =>
        row.map((line, c) => (
          <Line
            key={`h-line-${r}-${c}`}
            r={r}
            c={c}
            type="h"
            owner={line.owner}
            preview={preview}
            currentPlayer={currentPlayer}
            onSelect={() => selectLine(r, c, 'h')}
          />
        ))
      )}

      {/* Vertical Lines */}
      {vLines.map((row, r) =>
        row.map((line, c) => (
          <Line
            key={`v-line-${r}-${c}`}
            r={r}
            c={c}
            type="v"
            owner={line.owner}
            preview={preview}
            currentPlayer={currentPlayer}
            onSelect={() => selectLine(r, c, 'v')}
          />
        ))
      )}

      {/* Boxes */}
      {boxes.map((row, r) =>
        row.map((box, c) => (
          <Box
            key={`box-${r}-${c}`}
            r={r}
            c={c}
            owner={box.owner}
            preview={preview}
            currentPlayer={currentPlayer}
            remainingCount={
              remainingLinesCounts[r]?.[c] > 0
                ? remainingLinesCounts[r][c]
                : 0
            }
          />
        ))
      )}
    </div>
  );
});

// --- Main Component ---
const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  controller: externalController,
}) => {
  const internalController = useDotsAndBoxes();
  const controller = externalController || internalController;
  const { gameState, setDifficulty } = controller;

  if (gameState.status === 'waiting') {
    return (
      <div style={styles.difficultySelector}>
        <Button onClick={() => setDifficulty('easy')} size="large">
          かんたん
        </Button>
        <Button onClick={() => setDifficulty('normal')} size="large">
          ふつう
        </Button>
        <Button onClick={() => setDifficulty('hard')} size="large">
          むずかしい
        </Button>
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>
      <Board controller={controller} />
    </div>
  );
};

const MemoizedDotsAndBoxesGame = memo(DotsAndBoxesGame);
MemoizedDotsAndBoxesGame.displayName = 'DotsAndBoxesGame';

export default MemoizedDotsAndBoxesGame;
export { useDotsAndBoxes, useDotsAndBoxes as useGameController, type DotsAndBoxesController };