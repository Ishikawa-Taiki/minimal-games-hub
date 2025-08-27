"use client";

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick as handleCellClickCore,
  Board, // Import Board type
} from './core';
import { useReversi, ReversiController } from './useReversi';
import { useGameStateLogger } from '../../hooks/useGameStateLogger';
import { styles } from './styles';

// 駒のアイコンコンポーネント
const DiscIcon: React.FC<{ player: Player; style?: CSSProperties }> = ({ player, style }) => (
  <div
    style={{
      ...styles.discIcon,
      backgroundColor: player === 'BLACK' ? 'black' : 'white',
      ...style,
    }}
  />
);

type HintLevel = 'none' | 'placeable' | 'full';

interface ReversiProps {
  controller?: ReversiController;
}

const Reversi: React.FC<ReversiProps> = ({ controller: externalController }) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useReversi();
  const controller = externalController || internalController;
  
  // ログ機能
  const logger = useGameStateLogger('Reversi', controller.gameState, {
    hintLevel: controller.gameState.hintLevel,
    validMovesCount: controller.gameState.validMoves.size
  });

  const [flippingCells, setFlippingCells] = useState<[number, number][]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [visualBoard, setVisualBoard] = useState<Board>(controller.gameState.board);

  useEffect(() => {
    setVisualBoard(controller.gameState.board);
  }, [controller.gameState.board]);

  const initializeGame = useCallback(() => {
    logger.log('INITIALIZE_GAME_CALLED', {});
    controller.resetGame();
    setFlippingCells([]);
    setIsFlipping(false);
    setShowResetConfirmModal(false); // Close modal on game init
  }, [controller, logger]);

  const handleCellClick = async (r: number, c: number) => {
    const moveKey = `${r},${c}`;
    const stonesToFlip = controller.gameState.validMoves.get(moveKey);
    if (controller.gameState.gameStatus === 'GAME_OVER' || isFlipping) return;

    logger.log('CELL_CLICK', { row: r, col: c, hintLevel: controller.gameState.hintLevel, hasValidMove: !!stonesToFlip });

    // フルヒントモードの場合の特別な処理
    if (controller.gameState.hintLevel === 'full') {
      if (controller.gameState.selectedHintCell && 
          controller.gameState.selectedHintCell[0] === r && 
          controller.gameState.selectedHintCell[1] === c) {
        // 2回目のタップ: アニメーション付きで移動を実行
        if (!stonesToFlip) return;
        
        setIsFlipping(true);
        logger.log('EXECUTING_ANIMATED_MOVE', { row: r, col: c });

        // Place the stone immediately on visualBoard
        setVisualBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          newBoard[r][c] = controller.gameState.currentPlayer;
          return newBoard;
        });

        // Animate flipping
        for (let i = 0; i < stonesToFlip.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setFlippingCells(prev => [...prev, stonesToFlip[i]]);
            await new Promise(resolve => setTimeout(resolve, 150));
            
            const [fr, fc] = stonesToFlip[i];
            setVisualBoard(prevBoard => {
              const newBoard = prevBoard.map(row => [...row]);
              newBoard[fr][fc] = controller.gameState.currentPlayer;
              return newBoard;
            });
            setFlippingCells(prev => prev.filter(cell => cell[0] !== fr || cell[1] !== fc));
        }

        // コントローラーを使用して移動を実行
        controller.makeMove(r, c);
        setVisualBoard(controller.gameState.board); // Sync visualBoard with actual game state after move
        setIsFlipping(false);
      } else {
        // 1回目のタップ: セルを選択（有効な移動の場合のみ）
        if (stonesToFlip) {
          controller.makeMove(r, c); // これは選択のみを行う
        }
      }
    } else {
      // 通常の移動（placeable、noneヒント）
      if (!stonesToFlip) return;
      
      setIsFlipping(true);

      // Place the stone immediately on visualBoard
      setVisualBoard(prevBoard => {
        const newBoard = prevBoard.map(row => [...row]);
        newBoard[r][c] = controller.gameState.currentPlayer;
        return newBoard;
      });

      // Animate flipping
      for (let i = 0; i < stonesToFlip.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFlippingCells(prev => [...prev, stonesToFlip[i]]);
          await new Promise(resolve => setTimeout(resolve, 150));
          
          const [fr, fc] = stonesToFlip[i];
          setVisualBoard(prevBoard => {
            const newBoard = prevBoard.map(row => [...row]);
            newBoard[fr][fc] = controller.gameState.currentPlayer;
            return newBoard;
          });
          setFlippingCells(prev => prev.filter(cell => cell[0] !== fr || cell[1] !== fc));
      }

      // コントローラーを使用して移動を実行
      controller.makeMove(r, c);
      setVisualBoard(controller.gameState.board); // Sync visualBoard with actual game state after move
      setIsFlipping(false);
    }
  };

  const winner = controller.gameState.winner;
  const isBlackWinning = controller.gameState.scores.BLACK > controller.gameState.scores.WHITE;
  const isWhiteWinning = controller.gameState.scores.WHITE > controller.gameState.scores.BLACK;

  const getHintButtonText = () => {
    if (controller.gameState.hintLevel === 'none') return 'ヒントなし';
    if (controller.gameState.hintLevel === 'placeable') return 'おけるばしょ';
    return 'ぜんぶヒント';
  };

  const getHintButtonStyle = (): CSSProperties => {
    const baseStyle = styles.hintButton;
    if (controller.gameState.hintLevel === 'none') return { ...baseStyle, ...styles.hintButtonNone };
    if (controller.gameState.hintLevel === 'placeable') return { ...baseStyle, ...styles.hintButtonPlaceable };
    return { ...baseStyle, ...styles.hintButtonFull };
  };

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cellContainer };
    const cellContent = controller.gameState.board[r][c];
    const opponent = controller.gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK';

    // Highlight placeable cells when hint is active
    if (controller.gameState.hintLevel !== 'none' && controller.gameState.validMoves.has(`${r},${c}`)) {
      style.backgroundColor = '#68d391'; // A slightly different green for placeable cells
    }

    if (controller.gameState.hintLevel === 'full' && controller.gameState.selectedHintCell) {
      const [selectedR, selectedC] = controller.gameState.selectedHintCell;
      const moveKey = `${selectedR},${selectedC}`;
      const stonesToFlip = controller.gameState.validMoves.get(moveKey);

      if (r === selectedR && c === selectedC) {
        style.border = styles.selectedHintPreviewCell.border;
      }

      if (stonesToFlip?.some(([fr, fc]) => fr === r && fc === c)) {
        style.backgroundColor = styles.highlightedCell.backgroundColor;
      } else if (cellContent === opponent) {
        style.backgroundColor = styles.dimmedCell.backgroundColor;
      }
    }
    return style;
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.scoreBoard}>
        <div style={styles.score}>
          <DiscIcon player="BLACK" />
          <span data-testid="score-black" style={isBlackWinning ? styles.winningScore : {}}>
            {controller.gameState.scores.BLACK}
          </span>
        </div>
        <div data-testid="turn-indicator" style={styles.turnIndicator}>
          <DiscIcon player={controller.gameState.currentPlayer} style={styles.turnIndicatorDisc} />
          <span>のばん</span>
        </div>
        <div style={styles.score}>
          <DiscIcon player="WHITE" />
          <span data-testid="score-white" style={isWhiteWinning ? styles.winningScore : {}}>
            {controller.gameState.scores.WHITE}
          </span>
        </div>
      </div>
      
      <div style={styles.board}>
        {visualBoard.map((row, r) =>
          row.map((cell, c) => {
            const isFlipping = flippingCells.some(([fr, fc]) => fr === r && fc === c);
            const moveInfo = controller.gameState.validMoves.get(`${r},${c}`);
            return (
              <div
                key={`${r}-${c}`}
                data-testid={`cell-${r}-${c}`}
                style={getCellStyle(r, c)}
                onClick={() => handleCellClick(r, c)}
              >
                {cell && (
                   <div
                   style={{
                     ...styles.disc,
                     transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
                     backgroundColor: cell === 'BLACK' ? 'black' : 'white',
                   }}
                 />
                )}
                {controller.gameState.hintLevel !== 'none' && moveInfo && (
                  <>
                    {controller.gameState.hintLevel === 'placeable' && 
                      <div
                        data-testid={`placeable-hint-${r}-${c}`}
                        style={{
                          ...styles.placeableHint,
                          backgroundColor: controller.gameState.currentPlayer === 'BLACK' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                        }}
                      />
                    }
                    {controller.gameState.hintLevel === 'full' && 
                      <span className="moveHint" style={styles.moveHint}>
                        {moveInfo.length}
                      </span>
                    }
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button data-testid="reset-button" onClick={() => setShowResetConfirmModal(true)} style={styles.resetButtonLarge}>
          はじめから<br />やりなおす
        </button>
        <button data-testid="hint-button" onClick={controller.toggleHintLevel} style={getHintButtonStyle()}>
          おしえて！<br /><span data-testid="hint-level-text">({getHintButtonText()})</span>
        </button>
      </div>

      <div style={styles.historyControls}>
        <button 
          data-testid="history-first-button"
          onClick={() => {/* TODO: 履歴機能の実装 */}}
          disabled={!controller.canUndo()}
          style={{ ...styles.historyButton, ...(!controller.canUndo() ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          はじめ
        </button>
        <button 
          data-testid="history-back-button"
          onClick={controller.undo}
          disabled={!controller.canUndo()}
          style={{ ...styles.historyButton, ...(!controller.canUndo() ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          もどる
        </button>
        <span data-testid="history-counter" style={styles.historyText}>
          {controller.getHistoryState().currentIndex + 1} / {controller.getHistoryState().totalSteps + 1}
        </span>
        <button 
          data-testid="history-forward-button"
          onClick={controller.redo}
          disabled={!controller.canRedo()}
          style={{ ...styles.historyButton, ...(!controller.canRedo() ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          すすむ
        </button>
        <button 
          data-testid="history-last-button"
          onClick={() => {/* TODO: 履歴機能の実装 */}}
          disabled={!controller.canRedo()}
          style={{ ...styles.historyButton, ...(!controller.canRedo() ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          さいご
        </button>
      </div>

      {controller.gameState.gameStatus === 'SKIPPED' && (
        <div style={styles.skippedMessage}>
          <DiscIcon player={controller.gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK'} />
          <span>はパスしました。</span>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div data-testid="reset-confirm-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲームをリセットしますか？</h2>
            <p style={{ marginBottom: '1rem' }}>現在のゲームは失われます。</p>
            <button data-testid="confirm-reset-button" onClick={initializeGame} style={{ ...styles.resetButton, marginRight: '1rem' }}>
              はい
            </button>
            <button onClick={() => setShowResetConfirmModal(false)} style={styles.resetButton}>
              いいえ
            </button>
          </div>
        </div>
      )}

      {winner && (
        <div data-testid="game-over-modal" style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <h2 style={styles.gameOverTitle}>ゲーム終了</h2>
            <div data-testid="winner-message" style={styles.winnerText}>
              {winner === 'DRAW' ? '引き分け' : (
                <>
                  <DiscIcon player={winner} />
                  <span>の勝ち!</span>
                </>
              )}
            </div>
            <button data-testid="play-again-button" onClick={initializeGame} style={styles.resetButton}>
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useReversi };

export default Reversi;