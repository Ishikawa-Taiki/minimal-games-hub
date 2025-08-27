"use client";

import React, { useState, useCallback, CSSProperties } from 'react';
import {
  Player,
  WinCondition,
} from './core';
import { useHasamiShogi, HasamiShogiController } from './useHasamiShogi';
import GameLayout from '../../app/components/GameLayout';
import { useResponsive, isMobile } from '../../hooks/useResponsive';
import { styles } from './styles';

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

// Piece component for the UI indicators (no rotation)
const IndicatorPiece: React.FC<{ player: Player }> = ({ player }) => {
  const pieceStyle: CSSProperties = {
    ...styles.piece,
    color: player === 'PLAYER2' ? '#e53e3e' : '#000000',
  };
  const char = player === 'PLAYER1' ? '歩' : 'と';
  return <div style={pieceStyle}>{char}</div>;
};


// プロップスでコントローラーを受け取るバージョン
interface HasamiShogiProps {
  controller?: HasamiShogiController;
}

const HasamiShogi = ({ controller: externalController }: HasamiShogiProps = {}) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useHasamiShogi();
  const controller = externalController || internalController;
  
  const gameState = controller.gameState;
  const hintLevel = controller.getHintLevel();
  const responsiveState = useResponsive();
  const isMobileLayout = isMobile(responsiveState);

  const onCellClick = (r: number, c: number) => {
    if (gameState.gameStatus === 'GAME_OVER') return;
    controller.makeMove(r, c);
  };

  const onWinConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value as WinCondition;
    controller.setWinCondition(newCondition);
  };

  const isGameStarted = gameState.capturedPieces.PLAYER1 > 0 || gameState.capturedPieces.PLAYER2 > 0 || !gameState.board.every((row, r) => row.every((cell, c) => {
    // 初期状態のボードと比較
    if (r === 0) return cell === 'PLAYER2';
    if (r === 8) return cell === 'PLAYER1';
    return cell === null;
  }));


  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cell, position: 'relative' };
    const selectedPiece = controller.getSelectedPiece();
    const validMoves = controller.getValidMoves();
    const potentialCaptures = controller.getPotentialCaptures();
    const moveKey = `${r},${c}`;

    // Style for selected piece
    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      style.backgroundColor = '#f6e05e'; // Yellow
    }

    // Hint-related styling
    if (hintLevel === 'on' && selectedPiece) {
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

  // GameLayoutを使用したレンダリング
  const gameContent = (
    <>
      <div style={styles.winConditionSelector} data-testid="win-condition-selector">
        <h2 style={styles.winConditionTitle}>かちかたのルール</h2>
        <div style={isMobileLayout ? styles.radioGroup : styles.radioGroupDesktop}>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="standard" checked={gameState.winCondition === 'standard'} onChange={onWinConditionChange} disabled={isGameStarted} />
            ふつうのルール
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="five_captures" checked={gameState.winCondition === 'five_captures'} onChange={onWinConditionChange} disabled={isGameStarted} />
            ５こさきどり
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="win-condition" value="total_capture" checked={gameState.winCondition === 'total_capture'} onChange={onWinConditionChange} disabled={isGameStarted} />
            ぜんぶとる
          </label>
        </div>
      </div>

      <div style={styles.infoPanel}>
        <div style={{...styles.score, ...styles.infoPanelItem, justifyContent: 'flex-start'}}>
          <IndicatorPiece player="PLAYER2" />
          <span data-testid="opponent-score" style={{marginLeft: '0.5rem'}}>x {gameState.capturedPieces.PLAYER1}</span>
        </div>
        <div data-testid="turn-indicator" style={{...styles.turnIndicator, ...styles.infoPanelItem}}>
          {winner ? 'おしまい' : (gameState.currentPlayer === 'PLAYER1' ? '「歩」のばん' : '「と」のばん')}
        </div>
        <div style={{...styles.score, ...styles.infoPanelItem, justifyContent: 'flex-end'}}>
          <IndicatorPiece player="PLAYER1" />
          <span data-testid="player-score" style={{marginLeft: '0.5rem'}}>x {gameState.capturedPieces.PLAYER2}</span>
        </div>
      </div>

      <div style={styles.board}>
        {gameState.board.map((row, r) =>
          row.map((cell, c) => {
            return (
              <div
                key={`${r}-${c}`}
                data-testid={`cell-${r}-${c}`}
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

      {/* ゲーム内ヒント切り替えボタン */}
      <div style={isMobileLayout ? styles.buttonGroup : styles.buttonGroupDesktop}>
        <button
          data-testid="hint-button"
          onClick={controller.toggleHints}
          style={{
            ...(isMobileLayout ? styles.resetButton : styles.resetButtonDesktop), 
            backgroundColor: hintLevel === 'on' ? '#4a5568' : '#a0aec0'
          }}
        >
          ヒント: {hintLevel === 'on' ? 'ON' : 'OFF'}
        </button>
      </div>

      {winner && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>おしまい</h2>
            <div data-testid="winner-message" style={styles.winnerText}>
              {winner === 'PLAYER1'
                 ? <IndicatorPiece player="PLAYER1" />
                 : <IndicatorPiece player="PLAYER2" />
              }
              <span>のかち！</span>
            </div>
            <button data-testid="play-again-button" onClick={controller.resetGame} style={isMobileLayout ? styles.resetButton : styles.resetButtonDesktop}>
              もういちど
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <GameLayout
      gameName="はさみ将棋"
      slug="hasami-shogi"
      gameController={controller}
    >
      {gameContent}
    </GameLayout>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useHasamiShogi };

export default HasamiShogi;
