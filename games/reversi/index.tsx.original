"use client";

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import {
  Player,
  GameState,
  createInitialState,
  handleCellClick as handleCellClickCore,
  Board, // Import Board type
} from './core';
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

const Reversi: React.FC = () => {
  const [gameStateHistory, setGameStateHistory] = useState<GameState[]>([createInitialState()]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const gameState = gameStateHistory[currentHistoryIndex];

  const [flippingCells, setFlippingCells] = useState<[number, number][]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hintLevel, setHintLevel] = useState<HintLevel>('none'); // Default to full for dev
  const [selectedHintCell, setSelectedHintCell] = useState<[number, number] | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [visualBoard, setVisualBoard] = useState<Board>(gameState.board);

  useEffect(() => {
    setVisualBoard(gameState.board);
  }, [gameState.board]);

  const initializeGame = useCallback(() => {
    const initialState = createInitialState();
    setGameStateHistory([initialState]);
    setCurrentHistoryIndex(0); // Start at the actual initial game state
    setFlippingCells([]);
    setIsFlipping(false);
    setHintLevel('none');
    setSelectedHintCell(null);
    setShowResetConfirmModal(false); // Close modal on game init
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const toggleHintLevel = () => {
    setHintLevel(prev => {
      if (prev === 'none') return 'placeable';
      if (prev === 'placeable') return 'full';
      return 'none';
    });
    setSelectedHintCell(null); // Reset selection when changing hint level
  };

  const handleCellClick = async (r: number, c: number) => {
    const moveKey = `${r},${c}`;
    const stonesToFlip = gameState.validMoves.get(moveKey);
    if (gameState.gameStatus === 'GAME_OVER' || isFlipping || !stonesToFlip) return;

    // Full hint mode logic
    if (hintLevel === 'full') {
      if (selectedHintCell && selectedHintCell[0] === r && selectedHintCell[1] === c) {
        // Second tap on the same cell: execute the move
        setSelectedHintCell(null);
      } else {
        // First tap or tap on a different cell: just highlight
        setSelectedHintCell([r, c]);
        return; // Don't execute the move yet
      }
    }

    setIsFlipping(true);

    // Place the stone immediately on visualBoard
    setVisualBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      newBoard[r][c] = gameState.currentPlayer;
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
          newBoard[fr][fc] = gameState.currentPlayer;
          return newBoard;
        });
        setFlippingCells(prev => prev.filter(cell => cell[0] !== fr || cell[1] !== fc));
    }

    const newState = handleCellClickCore(gameState, r, c);
    if (newState) {
      setGameStateHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentHistoryIndex + 1);
        newHistory.push(newState);
        return newHistory;
      });
      setCurrentHistoryIndex(prevIndex => prevIndex + 1);
      setVisualBoard(newState.board); // Sync visualBoard with actual game state after move
    }
    setIsFlipping(false);
  };

  const getWinner = (): Player | 'DRAW' | null => {
    if (gameState.gameStatus !== 'GAME_OVER') return null;
    if (gameState.scores.BLACK > gameState.scores.WHITE) return 'BLACK';
    if (gameState.scores.WHITE > gameState.scores.BLACK) return 'WHITE';
    return 'DRAW';
  };

  const winner = getWinner();
  const isBlackWinning = gameState.scores.BLACK > gameState.scores.WHITE;
  const isWhiteWinning = gameState.scores.WHITE > gameState.scores.BLACK;

  const getHintButtonText = () => {
    if (hintLevel === 'none') return 'ヒントなし';
    if (hintLevel === 'placeable') return 'おけるばしょ';
    return 'ぜんぶヒント';
  };

  const getHintButtonStyle = (): CSSProperties => {
    const baseStyle = styles.hintButton;
    if (hintLevel === 'none') return { ...baseStyle, ...styles.hintButtonNone };
    if (hintLevel === 'placeable') return { ...baseStyle, ...styles.hintButtonPlaceable };
    return { ...baseStyle, ...styles.hintButtonFull };
  };

  const getCellStyle = (r: number, c: number): CSSProperties => {
    const style: CSSProperties = { ...styles.cellContainer };
    const cellContent = gameState.board[r][c];
    const opponent = gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK';

    // Highlight placeable cells when hint is active
    if (hintLevel !== 'none' && gameState.validMoves.has(`${r},${c}`)) {
      style.backgroundColor = '#68d391'; // A slightly different green for placeable cells
    }

    if (hintLevel === 'full' && selectedHintCell) {
      const [selectedR, selectedC] = selectedHintCell;
      const moveKey = `${selectedR},${selectedC}`;
      const stonesToFlip = gameState.validMoves.get(moveKey);

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
            {gameState.scores.BLACK}
          </span>
        </div>
        <div data-testid="turn-indicator" style={styles.turnIndicator}>
          <DiscIcon player={gameState.currentPlayer} style={styles.turnIndicatorDisc} />
          <span>のばん</span>
        </div>
        <div style={styles.score}>
          <DiscIcon player="WHITE" />
          <span data-testid="score-white" style={isWhiteWinning ? styles.winningScore : {}}>
            {gameState.scores.WHITE}
          </span>
        </div>
      </div>
      
      <div style={styles.board}>
        {visualBoard.map((row, r) =>
          row.map((cell, c) => {
            const isFlipping = flippingCells.some(([fr, fc]) => fr === r && fc === c);
            const moveInfo = gameState.validMoves.get(`${r},${c}`);
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
                {hintLevel !== 'none' && moveInfo && (
                  <>
                    {hintLevel === 'placeable' && 
                      <div
                        data-testid={`placeable-hint-${r}-${c}`}
                        style={{
                          ...styles.placeableHint,
                          backgroundColor: gameState.currentPlayer === 'BLACK' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                        }}
                      />
                    }
                    {hintLevel === 'full' && 
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
        <button data-testid="hint-button" onClick={toggleHintLevel} style={getHintButtonStyle()}>
          おしえて！<br /><span data-testid="hint-level-text">({getHintButtonText()})</span>
        </button>
      </div>

      <div style={styles.historyControls}>
        <button 
          data-testid="history-first-button"
          onClick={() => setCurrentHistoryIndex(0)}
          disabled={currentHistoryIndex === 0}
          style={{ ...styles.historyButton, ...(currentHistoryIndex === 0 ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          はじめ
        </button>
        <button 
          data-testid="history-back-button"
          onClick={() => setCurrentHistoryIndex(prev => Math.max(0, prev - 1))}
          disabled={currentHistoryIndex === 0}
          style={{ ...styles.historyButton, ...(currentHistoryIndex === 0 ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          もどる
        </button>
        <span data-testid="history-counter" style={styles.historyText}>
          {currentHistoryIndex + 1} / {gameStateHistory.length}
        </span>
        <button 
          data-testid="history-forward-button"
          onClick={() => setCurrentHistoryIndex(prev => Math.min(gameStateHistory.length - 1, prev + 1))}
          disabled={currentHistoryIndex === gameStateHistory.length - 1}
          style={{ ...styles.historyButton, ...(currentHistoryIndex === gameStateHistory.length - 1 ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          すすむ
        </button>
        <button 
          data-testid="history-last-button"
          onClick={() => setCurrentHistoryIndex(gameStateHistory.length - 1)}
          disabled={currentHistoryIndex === gameStateHistory.length - 1}
          style={{ ...styles.historyButton, ...(currentHistoryIndex === gameStateHistory.length - 1 ? { backgroundColor: '#a0aec0', cursor: 'not-allowed' } : {}) }}
        >
          さいご
        </button>
      </div>

      {gameState.gameStatus === 'SKIPPED' && (
        <div style={styles.skippedMessage}>
          <DiscIcon player={gameState.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK'} />
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

export default Reversi;