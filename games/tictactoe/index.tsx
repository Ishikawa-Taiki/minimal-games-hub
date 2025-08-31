"use client";

import React, { useEffect } from 'react';
import { Player } from './core';
import { useDialog } from '../../app/components/ui/DialogProvider';
import { SelectableButton } from '../../app/components/ui/SelectableButton';
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
  const { gameState, makeMove, resetGame, setHints, hintState } = controller;
  const { alert } = useDialog();

  useEffect(() => {
    const { winner, isDraw } = gameState;
    if (winner || isDraw) {
      const message = winner ? `勝者: ${winner}` : '引き分け！';
      alert({
        title: 'ゲーム終了',
        message,
      }).then(() => {
        resetGame();
      });
    }
  }, [gameState.winner, gameState.isDraw, alert, resetGame]);

  const handleClick = (row: number, col: number) => {
    makeMove(row, col);
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
      } else if (gameState.reachingLines.some(rl => rl.index === index)) {
        return styles.reachingCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  const getReachingPlayerMark = (index: number): Player => {
    const reaching = gameState.reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  return (
    <>
      <div style={styles.board}>
        {gameState.board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const reachingPlayerMark = getReachingPlayerMark(index);

          return (
            <button
              key={`${row}-${col}`}
              data-testid={`cell-${row}-${col}`}
              style={{
                ...styles.cell,
                backgroundColor: getCellBackgroundColor(index),
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!gameState.winner || gameState.isDraw}
            >
              {cell ? cell : (
                hintState.enabled && reachingPlayerMark && !isBothPlayersReaching(index) && (
                  <span style={styles.faintMark}>
                    {reachingPlayerMark}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      
      {/* ヒント切り替えボタン（ゲーム内に配置） */}
      <div style={styles.gameControls}>
        <SelectableButton
          data-testid="hint-button"
          isSelected={hintState.enabled}
          onStateChange={(isSelected) => setHints(isSelected)}
        >
          おしえて！
        </SelectableButton>
      </div>
    </>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useTicTacToe };

export default TicTacToe;