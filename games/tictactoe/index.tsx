"use client";

import React, { useState, useEffect, useReducer } from 'react';
import {
  Player,
  GameState,
  TicTacToeGameState,
  createInitialState,
  handleCellClick,
  adaptToBaseGameState,
} from './core';
import { BaseGameController } from '../../types/game';
import { styles } from './styles';

// アクション型定義
type TicTacToeAction = 
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_HINTS' };

// リデューサー関数
function ticTacToeReducer(state: GameState, action: TicTacToeAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE':
      const newState = handleCellClick(state, action.row, action.col);
      return newState || state;
    case 'RESET_GAME':
      return createInitialState();
    default:
      return state;
  }
}

// カスタムフック: GameControllerインターフェースに準拠
function useTicTacToeController(): BaseGameController<TicTacToeGameState, TicTacToeAction> & {
  makeMove: (row: number, col: number) => void;
  showHints: boolean;
  toggleHints: () => void;
} {
  const [legacyState, dispatch] = useReducer(ticTacToeReducer, createInitialState());
  const [showHints, setShowHints] = useState(false);
  
  const gameState = adaptToBaseGameState(legacyState);
  

  
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const makeMove = (row: number, col: number) => {
    dispatch({ type: 'MAKE_MOVE', row, col });
  };
  
  const toggleHints = () => {
    setShowHints(!showHints);
  };
  
  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    showHints,
    toggleHints,
  };
}

// プロップスでコントローラーを受け取るバージョン
interface TicTacToeProps {
  controller?: BaseGameController<TicTacToeGameState, TicTacToeAction> & {
    makeMove: (row: number, col: number) => void;
    showHints: boolean;
    toggleHints: () => void;
  };
}

const TicTacToe = ({ controller: externalController }: TicTacToeProps = {}) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useTicTacToeController();
  const controller = externalController || internalController;
  
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (controller.gameState.winner || (controller.gameState as any).isDraw) {
      setShowModal(true);
    }
  }, [controller.gameState.winner, (controller.gameState as any).isDraw]);

  const handleClick = (row: number, col: number) => {
    controller.makeMove(row, col);
  };

  const handlePlayAgain = () => {
    controller.resetGame();
    setShowModal(false);
  };

  // レガシー状態にアクセスするためのヘルパー
  const legacyState = controller.gameState as TicTacToeGameState;

  const isBothPlayersReaching = (index: number): boolean => {
    const xReaching = legacyState.reachingLines.some(rl => rl.index === index && rl.player === 'X');
    const oReaching = legacyState.reachingLines.some(rl => rl.index === index && rl.player === 'O');
    return xReaching && oReaching;
  };

  const getCellBackgroundColor = (index: number): string => {
    if (legacyState.winningLines && legacyState.winningLines.some(line => line.includes(index))) {
      return styles.winningCell.backgroundColor as string;
    }
    if (controller.showHints) {
      if (isBothPlayersReaching(index)) {
        return styles.bothReachingCell.backgroundColor as string;
      } else if (legacyState.reachingLines.some(rl => rl.index === index)) {
        return styles.reachingCell.backgroundColor as string;
      }
    }
    return styles.cell.backgroundColor as string;
  };

  const getReachingPlayerMark = (index: number): Player => {
    const reaching = legacyState.reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  return (
    <>
      <div style={styles.board}>
        {legacyState.board.flat().map((cell, index) => {
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
              disabled={!!cell || !!controller.gameState.winner || legacyState.isDraw}
            >
              {cell ? cell : (
                controller.showHints && reachingPlayerMark && !isBothPlayersReaching(index) && (
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
        <button
          data-testid="hint-button"
          style={styles.toggleButton}
          onClick={controller.toggleHints}
        >
          ヒント: {controller.showHints ? 'ON' : 'OFF'}
        </button>
      </div>

      {showModal && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <div data-testid="winner-message">
              {controller.gameState.winner ? `勝者: ${controller.gameState.winner}` : '引き分け！'}
            </div>
            <button
              data-testid="play-again-button"
              style={styles.resetButton}
              onClick={handlePlayAgain}
            >
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useTicTacToeController };

export default TicTacToe;