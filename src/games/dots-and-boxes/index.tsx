import React, { memo, useState, useMemo } from 'react';
import { useDotsAndBoxes, DotsAndBoxesController } from './useDotsAndBoxes';
import { Difficulty } from '@/core/types/game';
import styles, { CELL_SIZE, DOT_SIZE, LINE_THICKNESS } from './styles';
import { PositiveButton } from '@/app/components/ui/PositiveButton';
import { DrawLinePayload } from './core';

export { useDotsAndBoxes };

interface DotsAndBoxesProps {
  controller?: DotsAndBoxesController;
}

const DotsAndBoxesGame: React.FC<DotsAndBoxesProps> = ({
  controller: externalController,
}) => {
  const internalController = useDotsAndBoxes();
  const controller = externalController || internalController;
  const { gameState, drawLine, setDifficulty } = controller;
  const { boardSize, lines, boxes, currentPlayer, hintsEnabled } = gameState;

  const [hoveredLine, setHoveredLine] = useState<DrawLinePayload | null>(null);
  const [previewedLine, setPreviewedLine] = useState<DrawLinePayload | null>(
    null
  );

  const handleLineClick = (payload: DrawLinePayload) => {
    if (
      previewedLine &&
      previewedLine.lineType === payload.lineType &&
      previewedLine.row === payload.row &&
      previewedLine.col === payload.col
    ) {
      drawLine(payload);
      setPreviewedLine(null);
    } else {
      setPreviewedLine(payload);
    }
  };

  const boardWidth = boardSize.cols * (CELL_SIZE + LINE_THICKNESS) + DOT_SIZE - LINE_THICKNESS;
  const boardHeight = boardSize.rows * (CELL_SIZE + LINE_THICKNESS) + DOT_SIZE - LINE_THICKNESS;

  const gridStyle = useMemo(() => ({
    ...styles.board,
    gridTemplateRows: `repeat(${boardSize.rows + 1}, auto)`,
    gridTemplateColumns: `repeat(${boardSize.cols + 1}, auto)`,
    width: boardWidth,
    height: boardHeight,
  }), [boardSize, boardWidth, boardHeight]);

  const boxesContainerStyle = useMemo(() => ({
      ...styles.boxesContainer,
      gridTemplateRows: `repeat(${boardSize.rows}, ${CELL_SIZE}px)`,
      gridTemplateColumns: `repeat(${boardSize.cols}, ${CELL_SIZE}px)`,
      width: boardSize.cols * (CELL_SIZE + LINE_THICKNESS) - LINE_THICKNESS,
      height: boardSize.rows * (CELL_SIZE + LINE_THICKNESS) - LINE_THICKNESS,
      top: DOT_SIZE / 2,
      left: DOT_SIZE / 2,
    }), [boardSize]);


  if (gameState.status === 'waiting') {
    return (
      <div style={styles.difficultyContainer}>
        <h2 style={styles.difficultyTitle}>むずかしさをえらんでね</h2>
        <div style={styles.difficultyButtonContainer}>
          <PositiveButton onClick={() => setDifficulty('easy')} fullWidth>
            かんたん (2x2マス)
          </PositiveButton>
          <PositiveButton onClick={() => setDifficulty('normal')} fullWidth>
            ふつう (4x4マス)
          </PositiveButton>
          <PositiveButton onClick={() => setDifficulty('hard')} fullWidth>
            むずかしい (6x6マス)
          </PositiveButton>
        </div>
      </div>
    );
  }

  const getRemainingLines = (r: number, c: number) => {
    let count = 4;
    if (lines.horizontal[r][c]) count--;
    if (lines.horizontal[r + 1][c]) count--;
    if (lines.vertical[r][c]) count--;
    if (lines.vertical[r][c + 1]) count--;
    return count;
  };

  const getPreviewInfo = (r: number, c: number) => {
    const result: { boxStyle: React.CSSProperties, hintStyle: React.CSSProperties, isAffected: boolean, remainingLines: number } = { boxStyle: {}, hintStyle: {}, isAffected: false, remainingLines: getRemainingLines(r, c) };

    if (!hintsEnabled || !previewedLine || boxes[r][c] !== null) {
      return result;
    }

    const { lineType, row, col } = previewedLine;

    if (lineType === 'horizontal') {
      if ((row === r || row === r + 1) && col === c) {
        result.isAffected = true;
      }
    } else { // vertical
      if ((col === c || col === c + 1) && row === r) {
        result.isAffected = true;
      }
    }

    if (result.isAffected) {
      if (result.remainingLines === 1) {
        result.boxStyle = currentPlayer === 'PLAYER1' ? styles.player1PreviewBox : styles.player2PreviewBox;
      }
      result.hintStyle = currentPlayer === 'PLAYER1' ? styles.player1PreviewHintNumber : styles.player2PreviewHintNumber;
    }
    return result;
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.boardWrapper, width: boardWidth, height: boardHeight }}>
        {/* Boxes and Hints */}
        <div style={boxesContainerStyle}>
          {boxes.flat().map((boxOwner, i) => {
            const r = Math.floor(i / boardSize.cols);
            const c = i % boardSize.cols;
            const { boxStyle, hintStyle, isAffected, remainingLines } = getPreviewInfo(r,c);

            return (
              <div
                key={`box-${r}-${c}`}
                style={{
                  ...styles.box,
                  ...(boxOwner === 'PLAYER1' && styles.player1Box),
                  ...(boxOwner === 'PLAYER2' && styles.player2Box),
                  ...boxStyle,
                }}
              >
                {hintsEnabled && boxOwner === null && (
                  <span style={{...styles.hintNumber, ...hintStyle}}>
                     {isAffected && remainingLines === 1 ? 0 : remainingLines}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div style={gridStyle}>
          {Array.from({ length: (boardSize.rows + 1) * (boardSize.cols + 1) }).map(
            (_, i) => (
              <div key={`dot-${i}`} style={styles.dot} data-testid={`dot-${i}`} />
            )
          )}
        </div>

        {/* Lines */}
        <div style={styles.linesContainer}>
          {/* Horizontal Lines */}
          {lines.horizontal.map((row, r) =>
            row.map((lineOwner, c) => {
              const payload: DrawLinePayload = { lineType: 'horizontal', row: r, col: c };
              const isHovered =
                hoveredLine?.lineType === 'horizontal' &&
                hoveredLine?.row === r &&
                hoveredLine?.col === c;

              return (
                <div
                  key={`h-line-${r}-${c}`}
                  data-testid={`h-line-${r}-${c}`}
                  style={{
                    ...styles.line,
                    ...styles.hLine,
                    top: r * (CELL_SIZE + LINE_THICKNESS) - LINE_THICKNESS/2,
                    left: c * (CELL_SIZE + LINE_THICKNESS) + DOT_SIZE/2,
                    ...(!lineOwner && styles.lineClickable),
                    ...(isHovered && !lineOwner && styles.lineHover),
                    ...(lineOwner === 'PLAYER1' && styles.player1Line),
                    ...(lineOwner === 'PLAYER2' && styles.player2Line),
                  }}
                  onClick={() => !lineOwner && handleLineClick(payload)}
                  onMouseEnter={() => !lineOwner && setHoveredLine(payload)}
                  onMouseLeave={() => setHoveredLine(null)}
                />
              );
            })
          )}
          {/* Vertical Lines */}
          {lines.vertical.map((row, r) =>
            row.map((lineOwner, c) => {
              const payload: DrawLinePayload = { lineType: 'vertical', row: r, col: c };
               const isHovered =
                hoveredLine?.lineType === 'vertical' &&
                hoveredLine?.row === r &&
                hoveredLine?.col === c;

              return (
                <div
                  key={`v-line-${r}-${c}`}
                  data-testid={`v-line-${r}-${c}`}
                  style={{
                    ...styles.line,
                    ...styles.vLine,
                    top: r * (CELL_SIZE + LINE_THICKNESS) + DOT_SIZE/2,
                    left: c * (CELL_SIZE + LINE_THICKNESS) - LINE_THICKNESS/2,
                    ...(!lineOwner && styles.lineClickable),
                    ...(isHovered && !lineOwner && styles.lineHover),
                    ...(lineOwner === 'PLAYER1' && styles.player1Line),
                    ...(lineOwner === 'PLAYER2' && styles.player2Line),
                  }}
                  onClick={() => !lineOwner && handleLineClick(payload)}
                  onMouseEnter={() => !lineOwner && setHoveredLine(payload)}
                  onMouseLeave={() => setHoveredLine(null)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(DotsAndBoxesGame);