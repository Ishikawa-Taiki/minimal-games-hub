"use client";

import React, { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('O'); // Start with 'O'
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [winningLines, setWinningLines] = useState<number[][] | null>(null); // Changed to number[][]
  const [reachingLines, setReachingLines] = useState<{ index: number, player: Player }[]>([]);

  const linesToCheck = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Check for winner and winning lines
  const checkWinner = (currentBoard: Player[][]): { player: Player; lines: number[][] | null } => {
    const flatBoard = currentBoard.flat();
    const foundWinningLines: number[][] = [];
    let winningPlayer: Player = null;

    for (let i = 0; i < linesToCheck.length; i++) {
      const [a, b, c] = linesToCheck[i];
      if (flatBoard[a] && flatBoard[a] === flatBoard[b] && flatBoard[a] === flatBoard[c]) {
        foundWinningLines.push(linesToCheck[i]);
        winningPlayer = flatBoard[a];
      }
    }

    if (foundWinningLines.length > 0) {
      return { player: winningPlayer, lines: foundWinningLines };
    }
    return { player: null, lines: null };
  };

  // Check for draw
  const checkDraw = (currentBoard: Player[][]): boolean => {
    return currentBoard.flat().every((cell) => cell !== null);
  };

  // Check for reaching lines for both players
  const checkAllReachingLines = (currentBoard: Player[][]): { index: number, player: Player }[] => {
    const flatBoard = currentBoard.flat();
    const allReaching: { index: number, player: Player }[] = [];

    const players: Player[] = ['X', 'O'];

    for (const player of players) {
      for (let i = 0; i < linesToCheck.length; i++) {
        const line = linesToCheck[i];
        const cellsInLine = line.map((idx) => flatBoard[idx]);

        const emptyCells = cellsInLine.filter((cell) => cell === null).length;
        const currentPlayerCells = cellsInLine.filter((cell) => cell === player).length;
        const opponentCells = cellsInLine.filter((cell) => cell !== null && cell !== player).length;

        if (emptyCells === 1 && currentPlayerCells === 2 && opponentCells === 0) {
          // This line is a potential win for 'player'
          const emptyCellIndex = line.find((idx) => flatBoard[idx] === null);
          if (emptyCellIndex !== undefined) {
            allReaching.push({ index: emptyCellIndex, player: player });
          }
        }
      }
    }
    return allReaching;
  };

  useEffect(() => {
    const { player: currentWinner, lines: currentWinningLines } = checkWinner(board);
    if (currentWinner) {
      setWinner(currentWinner);
      setWinningLines(currentWinningLines);
      setReachingLines([]); // Winner found, clear reaching lines
    } else if (checkDraw(board)) {
      setIsDraw(true);
      setWinningLines(null); // Draw, clear winning lines
      setReachingLines([]); // Draw, clear reaching lines
    } else {
      // Update reaching lines for both players
      setReachingLines(checkAllReachingLines(board));
    }
  }, [board]);

  const handleClick = (row: number, col: number) => {
    if (board[row][col] === null && !winner && !isDraw) {
      const newBoard = board.map((r) => [...r]); // Deep copy
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setCurrentPlayer(currentPlayer === 'O' ? 'X' : 'O');
    }
  };

  const handleReset = () => {
    setBoard([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
    setCurrentPlayer('O');
    setWinner(null);
    setIsDraw(false);
    setWinningLines(null);
    setReachingLines([]);
  };

  const getStatus = () => {
    if (winner) {
      return `勝者: ${winner}`;
    } else if (isDraw) {
      return "引き分け！";
    } else {
      return `現在のプレイヤー: ${currentPlayer}`;
    }
  };

  const isBothPlayersReaching = (index: number): boolean => {
    const xReaching = reachingLines.some(rl => rl.index === index && rl.player === 'X');
    const oReaching = reachingLines.some(rl => rl.index === index && rl.player === 'O');
    return xReaching && oReaching;
  };

  const getCellBackgroundColor = (index: number) => {
    if (winningLines && winningLines.some(line => line.includes(index))) {
      return '#dcfce7'; // 薄い緑
    } else if (isBothPlayersReaching(index)) {
      return '#fecaca'; // 薄い赤
    } else if (reachingLines.some(rl => rl.index === index)) {
      return '#fef9c3'; // 薄い黄
    }
    return '#ffffff'; // デフォルト
  };

  const getReachingPlayerMark = (index: number): Player => {
    const reaching = reachingLines.find(rl => rl.index === index);
    return reaching ? reaching.player : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>○×ゲーム</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', backgroundColor: '#d1d5db', padding: '4px', borderRadius: '8px' }}>
        {board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const reachingPlayerMark = getReachingPlayerMark(index);

          return (
            <button
              key={`${row}-${col}`}
              style={{
                width: '80px',
                height: '80px',
                border: '1px solid #9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                backgroundColor: getCellBackgroundColor(index),
                cursor: 'pointer',
                position: 'relative', // For positioning the faint mark
                color: '#000000', // Set text color to black
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!winner || isDraw} // Disable clicked cells and when game ends
            >
              {cell ? cell : (
                reachingPlayerMark && !isBothPlayersReaching(index) && (
                  <span style={{ position: 'absolute', color: 'rgba(0, 0, 0, 0.1)' }}>
                    {reachingPlayerMark}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>{getStatus()}</p>
      <button
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={handleReset}
      >
        ゲームをリセット
      </button>
    </div>
  );
};

export default TicTacToe;
