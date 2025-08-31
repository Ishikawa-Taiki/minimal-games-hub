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
import { useDialog } from '../../app/components/ui/DialogProvider';
import { BaseGameController, HintableGameController, HintState } from '../../types/game';
import { SelectableButton } from '../../app/components/ui/SelectableButton';
import { styles } from './styles';

// アクション型定義
type TicTacToeAction = 
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean };

// リデューサー関数
function ticTacToeReducer(state: GameState, action: TicTacToeAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE':
      const newState = handleCellClick(state, action.row, action.col);
      return newState || state;
    case 'RESET_GAME':
      return createInitialState();
    case 'SET_HINTS_ENABLED':
      return { ...state, hintLevel: action.enabled ? 1 : 0 };
    default:
      return state;
  }
}

// カスタムフック: GameControllerインターフェースに準拠
function useTicTacToeController(): HintableGameController<TicTacToeGameState, TicTacToeAction> & {
  makeMove: (row: number, col: number) => void;
} {
  const [legacyState, dispatch] = useReducer(ticTacToeReducer, createInitialState());
  
  const gameState = adaptToBaseGameState(legacyState);
  
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const makeMove = (row: number, col: number) => {
    dispatch({ type: 'MAKE_MOVE', row, col });
  };
  
  const setHints = (enabled: boolean) => {
    dispatch({ type: 'SET_HINTS_ENABLED', enabled });
  };
  
  const getDisplayStatus = () => {
    if (gameState.winner) {
      return `勝者: ${gameState.winner}`;
    } else if ((gameState as any).isDraw) {
      return '引き分け！';
    } else if (gameState.status === 'ended') {
      return 'ゲーム終了';
    } else if ((gameState.status === 'playing' || gameState.status === 'waiting') && gameState.currentPlayer) {
      return `${gameState.currentPlayer}の番`;
    } else {
      return 'ゲーム開始';
    }
  };

  const hintState: HintState = {
    enabled: legacyState.hintLevel > 0,
  };
  
  return {
    gameState,
    dispatch,
    resetGame,
    makeMove,
    setHints,
    getDisplayStatus,
    hintState,
  };
}

// プロップスでコントローラーを受け取るバージョン
interface TicTacToeProps {
  controller?: HintableGameController<TicTacToeGameState, TicTacToeAction> & {
    makeMove: (row: number, col: number) => void;
  };
}

const TicTacToe = ({ controller: externalController }: TicTacToeProps = {}) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useTicTacToeController();
  const controller = externalController || internalController;
  const { alert } = useDialog();

  useEffect(() => {
    const { winner, isDraw } = controller.gameState as TicTacToeGameState;
    if (winner || isDraw) {
      const message = winner ? `勝者: ${winner}` : '引き分け！';
      alert({
        title: 'ゲーム終了',
        message,
      }).then(() => {
        controller.resetGame();
      });
    }
  }, [controller.gameState.winner, (controller.gameState as any).isDraw, alert, controller.resetGame]);

  const handleClick = (row: number, col: number) => {
    controller.makeMove(row, col);
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
    if (controller.hintState.enabled) {
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
                controller.hintState.enabled && reachingPlayerMark && !isBothPlayersReaching(index) && (
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
          isSelected={controller.hintState.enabled}
          onStateChange={(isSelected) => controller.setHints(isSelected)}
        >
          おしえて！
        </SelectableButton>
      </div>
    </>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useTicTacToeController };

export default TicTacToe;