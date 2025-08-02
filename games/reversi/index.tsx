"use client";

import React, { useState, useEffect, useCallback } from 'react';

type Player = 'BLACK' | 'WHITE';
type CellState = Player | null;
type Board = CellState[][];

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const Reversi: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(8).fill(null).map(() => Array(8).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('BLACK');
  const [scores, setScores] = useState({ BLACK: 2, WHITE: 2 });
  const [gameState, setGameState] = useState<'PLAYING' | 'SKIPPED' | 'GAME_OVER'>('PLAYING');
  const [flippingCells, setFlippingCells] = useState<[number, number][]>([]);

  const getOpponent = (player: Player): Player => (player === 'BLACK' ? 'WHITE' : 'BLACK');

  const getValidMoves = useCallback((player: Player, currentBoard: Board): Map<string, [number, number][]> => {
    const validMoves = new Map<string, [number, number][]>();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (currentBoard[r][c] !== null) continue;

        const stonesToFlip: [number, number][] = [];
        for (const [dr, dc] of DIRS) {
          const line: [number, number][] = [];
          let nr = r + dr;
          let nc = c + dc;

          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc] === getOpponent(player)) {
            line.push([nr, nc]);
            nr += dr;
            nc += dc;
          }

          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc] === player && line.length > 0) {
            stonesToFlip.push(...line);
          }
        }
        if (stonesToFlip.length > 0) {
          validMoves.set(`${r},${c}`, stonesToFlip);
        }
      }
    }
    return validMoves;
  }, []);

  const [validMoves, setValidMoves] = useState<Map<string, [number, number][]>>(new Map());

  const initializeGame = useCallback(() => {
    const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    newBoard[3][3] = 'WHITE';
    newBoard[3][4] = 'BLACK';
    newBoard[4][3] = 'BLACK';
    newBoard[4][4] = 'WHITE';
    setBoard(newBoard);
    const initialPlayer = 'BLACK';
    setCurrentPlayer(initialPlayer);
    setScores({ BLACK: 2, WHITE: 2 });
    setGameState('PLAYING');
    setValidMoves(getValidMoves(initialPlayer, newBoard));
  }, [getValidMoves]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCellClick = async (r: number, c: number) => {
    if (gameState === 'GAME_OVER' || !validMoves.has(`${r},${c}`)) return;

    const newBoard = board.map(row => [...row]);
    const stonesToFlip = validMoves.get(`${r},${c}`)!;
    
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard); // Place the stone immediately

    // Animate flipping
    for (let i = 0; i < stonesToFlip.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFlippingCells(prev => [...prev, stonesToFlip[i]]);
        await new Promise(resolve => setTimeout(resolve, 150)); // Duration of flip animation
        
        const [fr, fc] = stonesToFlip[i];
        newBoard[fr][fc] = currentPlayer;
        setBoard(newBoard.map(row => [...row]));
        setFlippingCells(prev => prev.filter(cell => cell[0] !== fr || cell[1] !== fc));
    }


    const nextPlayer = getOpponent(currentPlayer);
    let nextValidMoves = getValidMoves(nextPlayer, newBoard);

    if (nextValidMoves.size === 0) {
      const currentPlayerValidMoves = getValidMoves(currentPlayer, newBoard);
      if (currentPlayerValidMoves.size === 0) {
        setGameState('GAME_OVER');
      } else {
        setGameState('SKIPPED');
        // The current player plays again, so we don't switch players
        setValidMoves(currentPlayerValidMoves);
        return; // Skip player switch
      }
    } else {
        setValidMoves(nextValidMoves);
    }
    
    setCurrentPlayer(nextPlayer);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const blackScore = board.flat().filter(c => c === 'BLACK').length;
    const whiteScore = board.flat().filter(c => c === 'WHITE').length;
    setScores({ BLACK: blackScore, WHITE: whiteScore });

    if (gameState !== 'GAME_over' && blackScore + whiteScore === 64) {
        setGameState('GAME_OVER');
        return;
    }

    const currentPlayerHasMoves = validMoves.size > 0;
    if (!currentPlayerHasMoves) {
        const opponent = getOpponent(currentPlayer);
        const opponentHasMoves = getValidMoves(opponent, board).size > 0;
        if (opponentHasMoves) {
            setGameState('SKIPPED');
            setCurrentPlayer(opponent);
            setValidMoves(getValidMoves(opponent, board));
        } else {
            setGameState('GAME_OVER');
        }
    }
  }, [board, currentPlayer, getValidMoves, gameState, validMoves]);


  const getWinner = (): Player | 'DRAW' | null => {
    if (gameState !== 'GAME_OVER') return null;
    if (scores.BLACK > scores.WHITE) return 'BLACK';
    if (scores.WHITE > scores.BLACK) return 'WHITE';
    return 'DRAW';
  };

  const winner = getWinner();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>リバーシ</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '28rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: currentPlayer === 'BLACK' ? '#4299e1' : 'transparent', color: currentPlayer === 'BLACK' ? 'white' : 'inherit' }}>
          黒: {scores.BLACK}
        </div>
        <div style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: currentPlayer === 'WHITE' ? '#f56565' : 'transparent', color: currentPlayer === 'WHITE' ? 'white' : 'inherit' }}>
          白: {scores.WHITE}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.25rem', backgroundColor: '#2f855a', padding: '0.5rem', borderRadius: '0.375rem' }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isFlipping = flippingCells.some(([fr, fc]) => fr === r && fc === c);
            const moveInfo = validMoves.get(`${r},${c}`);
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#48bb78',
                  borderRadius: '0.125rem',
                  cursor: 'pointer',
                  position: 'relative',
                  perspective: '1000px',
                }}
                onClick={() => handleCellClick(r, c)}
              >
                {cell && (
                   <div
                   style={{
                     width: '83.3333%',
                     height: '83.3333%',
                     borderRadius: '9999px',
                     transition: 'transform 0.3s',
                     transformStyle: 'preserve-3d',
                     transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
                     backgroundColor: cell === 'BLACK' ? 'black' : 'white',
                   }}
                 />
                )}
                {moveInfo && (
                  <span style={{ position: 'absolute', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {moveInfo.length}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      {gameState === 'SKIPPED' && <div style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>{getOpponent(currentPlayer)}はパスしました。</div>}
      {winner && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>ゲーム終了</h2>
            <p style={{ fontSize: '1.25rem' }}>
              {winner === 'DRAW' ? '引き分け' : `${winner === 'BLACK' ? '黒' : '白'}の勝ち!`}
            </p>
            <button onClick={initializeGame} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4299e1', color: 'white', borderRadius: '0.25rem' }}>
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reversi;
