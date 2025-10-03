export type Player = 'PLAYER1' | 'PLAYER2';
export type CellState = Player | null;
export type Board = CellState[][];
export type WinCondition = 'standard' | 'five_captures' | 'total_capture';

export interface Move {
  captures: [number, number][];
  isUnsafe: boolean;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: 'PLAYING' | 'GAME_OVER';
  winner: Player | null;
  selectedPiece: { r: number; c: number } | null;
  validMoves: Map<string, Move>;
  potentialCaptures: [number, number][];
  capturedPieces: {
    PLAYER1: number;
    PLAYER2: number;
  };
  winCondition: WinCondition;
  lastMove: { from: { r: number; c: number }; to: { r: number; c: number } } | null;
  justCapturedPieces: [number, number][];
}

const BOARD_SIZE = 9;

export function createInitialState(): GameState {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  for (let i = 0; i < BOARD_SIZE; i++) {
    board[0][i] = 'PLAYER2';
    board[BOARD_SIZE - 1][i] = 'PLAYER1';
  }

  return {
    board,
    currentPlayer: 'PLAYER1',
    gameStatus: 'PLAYING',
    winner: null,
    selectedPiece: null,
    validMoves: new Map(),
    potentialCaptures: [],
    capturedPieces: { PLAYER1: 0, PLAYER2: 0 },
    winCondition: 'standard',
    lastMove: null,
    justCapturedPieces: [],
  };
}

export function setWinCondition(currentState: GameState, winCondition: WinCondition): GameState {
  const initialBoard = createInitialState().board;
  const isBoardInitial = currentState.board.every((row, r) =>
    row.every((cell, c) => cell === initialBoard[r][c])
  );

  if (currentState.capturedPieces.PLAYER1 > 0 || currentState.capturedPieces.PLAYER2 > 0 || !isBoardInitial) {
    return currentState;
  }
  return { ...createInitialState(), winCondition };
}

function getOpponent(player: Player): Player {
  return player === 'PLAYER1' ? 'PLAYER2' : 'PLAYER1';
}

function isPathClear(board: Board, fromR: number, fromC: number, toR: number, toC: number): boolean {
  if (board[toR][toC] !== null) return false;
  if (fromR === toR) {
    const step = toC > fromC ? 1 : -1;
    for (let c = fromC + step; c !== toC; c += step) {
      if (board[fromR][c] !== null) return false;
    }
    return true;
  } else if (fromC === toC) {
    const step = toR > fromR ? 1 : -1;
    for (let r = fromR + step; r !== toR; r += step) {
      if (board[r][fromC] !== null) return false;
    }
    return true;
  }
  return false;
}

function getCapturesAfterMove(
  board: Board,
  player: Player,
  toR: number,
  toC: number,
): [number, number][] {
  const opponent = getOpponent(player);
  const allCaptures: [number, number][] = [];
  const axes = [
    { r: 1, c: 0 }, // Vertical
    { r: 0, c: 1 }, // Horizontal
  ];

  for (const axis of axes) {
    const line: (CellState | null)[] = [];
    let start;

    if (axis.r === 1) { // Vertical check
      for (let i = 0; i < BOARD_SIZE; i++) line.push(board[i][toC]);
      start = toR;
    } else { // Horizontal check
      for (let i = 0; i < BOARD_SIZE; i++) line.push(board[toR][i]);
      start = toC;
    }

    // Scan forward
    const forwardCaptures: [number, number][] = [];
    for (let i = start + 1; i < BOARD_SIZE; i++) {
      if (line[i] === opponent) {
        forwardCaptures.push(axis.r === 1 ? [i, toC] : [toR, i]);
      } else if (line[i] === player) {
        allCaptures.push(...forwardCaptures);
        break;
      } else {
        break;
      }
    }

    // Scan backward
    const backwardCaptures: [number, number][] = [];
    for (let i = start - 1; i >= 0; i--) {
      if (line[i] === opponent) {
        backwardCaptures.push(axis.r === 1 ? [i, toC] : [toR, i]);
      } else if (line[i] === player) {
        allCaptures.push(...backwardCaptures);
        break;
      } else {
        break;
      }
    }
  }

  return Array.from(new Set(allCaptures.map(p => `${p[0]},${p[1]}`))).map(s => s.split(',').map(Number) as [number, number]);
}

