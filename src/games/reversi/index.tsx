"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import {
  Player,
  Board, // Import Board type
} from './core';
import { useReversi, ReversiController } from './useReversi';
import { useGameStateLogger } from '../../../hooks/useGameStateLogger';
import { styles } from './styles';
import { useDialog } from '../../../app/components/ui/DialogProvider';

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

interface ReversiProps {
  controller?: ReversiController;
}

const Reversi: React.FC<ReversiProps> = ({ controller: externalController }) => {
  // 外部からコントローラーが渡された場合はそれを使用、そうでなければ内部で作成
  const internalController = useReversi();
  const controller = externalController || internalController;
  
  // ログ機能
  const logger = useGameStateLogger('Reversi', controller.gameState, {
    hintsEnabled: controller.gameState.hintsEnabled,
    validMovesCount: controller.gameState.validMoves.size
  });

  const [flippingCells, setFlippingCells] = useState<[number, number][]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [visualBoard, setVisualBoard] = useState<Board>(controller.gameState.board);
  const { alert } = useDialog();
  const { gameState } = controller;
  const { winner, scores } = gameState;

  useEffect(() => {
    if (winner) {
      const winnerText = winner === 'BLACK' ? 'くろ' : 'しろ';
      if (winner === 'DRAW') {
        alert({
          title: 'ひきわけ',
          message: `くろいしも しろいしも ${scores.BLACK}こだったよ！`,
        }).then(() => {
          controller.resetGame();
        });
      } else {
        alert({
          title: `${winnerText}のかち`,
          message: `くろいしが${scores.BLACK}こ、しろいしが${scores.WHITE}こだったよ！`,
        }).then(() => {
          controller.resetGame();
        });
      }
    }
  }, [winner, scores, alert, controller]);

  useEffect(() => {
    setVisualBoard(controller.gameState.board);
  }, [controller.gameState.board]);

  const handleCellClick = async (r: number, c: number) => {
    const moveKey = `${r},${c}`;
    const stonesToFlip = controller.gameState.validMoves.get(moveKey);
    if (controller.gameState.gameStatus === 'GAME_OVER' || isFlipping) return;

    logger.log('CELL_CLICK', { row: r, col: c, hintsEnabled: controller.hintState.enabled, hasValidMove: !!stonesToFlip });

    // 「おしえて！」がONの場合の特別な処理（2回タップ）
    if (controller.hintState.enabled) {
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
      // 通常の移動
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

  const isBlackWinning = controller.gameState.scores.BLACK > controller.gameState.scores.WHITE;
  const isWhiteWinning = controller.gameState.scores.WHITE > controller.gameState.scores.BLACK;

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cellContainer };
    const cellContent = controller.gameState.board[r][c];
    const opponent = controller.gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK';

    // Highlight placeable cells
    if (controller.gameState.validMoves.has(`${r},${c}`)) {
      style.backgroundColor = '#68d391'; // A slightly different green for placeable cells
    }

    if (controller.hintState.enabled && controller.gameState.selectedHintCell) {
      const [selectedR, selectedC] = controller.gameState.selectedHintCell;
      const moveKey = `${selectedR},${selectedC}`;
      const stonesToFlip = controller.gameState.validMoves.get(moveKey);

      if (r === selectedR && c === selectedC) {
        style.border = styles.selectedHintPreviewCell.border;
      }

      if (stonesToFlip?.some(([fr, fc]: [number, number]) => fr === r && fc === c)) {
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
                {moveInfo && (
                  <>
                    <div
                      data-testid={`placeable-hint-${r}-${c}`}
                      style={{
                        ...styles.placeableHint,
                        backgroundColor: controller.gameState.currentPlayer === 'BLACK' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                      }}
                    />
                    {controller.hintState.enabled &&
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


      <div style={styles.historyControls}>
        <button 
          data-testid="history-first-button"
          onClick={() => controller.goToHistoryIndex(0)}
          disabled={!controller.canUndo}
          style={{ ...styles.historyButton, ...(!controller.canUndo ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          はじめ
        </button>
        <button 
          data-testid="history-back-button"
          onClick={controller.undoMove}
          disabled={!controller.canUndo}
          style={{ ...styles.historyButton, ...(!controller.canUndo ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          もどる
        </button>
        <span data-testid="history-counter" style={styles.historyText}>
          {controller.currentHistoryIndex + 1} / {controller.gameHistory.length}
        </span>
        <button 
          data-testid="history-forward-button"
          onClick={controller.redoMove}
          disabled={!controller.canRedo}
          style={{ ...styles.historyButton, ...(!controller.canRedo ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          すすむ
        </button>
        <button 
          data-testid="history-last-button"
          onClick={() => controller.goToHistoryIndex(controller.gameHistory.length - 1)}
          disabled={!controller.canRedo}
          style={{ ...styles.historyButton, ...(!controller.canRedo ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
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

    </div>
  );
};

// GameControllerを外部に公開するためのラッパーコンポーネント
export { useReversi };

export default Reversi;