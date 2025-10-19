"use client";

import React, { useEffect } from 'react';
import { Player } from './core';
import { useDialog } from '@/core/components/ui/DialogProvider';
import { styles } from './styles';
import { useTicTacToe, TicTacToeController } from './useTicTacToe';

// プロップスでコントローラーを受け取るバージョン
interface TicTacToeProps {
  controller?: TicTacToeController;
}

const TicTacToe = ({ controller: externalController }: TicTacToeProps = {}) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useTicTacToe();
  const controller = externalController || internalController;
  const { gameState, makeMove, resetGame, hintState } = controller;
  const { alert } = useDialog();

  useEffect(() => {
    const { winner, isDraw } = gameState;
    if (winner) {
      const winnerMark = winner === 'O' ? '○' : '×';
      alert({
        title: `${winnerMark}のかち！`,
        message: `${winnerMark}がそろったので、${winnerMark}のかち！`,
      }).then(() => {
        resetGame();
      });
    } else if (isDraw) {
      alert({
        title: 'ひきわけ！',
        message: 'もういちどあそぶ？',
      }).then(() => {
        resetGame();
      });
    }
  }, [gameState, alert, resetGame]);

  const handleClick = (row: number, col: number) => {
    makeMove(row, col);
  };

  const getReachingPlayer = (index: number): Player => {
    const reaching = gameState.reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  const isBothPlayersReaching = (index: number): boolean => {
    const xReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'X');
    const oReaching = gameState.reachingLines.some(rl => rl.index === index && rl.player === 'O');
    return xReaching && oReaching;
  };

  const getCellBackgroundColor = (index: number): string => {
    if (gameState.winningLines && gameState.winningLines.some(line => line.includes(index))) {
      return styles.winningCell.backgroundColor as string;
    }
    if (hintState.enabled) {
      if (isBothPlayersReaching(index)) {
        return styles.bothReachingCell.backgroundColor as string;
      }
      const reachingPlayer = getReachingPlayer(index);
      if (reachingPlayer === 'O') {
        return styles.OReachingCell.backgroundColor as string;
      }
      if (reachingPlayer === 'X') {
        return styles.XReachingCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  const getPlayerMarkStyle = (player: Player) => {
    if (player === 'O') return styles.playerO;
    if (player === 'X') return styles.playerX;
    return {};
  };

  return (
    <>
      <div style={styles.board}>
        {gameState.board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;

          const potentialLines = gameState.potentialLines[index];

          return (
            <button
              key={`${row}-${col}`}
              data-testid={`cell-${row}-${col}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(index),
                ...getPlayerMarkStyle(cell),
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!gameState.winner || gameState.isDraw}
            >
              {cell ? (cell === 'O' ? '○' : '×') : (
                hintState.enabled && potentialLines !== null && (
                  <span style={styles.potentialLineCount}>
                    {potentialLines}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      
    </>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useTicTacToe };

export default TicTacToe;