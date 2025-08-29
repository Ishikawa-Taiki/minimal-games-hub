export type Player = 'PLAYER1' | 'PLAYER2';
export type CellState = Player | null;
export type Board = CellState[][];
export type WinCondition = 'standard' | 'five_captures' | 'total_capture';
export type Difficulty = 'easy' | 'normal' | 'hard';

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
  difficulty: Difficulty;
}

const BOARD_SIZE = 9;

export function createInitialState(difficulty: Difficulty = 'normal'): GameState {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  const piecesCount: { [key in Difficulty]: number } = {
    easy: 5,
    normal: 7,
    hard: 9,
  };
  const numPieces = piecesCount[difficulty];
  const startCol = Math.floor((BOARD_SIZE - numPieces) / 2);

  for (let i = 0; i < numPieces; i++) {
    const c = startCol + i;
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
    difficulty,
  };
}

export function setWinCondition(currentState: GameState, winCondition: WinCondition): GameState {
  const initialBoard = createInitialState(currentState.difficulty).board;
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

function getCapturesAfterMove(board: Board, player: Player, toR: number, toC: number): [number, number][] {
  const opponent = getOpponent(player);
  const captured: [number, number][] = [];
  const directions = [
    { r: 0, c: 1 }, { r: 0, c: -1 }, { r: 1, c: 0 }, { r: -1, c: 0 }
  ];

  for (const dir of directions) {
    const lineOfSight: [number, number][] = [];
    const potentialCaptures: [number, number][] = [];
    let r = toR + dir.r;
    let c = toC + dir.c;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      const currentPiece = board[r][c];
      if (currentPiece === null) break;
      if (currentPiece === player) {
        captured.push(...potentialCaptures);
        break;
      }
      if (currentPiece === opponent) {
        potentialCaptures.push([r, c]);
      }
      r += dir.r;
      c += dir.c;
    }
  }

  // Check for captures created by the other piece of the sandwich
  for (const dir of directions) {
      let r = toR + dir.r;
      let c = toC + dir.c;
      const opponentPieces: [number, number][] = [];

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          const currentPiece = board[r][c];
          if (currentPiece === null) break;
          if (currentPiece === player) {
              // Found the other friendly piece, capture opponent pieces in between
              captured.push(...opponentPieces);
              break;
          }
          if (currentPiece === opponent) {
              opponentPieces.push([r, c]);
          } else {
              // Other player's piece blocks, so no capture
              break;
          }
          r += dir.r;
          c += dir.c;
      }
  }

  return captured;
}


function getGroupCapturesAfterMove(board: Board, player: Player, toR: number, toC: number): [number, number][] {
    const opponent = getOpponent(player);
    const capturedGroups: [number, number][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    const visited: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));

    for (const [dr, dc] of directions) {
        const nr = toR + dr;
        const nc = toC + dc;

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === opponent && !visited[nr][nc]) {
            const group: [number, number][] = [];
            const queue: [number, number][] = [[nr, nc]];
            visited[nr][nc] = true;
            const liberties = new Set<string>();
            let head = 0;

            while (head < queue.length) {
                const [curR, curC] = queue[head++];
                group.push([curR, curC]);

                for (const [gr, gc] of directions) {
                    const nnr = curR + gr;
                    const nnc = curC + gc;

                    if (nnr >= 0 && nnr < BOARD_SIZE && nnc >= 0 && nnc < BOARD_SIZE) {
                        if (board[nnr][nnc] === opponent) {
                            if (!visited[nnr][nnc]) {
                                visited[nnr][nnc] = true;
                                queue.push([nnr, nnc]);
                            }
                        } else if (board[nnr][nnc] === null) {
                            liberties.add(`${nnr},${nnc}`);
                        }
                    }
                }
            }
            if (liberties.size === 0) {
                capturedGroups.push(...group);
            }
        }
    }
    return capturedGroups;
}

function simulateMove(board: Board, player: Player, fromR: number, fromC: number, toR: number, toC: number): { newBoard: Board, captured: [number, number][] } {
  const tempBoard = board.map(row => [...row]);
  tempBoard[toR][toC] = player;
  tempBoard[fromR][fromC] = null;

  const sandwichCaptures = getCapturesAfterMove(tempBoard, player, toR, toC);
  const groupCaptures = getGroupCapturesAfterMove(tempBoard, player, toR, toC);
  const captured = [...sandwichCaptures, ...groupCaptures];

  const uniqueCaptureStrings = new Set(captured.map(p => `${p[0]},${p[1]}`));
  const uniqueCaptures = Array.from(uniqueCaptureStrings).map(s => s.split(',').map(Number) as [number, number]);

  uniqueCaptures.forEach(([r, c]) => {
    tempBoard[r][c] = null;
  });

  return { newBoard: tempBoard, captured: uniqueCaptures };
}

function isMoveUnsafe(board: Board, player: Player, fromR: number, fromC: number, toR: number, toC: number): boolean {
  const { newBoard } = simulateMove(board, player, fromR, fromC, toR, toC);
  const opponent = getOpponent(player);

  // Check if any opponent piece can now capture the moved piece
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === opponent) {
        // Find all possible moves for this opponent piece
        for (let nr = 0; nr < BOARD_SIZE; nr++) {
          for (let nc = 0; nc < BOARD_SIZE; nc++) {
            if (isPathClear(newBoard, r, c, nr, nc)) {
              // Simulate the opponent's move
              const { captured } = simulateMove(newBoard, opponent, r, c, nr, nc);
              if (captured.some(([cr, cc]) => cr === toR && cc === toC)) {
                return true; // The move is unsafe
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
    return { ...currentState, selectedPiece: { r, c }, validMoves, potentialCaptures };
  }

  if (selectedPiece) {
    const moveData = currentState.validMoves.get(`${r},${c}`);
    if (moveData) {
      const { newBoard, captured } = simulateMove(board, currentPlayer, selectedPiece.r, selectedPiece.c, r, c);
      const newCapturedCount = { ...currentState.capturedPieces };
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

  return { ...currentState, selectedPiece: null, validMoves: new Map(), potentialCaptures: [] };
}
