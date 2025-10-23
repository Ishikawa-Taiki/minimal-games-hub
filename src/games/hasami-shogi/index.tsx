"use client";

import React, { CSSProperties, useEffect, useState } from 'react';
import { Player, WinCondition, Board } from './core';
import { useHasamiShogi, HasamiShogiController } from './useHasamiShogi';
import { PositiveButton } from '@/core/components/ui';
import { styles } from './styles';
import { useDialog } from '@/core/components/ui/DialogProvider';

const CELL_SIZE = 40;
const GAP = 2;
const BOARD_PADDING = 10; // board style's padding
const ANIMATION_DURATION = 300;

const getPosition = (r: number, c: number) => ({
  top: BOARD_PADDING + r * (CELL_SIZE + GAP),
  left: BOARD_PADDING + c * (CELL_SIZE + GAP),
});

const PieceView: React.FC<{
  player: Player;
  isCaptured: boolean;
  isMoving: boolean;
  top: number;
  left: number;
  id: string;
}> = ({ player, isCaptured, isMoving, top, left, id }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    transform: player === 'PLAYER2' ? 'rotate(180deg)' : 'none',
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };

  const containerStyle: CSSProperties = {
    ...styles.pieceContainer,
    top,
    left,
    ...(isCaptured && styles.captured),
    ...(isMoving && styles.moving),
  };

  const char = player === 'PLAYER1' ? '歩' : 'と';
  return (
    <div style={containerStyle} data-testid={`piece-${player}-${id}`}>
      <div style={pieceStyle}>{char}</div>
    </div>
  );
};

const PreGameScreen = ({ onSelect }: { onSelect: (condition: WinCondition) => void }) => (
  <div style={styles.preGameContainer} data-testid="pre-game-screen">
    <h2 style={styles.preGameTitle}>勝利条件を選んでください</h2>
    <div style={styles.preGameButtonContainer}>
      <PositiveButton onClick={() => onSelect('standard')} data-testid="win-cond-standard">
        5こ とるか 3こ さをつける
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('five_captures')} data-testid="win-cond-five_captures">
        5こ さきどり
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('total_capture')} data-testid="win-cond-total">
        ぜんぶとる
      </PositiveButton>
    </div>
  </div>
);

interface HasamiShogiProps {
  controller?: HasamiShogiController;
}

interface PieceState {
  id: string;
  player: Player;
  r: number;
  c: number;
  isCaptured: boolean;
}

const generateInitialPieces = (board: Board): PieceState[] => {
  const pieces: PieceState[] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        // Use the initial position as a unique and stable ID
        const id = `piece-${r}-${c}`;
        pieces.push({ id, player: cell, r, c, isCaptured: false });
      }
    });
  });
  return pieces;
};

