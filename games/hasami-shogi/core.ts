export type Player = 'PLAYER1' | 'PLAYER2';
export type CellState = Player | null;
export type Board = CellState[][];

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
    PLAYER1: number;
    PLAYER2: number;
  };
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
  };
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

function simulateMove(board: Board, player: Player, fromR: number, fromC: number, toR: number, toC: number): { newBoard: Board, captured: [number, number][] } {
  const tempBoard = board.map(row => [...row]);
  tempBoard[toR][toC] = player;
  tempBoard[fromR][fromC] = null;
  const captured: [number, number][] = [];

  // Horizontal capture check
  const row = tempBoard[toR];
  const hCaptures = getCapturesOnLine(row, player);
  hCaptures.forEach(c => {
    if (tempBoard[toR][c] !== null) {
      captured.push([toR, c]);
      tempBoard[toR][c] = null;
    }
  });

  // Vertical capture check
  const col = tempBoard.map(r => r[toC]);
  const vCaptures = getCapturesOnLine(col, player);
  vCaptures.forEach(r => {
    if (tempBoard[r][toC] !== null) {
      captured.push([r, toC]);
      tempBoard[r][toC] = null;
    }
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

function checkWinCondition(board: Board): Player | null {
  let p1Pieces = 0;
  let p2Pieces = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell === 'PLAYER1') p1Pieces++;
    else if (cell === 'PLAYER2') p2Pieces++;
  }));
  if (p2Pieces <= 1) return 'PLAYER1';
  if (p1Pieces <= 1) return 'PLAYER2';
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
      if (currentPlayer === 'PLAYER1') newCapturedCount.PLAYER2 += captured.length;
      else newCapturedCount.PLAYER1 += captured.length;

      const winner = checkWinCondition(newBoard);
      return {
        ...currentState,
        board: newBoard,
        currentPlayer: getOpponent(currentPlayer),
        selectedPiece: null,
        validMoves: new Map(),
        potentialCaptures: [],
        gameStatus: winner ? 'GAME_OVER' : 'PLAYING',
        winner,
        capturedPieces: newCapturedCount,
      };
    }
  }

  // 3. Invalid click or deselecting
  return { ...currentState, selectedPiece: null, validMoves: new Map(), potentialCaptures: [] };
}
