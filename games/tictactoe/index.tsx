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

  // Check for winner
  const checkWinner = (currentBoard: Player[][]): Player => {
    const lines = [
      // Rows
      [currentBoard[0][0], currentBoard[0][1], currentBoard[0][2]],
      [currentBoard[1][0], currentBoard[1][1], currentBoard[1][2]],
      [currentBoard[2][0], currentBoard[2][1], currentBoard[2][2]],
      // Columns
      [currentBoard[0][0], currentBoard[1][0], currentBoard[2][0]],
      [currentBoard[0][1], currentBoard[1][1], currentBoard[2][1]],
      [currentBoard[0][2], currentBoard[1][2], currentBoard[2][2]],
      // Diagonals
      [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]],
      [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (a && a === b && a === c) {
        return a;
      }
    }
    return null;
  };

  // Check for draw
  const checkDraw = (currentBoard: Player[][]): boolean => {
    return currentBoard.flat().every((cell) => cell !== null);
  };

  useEffect(() => {
    const currentWinner = checkWinner(board);
    if (currentWinner) {
      setWinner(currentWinner);
    } else if (checkDraw(board)) {
      setIsDraw(true);
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
  };

  const getStatus = () => {
    if (winner) {
      return `Winner: ${winner}`;
    } else if (isDraw) {
      return "Draw!";
    } else {
      return `Current Player: ${currentPlayer}`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Tic Tac Toe</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', backgroundColor: '#d1d5db', padding: '4px', borderRadius: '8px' }}>
        {board.flat().map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
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
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={() => handleClick(row, col)}
              disabled={!!cell || !!winner || isDraw} // Disable clicked cells and when game ends
            >
              {cell}
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
        Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;
