"use client";

import React, { CSSProperties, useEffect } from 'react';
import {
  Player,
  WinCondition,
} from './core';
import { useHasamiShogi, HasamiShogiController } from './useHasamiShogi';
import { useResponsive } from '../../../hooks/useResponsive';
import { PositiveButton } from '../../../app/components/ui';
import { styles } from './styles';
import { useDialog } from '../../../app/components/ui/DialogProvider';

// Piece component for the game board
const Piece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    transform: player === 'PLAYER2' ? 'rotate(180deg)' : 'none',
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
};

const PreGameScreen = ({ onSelect }: { onSelect: (condition: WinCondition) => void }) => (
  <div style={styles.preGameContainer} data-testid="pre-game-screen">
    <h2 style={styles.preGameTitle}>勝利条件を選んでください</h2>
    <div style={styles.preGameButtonContainer}>
      <PositiveButton onClick={() => onSelect('standard')} data-testid="win-cond-standard">
        5こ とるか 3こ さをつける
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('five_captures')} data-testid="win-cond-five">
        5こ さきどり
      </PositiveButton>
      <PositiveButton onClick={() => onSelect('total_capture')} data-testid="win-cond-total">
        ぜんぶとる
      </PositiveButton>
    </div>
  </div>
);


// プロップスでコントローラーを受け取るバージョン
interface HasamiShogiProps {
  controller?: HasamiShogiController;
}

const HasamiShogi = ({ controller: externalController }: HasamiShogiProps = {}) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useHasamiShogi();
  const controller = externalController || internalController;
  
  const {
    gameState,
    makeMove,
    setWinCondition,
    getSelectedPiece,
    getValidMoves,
    getPotentialCaptures,
    hintState,
    resetGame,
  } = controller;

  const hintsEnabled = hintState.enabled;
  useResponsive();
  const { alert } = useDialog();

  useEffect(() => {
    if (gameState.winner) {
      const winnerText = gameState.winner === 'PLAYER1' ? 'プレイヤー1' : 'プレイヤー2';
      const capturedCount =
        gameState.winner === 'PLAYER1'
          ? gameState.capturedPieces.PLAYER2
          : gameState.capturedPieces.PLAYER1;
      alert({
        title: `${winnerText}のかち`,
        message: `${winnerText}が${capturedCount}こ駒をとったよ！`,
      }).then(() => {
        resetGame();
      });
    }
  }, [gameState.winner, gameState.capturedPieces, alert, resetGame]);

  const onCellClick = (r: number, c: number) => {
    if (gameState.gameStatus === 'GAME_OVER') return;
    makeMove(r, c);
  };

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell, position: 'relative' };
    const selectedPiece = getSelectedPiece();
    const validMoves = getValidMoves();
    const potentialCaptures = getPotentialCaptures();
    const moveKey = `${r},${c}`;

    // Style for selected piece
    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      style.backgroundColor = '#f6e05e'; // Yellow
    }

    // Hint-related styling
    if (hintsEnabled && selectedPiece) {
      const moveData = validMoves.get(moveKey);
      if (moveData) {
        // Style for valid move destinations
        style.backgroundColor = moveData.isUnsafe ? '#feb2b2' : '#9ae6b4'; // Red/Green
      }
      // Style for pieces that could be captured
      if (potentialCaptures.some(([capR, capC]) => capR === r && capC === c)) {
        style.backgroundColor = '#a4cafe'; // Light blue
      }
    }

    return style;
  };

  const winner = gameState.winner;

  const gameContent = (
    <>
      <div style={styles.board}>
        {gameState.board.map((row, r) =>
          row.map((cell, c) => {
            const selectedPiece = getSelectedPiece();
            const isSelected = !!(selectedPiece && selectedPiece.r === r && selectedPiece.c === c);
            return (
              <div
                key={`${r}-${c}`}
                data-testid={`cell-${r}-${c}`}
                data-selected={isSelected}
                style={getCellStyle(r, c)}
                onClick={() => onCellClick(r, c)}
              >
                {cell && <Piece player={cell} />}
                {cell === gameState.currentPlayer && !winner && (
                  <div style={styles.currentPlayerHighlight} />
                )}
              </div>
            );
          })
        )}
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

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useHasamiShogi };

export default HasamiShogi;
