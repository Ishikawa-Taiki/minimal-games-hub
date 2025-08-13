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
  potentialCaptures: [number, number][]; // All pieces that could be captured by the selected piece
  capturedPieces: {
    PLAYER1: number; // Number of P1 pieces captured by P2
    PLAYER2: number; // Number of P2 pieces captured by P1
  };
  winCondition: WinCondition;
}

const BOARD_SIZE = 9;

export function createInitialState(): GameState {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[0][c] = 'PLAYER2';
    board[BOARD_SIZE - 1][c] = 'PLAYER1';
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
  };
}

export function setWinCondition(currentState: GameState, winCondition: WinCondition): GameState {
  // Can only change win condition at the start of the game, which we determine by checking if any pieces have moved
  // from their initial positions or if any pieces have been captured.
  const initialBoard = createInitialState().board;
  const isBoardInitial = currentState.board.every((row, r) =>
    row.every((cell, c) => cell === initialBoard[r][c])
  );

  if (currentState.capturedPieces.PLAYER1 > 0 || currentState.capturedPieces.PLAYER2 > 0 || !isBoardInitial) {
    return currentState;
  }
  return { ...currentState, winCondition };
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

/**
 * Scans a single line (row or column) and returns the indices of captured pieces.
 */
function getCapturesOnLine(line: CellState[], player: Player): number[] {
  const opponent = getOpponent(player);
  const capturedIndices = new Set<number>();
  const friendlyIndices = line.map((p, i) => p === player ? i : -1).filter(i => i !== -1);

  for (let i = 0; i < friendlyIndices.length; i++) {
    for (let j = i + 1; j < friendlyIndices.length; j++) {
      const start = friendlyIndices[i];
      const end = friendlyIndices[j];
      if (end > start + 1) {
        const between = line.slice(start + 1, end);
        if (between.length > 0 && between.every(p => p === opponent)) {
          for (let k = start + 1; k < end; k++) {
            capturedIndices.add(k);
          }
        }
      }
    }
  }
  return Array.from(capturedIndices);
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
        const liberties = new Set<string>();

        let head = 0;
        while (head < queue.length) {
          const [curR, curC] = queue[head++];
          group.push([curR, curC]);

          const neighbors = [[curR - 1, curC], [curR + 1, curC], [curR, curC - 1], [curR, curC + 1]];
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              if (board[nr][nc] === opponent) {
                if (!visited[nr][nc]) {
                  visited[nr][nc] = true;
                  queue.push([nr, nc]);
                }
              } else if (board[nr][nc] === null) {
                liberties.add(`${nr},${nc}`);
              }
            }
          }
        }

        if (liberties.size === 0) {
          capturedGroups.push(...group);
        }
      }
    }
  }
  return capturedGroups;
}

function getAllCaptures(board: Board, player: Player): [number, number][] {
  const opponent = getOpponent(player);
  const capturedPieces: [number, number][] = [];
  const boardSize = board.length;

  // 1. Standard "sandwich" capture
  for (let r = 0; r < boardSize; r++) {
    const row = board[r];
    const hCaptures = getCapturesOnLine(row, player);
    hCaptures.forEach(c => {
        if(board[r][c] === opponent) {
            capturedPieces.push([r, c]);
        }
    });
  }
  for (let c = 0; c < boardSize; c++) {
    const col = board.map(row => row[c]);
    const vCaptures = getCapturesOnLine(col, player);
    vCaptures.forEach(r => {
        if(board[r][c] === opponent) {
            capturedPieces.push([r, c]);
        }
    });
  }

  // 2. Group capture (handles edge/corner cases as well)
  const groupCaptures = getGroupCaptures(board, player);
  capturedPieces.push(...groupCaptures);

  const uniqueCaptureStrings = new Set(capturedPieces.map(p => `${p[0]},${p[1]}`));
  return Array.from(uniqueCaptureStrings).map(s => s.split(',').map(Number) as [number, number]);
}

function simulateMove(board: Board, player: Player, fromR: number, fromC: number, toR: number, toC: number): { newBoard: Board, captured: [number, number][] } {
  const tempBoard = board.map(row => [...row]);
  tempBoard[toR][toC] = player;
  tempBoard[fromR][fromC] = null;

  const captured = getAllCaptures(tempBoard, player);

  captured.forEach(([r, c]) => {
    tempBoard[r][c] = null;
  });

  return { newBoard: tempBoard, captured };
}