const HasamiShogi = ({ controller: externalController }: HasamiShogiProps = {}) => {
  const internalController = useHasamiShogi();
  const controller = externalController || internalController;

interface TestWindow extends Window {
  gameController?: HasamiShogiController;
}

  // E2Eテストのためにコントローラーをwindowに公開
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      (window as TestWindow).gameController = controller;
    }
  }, [controller]);

  const {
    gameState,
    makeMove,
    setWinCondition,
    getSelectedPiece,
    getValidMoves,
    getPotentialCaptures,
    hintState,
    resetGame,
    onAnimationEnd,
  } = controller;

  const [pieces, setPieces] = useState<PieceState[]>(() =>
    generateInitialPieces(gameState.board)
  );
  // アニメーション用useEffectで最新のpiecesにアクセスするためのref
  const piecesRef = React.useRef(pieces);
  piecesRef.current = pieces;

  const { alert } = useDialog();

  useEffect(() => {
    if (gameState.status === 'waiting') {
      setPieces(generateInitialPieces(gameState.board));
    }
  }, [gameState.status, gameState.board]);

  useEffect(() => {
    if (gameState.winner) {
      const winnerText = gameState.winner === 'PLAYER1' ? '「歩」チーム' : '「と」チーム';
      const capturedCount =
        gameState.winner === 'PLAYER1'
          ? gameState.capturedPieces.PLAYER2
          : gameState.capturedPieces.PLAYER1;
      alert({
        title: `${winnerText}のかち！`,
        message: `${winnerText}が${capturedCount}こコマをとったよ！`,
      });
    }
  }, [gameState.winner, gameState.capturedPieces, alert, resetGame]);

  useEffect(() => {
    const { lastMove, justCapturedPieces, board } = gameState;

    // ボードリセットやアニメーション完了後の状態同期
    if (!lastMove && (!justCapturedPieces || justCapturedPieces.length === 0)) {
      const boardPiecesCount = board.flat().filter(Boolean).length;
      // UIとロジックのコマ数が異なる場合、UIを同期
      if (boardPiecesCount !== piecesRef.current.length) {
        setPieces(generateInitialPieces(board));
        return; // 同期後はアニメーション不要
      }
    }

    // キャプチャまたは移動アニメーションの実行
    if ((justCapturedPieces && justCapturedPieces.length > 0) || lastMove) {
      const capturedIds = new Set<string>();
      if (justCapturedPieces && justCapturedPieces.length > 0) {
        const capturedPositions = justCapturedPieces.map(p => `${p[0]},${p[1]}`);
        piecesRef.current.forEach(p => {
          if (!p.isCaptured && capturedPositions.includes(`${p.r},${p.c}`)) {
            capturedIds.add(p.id);
          }
        });
      }

      // アニメーション用のstate更新
      setPieces(prevPieces => {
        let tempPieces = [...prevPieces];
        let changed = false;

        if (capturedIds.size > 0) {
          changed = true;
          tempPieces = tempPieces.map(p =>
            capturedIds.has(p.id) ? { ...p, isCaptured: true } : p
          );
        }

        if (lastMove) {
          const movingPieceIndex = tempPieces.findIndex(
            p => p.r === lastMove.from.r && p.c === lastMove.from.c && !p.isCaptured
          );

          if (movingPieceIndex !== -1) {
            if (!changed) tempPieces = [...tempPieces];
            const newPiece = { ...tempPieces[movingPieceIndex], r: lastMove.to.r, c: lastMove.to.c };
            tempPieces.splice(movingPieceIndex, 1, newPiece);
            changed = true;
          }
        }
        return changed ? tempPieces : prevPieces;
      });

      // アニメーション完了後のクリーンアップ
      setTimeout(() => {
        if (capturedIds.size > 0) {
          // isCapturedフラグよりIDでのフィルタリングが安全
          setPieces(currentPieces => currentPieces.filter(p => !capturedIds.has(p.id)));
        }
        onAnimationEnd();
      }, ANIMATION_DURATION);
    }
  }, [gameState, onAnimationEnd]);


  const onCellClick = (r: number, c: number) => {
    makeMove(r, c);
  };

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell, position: 'relative' };
    const selectedPiece = getSelectedPiece();
    const validMoves = getValidMoves();
    const potentialCaptures = getPotentialCaptures();
    const moveKey = `${r},${c}`;

    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
        style.boxShadow = 'inset 0 0 0 3px gold';
    }

    if (hintState.enabled && selectedPiece) {
      const moveData = validMoves.get(moveKey);
      if (moveData) {
        style.backgroundColor = moveData.isUnsafe ? '#feb2b2' : '#9ae6b4';
      }
      if (potentialCaptures.some(([capR, capC]) => capR === r && capC === c)) {
        style.backgroundColor = '#a4cafe';
      }
    }

    return style;
  };

  const gameContent = (
    <>
      <div style={styles.scoreBoard}>
        <div style={styles.scoreItem}>
          <span style={styles.scorePiece}>歩</span>
          <span style={styles.capturedPiece} data-testid="score-value-PLAYER2">
            とったかず: {gameState.capturedPieces.PLAYER2}
          </span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scorePiece}>と</span>
          <span style={styles.capturedPiece} data-testid="score-value-PLAYER1">
            とったかず: {gameState.capturedPieces.PLAYER1}
          </span>
        </div>
      </div>
      <div
        style={styles.board}
        data-testid="board-container"
        data-is-animating={String(gameState.isAnimating)}
      >
        {gameState.board.map((row, r) =>
          row.map((_, c) => (
            <div
              key={`${r}-${c}`}
              data-testid={`cell-${r}-${c}`}
              style={getCellStyle(r, c)}
              onClick={() => onCellClick(r, c)}
            />
          ))
        )}
        {pieces.map(p => {
          const { top, left } = getPosition(p.r, p.c);
          return (
            <PieceView
              key={p.id}
              id={p.id}
              player={p.player}
              isCaptured={p.isCaptured}
              isMoving={false} // TODO: 将来的に移動中アニメーションを強化する
              top={top}
              left={left}
            />
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {gameState.status === 'waiting' ? (
        <PreGameScreen onSelect={setWinCondition} />
      ) : (
        gameContent
      )}
    </>
  );
};

export { useHasamiShogi };
export default HasamiShogi;