function getGroupCaptures(board: Board, player: Player): [number, number][] {
    const opponent = getOpponent(player);
    const capturedGroups: [number, number][] = [];
    const visited: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === opponent && !visited[r][c]) {
                const group: [number, number][] = [];
                const queue: [number, number][] = [[r, c]];
                visited[r][c] = true;
                let hasLiberty = false;

                let head = 0;
                while(head < queue.length) {
                    const [curR, curC] = queue[head++];
                    group.push([curR, curC]);

                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (const [dr, dc] of directions) {
                        const nr = curR + dr;
                        const nc = curC + dc;

                        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
                            continue;
                        }

                        if (board[nr][nc] === null) {
                            hasLiberty = true;
                            break;
                        }

                        if (board[nr][nc] === opponent && !visited[nr][nc]) {
                            visited[nr][nc] = true;
                            queue.push([nr, nc]);
                        }
                    }
                    if (hasLiberty) break;
                }

                if (!hasLiberty) {
                    capturedGroups.push(...group);
                }
            }
        }
    }
    return capturedGroups;
}

function getCornerCaptures(board: Board, player: Player): [number, number][] {
  const opponent = getOpponent(player);
  const captures: [number, number][] = [];
  const corners = [
    { r: 0, c: 0, adjs: [[0, 1], [1, 0]] },
    { r: 0, c: 8, adjs: [[0, 7], [1, 8]] },
    { r: 8, c: 0, adjs: [[7, 0], [8, 1]] },
    { r: 8, c: 8, adjs: [[7, 8], [8, 7]] },
  ];
  for (const corner of corners) {
    if (board[corner.r][corner.c] === opponent) {
      const [adj1, adj2] = corner.adjs;
      if (board[adj1[0]][adj1[1]] === player && board[adj2[0]][adj2[1]] === player) {
        captures.push([corner.r, corner.c]);
      }
    }
  }
  return captures;
}

function simulateMove(
  board: Board,
  player: Player,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
): { newBoard: Board; captured: [number, number][] } {
  // 1. Create the board state after the move.
  const boardAfterMove = board.map(row => [...row]);
  boardAfterMove[toR][toC] = player;
  boardAfterMove[fromR][fromC] = null;

  // 2. Calculate all captures based on this new state.
  const moveCaptures = getCapturesAfterMove(boardAfterMove, player, toR, toC);
  const groupCaptures = getGroupCaptures(boardAfterMove, player);
  const cornerCaptures = getCornerCaptures(boardAfterMove, player);

  const allCaptures = [...moveCaptures, ...groupCaptures, ...cornerCaptures];
  const uniqueCaptures = Array.from(new Set(allCaptures.map(p => `${p[0]},${p[1]}`))).map(s =>
    s.split(',').map(Number)
  ) as [number, number][];

  // 3. Create the final board by removing all captured pieces.
  const finalBoard = boardAfterMove.map(row => [...row]);
  uniqueCaptures.forEach(([r, c]) => {
    finalBoard[r][c] = null;
  });

  return { newBoard: finalBoard, captured: uniqueCaptures };
}

