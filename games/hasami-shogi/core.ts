export type Player = 'PLAYER1' | 'PLAYER2';
export type CellState = Player | null;
export type Board = CellState[][];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: 'PLAYING' | 'GAME_OVER';
  winner: Player | null;
  selectedPiece: { r: number; c: number } | null;
  capturedPieces: {
    PLAYER1: number;
    PLAYER2: number;
  };
}

const BOARD_SIZE = 9;

/**
 * Creates the initial state for a new game of Hasami Shogi.
 */
export function createInitialState(): GameState {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  // Place Player 1's pieces on the top row
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[0][c] = 'PLAYER1';
  }

  // Place Player 2's pieces on the bottom row
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[BOARD_SIZE - 1][c] = 'PLAYER2';
  }

  return {
    board,
    currentPlayer: 'PLAYER1',
    gameStatus: 'PLAYING',
    winner: null,
    selectedPiece: null,
    capturedPieces: {
      PLAYER1: 0,
      PLAYER2: 0,
    },
  };
}

/**
 * Gets the opponent of the current player.
 */
function getOpponent(player: Player): Player {
  return player === 'PLAYER1' ? 'PLAYER2' : 'PLAYER1';
}

/**
 * Checks if a move from (fromR, fromC) to (toR, toC) is valid.
 * A move is valid if it's along a row or column with no pieces in between.
 */
export function isValidMove(board: Board, fromR: number, fromC: number, toR: number, toC: number): boolean {
  if (board[toR][toC] !== null) {
    return false; // Cannot move to an occupied square
  }

  if (fromR === toR) { // Horizontal move
    const step = toC > fromC ? 1 : -1;
    for (let c = fromC + step; c !== toC; c += step) {
      if (board[fromR][c] !== null) {
        return false; // Path is blocked
      }
    }
    return true;
  } else if (fromC === toC) { // Vertical move
    const step = toR > fromR ? 1 : -1;
    for (let r = fromR + step; r !== toR; r += step) {
      if (board[r][fromC] !== null) {
        return false; // Path is blocked
      }
    }
    return true;
  }

  return false; // Not a valid horizontal or vertical move
}

/**
 * Checks for and removes captured pieces after a move.
 */
function checkAndCapture(board: Board, player: Player, r: number, c: number): { newBoard: Board; capturedCount: number } {
  const opponent = getOpponent(player);
  let capturedCount = 0;
  const newBoard = board.map(row => [...row]);

  // Directions: [dr, dc]
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of DIRS) {
    const piecesToCapture: [number, number][] = [];
    let nr = r + dr;
    let nc = c + dc;

    // Scan for a line of opponent pieces
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && newBoard[nr][nc] === opponent) {
      piecesToCapture.push([nr, nc]);
      nr += dr;
      nc += dc;
    }

    // If the line is terminated by one of the current player's pieces, capture them
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && newBoard[nr][nc] === player) {
      for (const [pr, pc] of piecesToCapture) {
        newBoard[pr][pc] = null;
        capturedCount++;
      }
    }
  }

  return { newBoard, capturedCount };
}

/**
 * Checks if a player has won the game.
 * A player wins if the opponent has 1 or fewer pieces.
 */
function checkWinCondition(board: Board): Player | null {
  let player1Pieces = 0;
  let player2Pieces = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'PLAYER1') {
        player1Pieces++;
      } else if (board[r][c] === 'PLAYER2') {
        player2Pieces++;
      }
    }
  }

  if (player2Pieces <= 1) return 'PLAYER1';
  if (player1Pieces <= 1) return 'PLAYER2';
  return null;
}


/**
 * Handles a click on a cell, managing piece selection, movement, and capturing.
 */
export function handleCellClick(currentState: GameState, r: number, c: number): GameState {
  const { board, currentPlayer, gameStatus, selectedPiece, capturedPieces } = currentState;

  if (gameStatus === 'GAME_OVER') {
    return currentState;
  }

  // Case 1: No piece is selected, try to select one.
  if (!selectedPiece) {
    if (board[r][c] === currentPlayer) {
      return { ...currentState, selectedPiece: { r, c } };
    }
    return currentState; // Clicked on empty or opponent's piece
  }

  // Case 2: A piece is selected.
  // If clicking the same piece, deselect it.
  if (selectedPiece.r === r && selectedPiece.c === c) {
    return { ...currentState, selectedPiece: null };
  }

  // If clicking another of your own pieces, switch selection.
  if (board[r][c] === currentPlayer) {
    return { ...currentState, selectedPiece: { r, c } };
  }

  // Try to move the selected piece to the clicked cell (r, c).
  if (isValidMove(board, selectedPiece.r, selectedPiece.c, r, c)) {
    // Create a new board with the moved piece
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    newBoard[selectedPiece.r][selectedPiece.c] = null;

    // Check for captures
    const { newBoard: boardAfterCapture, capturedCount } = checkAndCapture(newBoard, currentPlayer, r, c);

    const newCapturedPieces = { ...capturedPieces };
    if (currentPlayer === 'PLAYER1') {
      newCapturedPieces.PLAYER2 += capturedCount;
    } else {
      newCapturedPieces.PLAYER1 += capturedCount;
    }

    // Check for win condition
    const winner = checkWinCondition(boardAfterCapture);
    const newGameStatus = winner ? 'GAME_OVER' : 'PLAYING';

    return {
      ...currentState,
      board: boardAfterCapture,
      currentPlayer: getOpponent(currentPlayer),
      selectedPiece: null,
      gameStatus: newGameStatus,
      winner,
      capturedPieces: newCapturedPieces,
    };
  }

  // If the move is invalid, deselect the piece for a better user experience.
  return { ...currentState, selectedPiece: null };
}