function isMoveUnsafe(board: Board, player: Player, fromR: number, fromC: number, toR: number, toC: number): boolean {
  const { newBoard } = simulateMove(board, player, fromR, fromC, toR, toC);
  const opponent = getOpponent(player);

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === opponent) {
        for (let nr = 0; nr < BOARD_SIZE; nr++) {
          for (let nc = 0; nc < BOARD_SIZE; nc++) {
            if (isPathClear(newBoard, r, c, nr, nc)) {
              const { captured } = simulateMove(newBoard, opponent, r, c, nr, nc);
              if (captured.some(([cr, cc]) => cr === toR && cc === toC)) {
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

function checkWinCondition(state: GameState): Player | null {
  const { capturedPieces, winCondition, board } = state;
  // `capturedPieces.PLAYER1` is the number of P1's pieces captured by P2.
  // `capturedPieces.PLAYER2` is the number of P2's pieces captured by P1.
  const p1PiecesCapturedByP2 = capturedPieces.PLAYER1;
  const p2PiecesCapturedByP1 = capturedPieces.PLAYER2;

  switch (winCondition) {
    case 'standard':
      if (p2PiecesCapturedByP1 >= 5) return 'PLAYER1';
      if (p1PiecesCapturedByP2 >= 5) return 'PLAYER2';
      if (p2PiecesCapturedByP1 - p1PiecesCapturedByP2 >= 3) return 'PLAYER1';
      if (p1PiecesCapturedByP2 - p2PiecesCapturedByP1 >= 3) return 'PLAYER2';
      break;
    case 'five_captures':
      if (p2PiecesCapturedByP1 >= 5) return 'PLAYER1';
      if (p1PiecesCapturedByP2 >= 5) return 'PLAYER2';
      break;
    case 'total_capture': {
      let p1PiecesOnBoard = 0;
      let p2PiecesOnBoard = 0;
      board.forEach(row => row.forEach(cell => {
        if (cell === 'PLAYER1') p1PiecesOnBoard++;
        else if (cell === 'PLAYER2') p2PiecesOnBoard++;
      }));
      if (p2PiecesOnBoard <= 1) return 'PLAYER1';
      if (p1PiecesOnBoard <= 1) return 'PLAYER2';
      break;
    }
  }

  return null;
}

export function handleCellClick(currentState: GameState, r: number, c: number): GameState {
  const { board, currentPlayer, gameStatus, selectedPiece } = currentState;
  if (gameStatus === 'GAME_OVER') return currentState;

  // 1. Selecting a piece
  if (board[r][c] === currentPlayer) {
    const validMoves = new Map<string, Move>();
    const captureSet = new Set<string>();

    for (let toR = 0; toR < BOARD_SIZE; toR++) {
      for (let toC = 0; toC < BOARD_SIZE; toC++) {
        if (isPathClear(board, r, c, toR, toC)) {
          const { captured } = simulateMove(board, currentPlayer, r, c, toR, toC);
          const unsafe = isMoveUnsafe(board, currentPlayer, r, c, toR, toC);
          validMoves.set(`${toR},${toC}`, { captures: captured, isUnsafe: unsafe });
          // Aggregate all potential captures
          captured.forEach(cap => captureSet.add(`${cap[0]},${cap[1]}`));
        }
      }
    }
    const potentialCaptures = Array.from(captureSet).map(s => s.split(',').map(Number) as [number, number]);
    return { ...currentState, selectedPiece: { r, c }, validMoves, potentialCaptures };
  }

  // 2. Making a move
  if (selectedPiece) {
    const moveData = currentState.validMoves.get(`${r},${c}`);
    if (moveData) {
      const { newBoard, captured } = simulateMove(board, currentPlayer, selectedPiece.r, selectedPiece.c, r, c);
      const newCapturedCount = { ...currentState.capturedPieces };
      // If P1 moves, they capture P2's pieces, so increment count of captured P2 pieces.
      if (currentPlayer === 'PLAYER1') newCapturedCount.PLAYER2 += captured.length;
      else newCapturedCount.PLAYER1 += captured.length;

      const tempState: GameState = {
        ...currentState,
        board: newBoard,
        capturedPieces: newCapturedCount,
      };
      const winner = checkWinCondition(tempState);
      return {
        ...tempState,
        currentPlayer: getOpponent(currentPlayer),
        selectedPiece: null,
        validMoves: new Map(),
        potentialCaptures: [],
        gameStatus: winner ? 'GAME_OVER' : 'PLAYING',
        winner,
      };
    }
  }

  // 3. Invalid click or deselecting
  return { ...currentState, selectedPiece: null, validMoves: new Map(), potentialCaptures: [] };
}
