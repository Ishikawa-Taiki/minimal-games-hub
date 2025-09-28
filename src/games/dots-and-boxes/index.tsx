import React, { memo, useState, useMemo } from 'react';
import { useDotsAndBoxes, type DotsAndBoxesController } from './useDotsAndBoxes';
import { styles } from './styles';
import { Button } from '@/app/components/ui/Button';
import { GameStateDisplay } from '@/app/components/GameStateDisplay';
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

const isAdjacentPreviewBox = (r: number, c: number, preview: Preview | null) => {
  if (!preview) return false;
  return preview.adjacentBoxes.some((box) => box.r === r && box.c === c);
};

const isCompletedPreviewBox = (r: number, c: number, preview: Preview | null) => {
  if (!preview) return false;
  return preview.completedBoxes.some((box) => box.r === r && box.c === c);
};

// --- Sub-components ---
const ScoreBoard = memo(function ScoreBoard({
  scores,
  getPlayerDisplayName,
}: {
  scores: { player1: number; player2: number };
  getPlayerDisplayName: (player: Player) => string;
}) {
  return (
    <div style={styles.scoreBoard}>
      <div style={{ ...styles.scoreItem, ...styles.score_player1 }}>
        <span>{getPlayerDisplayName('player1')}: </span>
        <span data-testid="score-value-player1">{scores.player1}</span>
      </div>
      <div style={{ ...styles.scoreItem, ...styles.score_player2 }}>
        <span>{getPlayerDisplayName('player2')}: </span>
        <span data-testid="score-value-player2">{scores.player2}</span>
      </div>
    </div>
  );
});

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
  const isAdjacent = isAdjacentPreviewBox(r, c, preview);
  const isCompleted = isCompletedPreviewBox(r, c, preview);

  const boxStyle = useMemo(() => {
    const baseStyle = {
      ...styles.box,
      gridRow: 2 * r + 2,
      gridColumn: 2 * c + 2,
    };
    if (owner) {
      const playerBoxStyle = owner === 'player1' ? styles.box_player1 : styles.box_player2;
      return { ...baseStyle, ...playerBoxStyle };
    }
    if (isCompleted) { // 背景ハイライトは完成するボックスのみ
      const playerPreviewStyle =
        currentPlayer === 'player1'
          ? styles.previewHighlight_player1
          : styles.previewHighlight_player2;
      return { ...baseStyle, ...playerPreviewStyle };
    }
    return baseStyle;
  }, [owner, isCompleted, currentPlayer, r, c]);

  const hintStyle = useMemo(() => {
    if (isAdjacent) { // 数字のプレビューは隣接するすべてのボックス
      const playerPreviewStyle =
        currentPlayer === 'player1'
          ? styles.hintNumber_preview_player1
          : styles.hintNumber_preview_player2;
      return { ...styles.hintNumber, ...playerPreviewStyle };
    }
    return styles.hintNumber;
  }, [isAdjacent, currentPlayer]);

  const displayCount = isAdjacent ? remainingCount - 1 : remainingCount;

  return (
    <div style={boxStyle} data-testid={`box-${r}-${c}`}>
      {displayCount > 0 && <div style={hintStyle}>{displayCount}</div>}
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

  const boardStyle = useMemo(() => {
    const DOT_SIZE = 12;
    const CELL_SIZE = 50;

    const colsDef = Array.from({ length: cols * 2 + 1 })
      .map((_, i) => (i % 2 === 0 ? `${DOT_SIZE}px` : `${CELL_SIZE}px`))
      .join(' ');
    const rowsDef = Array.from({ length: rows * 2 + 1 })
      .map((_, i) => (i % 2 === 0 ? `${DOT_SIZE}px` : `${CELL_SIZE}px`))
      .join(' ');

    return {
      ...styles.board,
      gridTemplateRows: rowsDef,
      gridTemplateColumns: colsDef,
    };
  }, [rows, cols]);

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
      <GameStateDisplay gameController={controller} />
      <ScoreBoard
        scores={controller.gameState.scores}
        getPlayerDisplayName={controller.getPlayerDisplayName}
      />
      <Board controller={controller} />
    </div>
  );
};

const MemoizedDotsAndBoxesGame = memo(DotsAndBoxesGame);
MemoizedDotsAndBoxesGame.displayName = 'DotsAndBoxesGame';

export default MemoizedDotsAndBoxesGame;
export { useDotsAndBoxes, useDotsAndBoxes as useGameController, type DotsAndBoxesController };