function isMoveUnsafe(
  board: Board,
  player: Player,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
): boolean {
  const { newBoard } = simulateMove(board, player, fromR, fromC, toR, toC);
  const opponent = getOpponent(player);

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === opponent) {
        for (let nr = 0; nr < BOARD_SIZE; nr++) {
          for (let nc = 0; nc < BOARD_SIZE; nc++) {
            if (isPathClear(newBoard, r, c, nr, nc)) {
              const { captured } = simulateMove(newBoard, opponent, r, c, nr, nc);
              if (captured.some(([capR, capC]) => capR === toR && capC === toC)) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function checkWinCondition(
  board: Board,
  capturedPieces: { PLAYER1: number; PLAYER2: number },
  winCondition: WinCondition,
): Player | null {
  const p1PiecesCapturedByP2 = capturedPieces.PLAYER1;
  const p2PiecesCapturedByP1 = capturedPieces.PLAYER2;

  switch (winCondition) {
    case 'standard':
      if (p2PiecesCapturedByP1 >= 5) return 'PLAYER1';
      if (p1PiecesCapturedByP2 >= 5) return 'PLAYER2';
      if (p2PiecesCapturedByP1 >= 3 && (p2PiecesCapturedByP1 - p1PiecesCapturedByP2 >= 3)) return 'PLAYER1';
      if (p1PiecesCapturedByP2 >= 3 && (p1PiecesCapturedByP2 - p2PiecesCapturedByP1 >= 3)) return 'PLAYER2';
      break;
    case 'five_captures':
      if (p2PiecesCapturedByP1 >= 5) return 'PLAYER1';
      if (p1PiecesCapturedByP2 >= 5) return 'PLAYER2';
      break;
    case 'total_capture': {
      let p1Count = 0;
      let p2Count = 0;
      for(let r=0; r<BOARD_SIZE; r++) {
        for(let c=0; c<BOARD_SIZE; c++) {
          if (board[r][c] === 'PLAYER1') p1Count++;
          if (board[r][c] === 'PLAYER2') p2Count++;
        }
      }
      if (p2Count <= 1) return 'PLAYER1';
      if (p1Count <= 1) return 'PLAYER2';
      break;
    }
  }

  return null;
}

export function handleCellClick(currentState: GameState, r: number, c: number): GameState {
  const { board, currentPlayer, gameStatus, selectedPiece } = currentState;
  if (gameStatus === 'GAME_OVER') return currentState;

  if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
    return { ...currentState, selectedPiece: null, validMoves: new Map(), potentialCaptures: [], lastMove: null, justCapturedPieces: [] };
  }

  if (board[r][c] === currentPlayer) {
    const validMoves = new Map<string, Move>();
    const captureSet = new Set<string>();

    for (let toR = 0; toR < BOARD_SIZE; toR++) {
      for (let toC = 0; toC < BOARD_SIZE; toC++) {
        if (isPathClear(board, r, c, toR, toC)) {
          const { captured } = simulateMove(board, currentPlayer, r, c, toR, toC);
          const unsafe = isMoveUnsafe(board, currentPlayer, r, c, toR, toC);
          validMoves.set(`${toR},${toC}`, { captures: captured, isUnsafe: unsafe });
          captured.forEach(cap => captureSet.add(`${cap[0]},${cap[1]}`));
        }
      }
    }
    const potentialCaptures = Array.from(captureSet).map(s => s.split(',').map(Number) as [number, number]);
    return { ...currentState, selectedPiece: { r, c }, validMoves, potentialCaptures, lastMove: null, justCapturedPieces: [] };
  }

  if (selectedPiece) {
    const moveData = currentState.validMoves.get(`${r},${c}`);
    if (moveData) {
      const { newBoard, captured } = simulateMove(
        board,
        currentPlayer,
        selectedPiece.r,
        selectedPiece.c,
        r,
        c,
      );
      const newCapturedCount = { ...currentState.capturedPieces };
      if (currentPlayer === 'PLAYER1') {
        newCapturedCount.PLAYER2 += captured.length;
      } else {
        newCapturedCount.PLAYER1 += captured.length;
      }

      const winner = checkWinCondition(newBoard, newCapturedCount, currentState.winCondition);

      const nextState: GameState = {
        ...currentState,
        board: newBoard,
        capturedPieces: newCapturedCount,
        currentPlayer: getOpponent(currentPlayer),
        selectedPiece: null,
        validMoves: new Map(),
        potentialCaptures: [],
        gameStatus: winner ? 'GAME_OVER' : 'PLAYING',
        winner,
        lastMove: { from: selectedPiece, to: { r, c } },
        justCapturedPieces: captured,
      };
      return nextState;
    }
  }

  return { ...currentState, selectedPiece: null, validMoves: new Map(), potentialCaptures: [], lastMove: null, justCapturedPieces: [] };
}