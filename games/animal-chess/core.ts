// =============================================================================
// Constants and Types
// =============================================================================

export const BOARD_ROWS = 4;
export const BOARD_COLS = 3;

export enum Player {
  SENTE = 0, // Player 1 (starts at the bottom)
  GOTE = 1,  // Player 2 (starts at the top)
}

export enum PieceType {
  LION = 'L',
  GIRAFFE = 'K', // Kirin
  ELEPHANT = 'Z', // Zou
  CHICK = 'H',    // Hiyoko
  ROOSTER = 'N',  // Niwatori (Promoted Chick)
}

export interface Piece {
  type: PieceType;
  owner: Player;
}

export type Cell = Piece | null;
export type Board = Cell[][];
export type CapturedPieces = { [key in Player]: PieceType[] };

export interface GameState {
  board: Board;
  currentPlayer: Player;
  capturedPieces: CapturedPieces;
  status: 'playing' | 'sente_win' | 'gote_win';
  selectedCell: { row: number; col: number } | null;
  selectedCaptureIndex: { player: Player; index: number } | null;
}

// Movement vectors [row, col] relative to the piece owner (SENTE)
const MOVES: { [key in PieceType]: [number, number][] } = {
  [PieceType.LION]:    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  [PieceType.GIRAFFE]: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  [PieceType.ELEPHANT]:[[-1, -1], [-1, 1], [1, -1], [1, 1]],
  [PieceType.CHICK]:   [[-1, 0]],
  [PieceType.ROOSTER]: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
};

// =============================================================================
// Initial State
// =============================================================================

export function createInitialState(): GameState {
  const board: Board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  // Player 2 (GOTE)
  board[0][0] = { type: PieceType.GIRAFFE, owner: Player.GOTE };
  board[0][1] = { type: PieceType.LION, owner: Player.GOTE };
  board[0][2] = { type: PieceType.ELEPHANT, owner: Player.GOTE };
  board[1][1] = { type: PieceType.CHICK, owner: Player.GOTE };

  // Player 1 (SENTE)
  board[3][0] = { type: PieceType.ELEPHANT, owner: Player.SENTE };
  board[3][1] = { type: PieceType.LION, owner: Player.SENTE };
  board[3][2] = { type: PieceType.GIRAFFE, owner: Player.SENTE };
  board[2][1] = { type: PieceType.CHICK, owner: Player.SENTE };

  return {
    board,
    currentPlayer: Player.SENTE,
    capturedPieces: {
      [Player.SENTE]: [],
      [Player.GOTE]: [],
    },
    status: 'playing',
    selectedCell: null,
    selectedCaptureIndex: null,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function isOutOfBounds(row: number, col: number): boolean {
  return row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS;
}

function getOpponent(player: Player): Player {
  return player === Player.SENTE ? Player.GOTE : Player.SENTE;
}

function getPieceMoves(piece: Piece): [number, number][] {
    const moves = MOVES[piece.type];
    if (piece.owner === Player.GOTE) {
        // Invert row direction for GOTE player
        return moves.map(([r, c]) => [-r, c]);
    }
    return moves;
}

// =============================================================================
// Core Logic Functions
// =============================================================================

export function getValidMoves(state: GameState, fromRow: number, fromCol: number): { row: number, col: number }[] {
  const piece = state.board[fromRow][fromCol];
  if (!piece || piece.owner !== state.currentPlayer) return [];

  const validMoves: { row: number, col: number }[] = [];
  const moves = getPieceMoves(piece);

  for (const [dr, dc] of moves) {
    const toRow = fromRow + dr;
    const toCol = fromCol + dc;

    if (isOutOfBounds(toRow, toCol)) continue;

    const destinationCell = state.board[toRow][toCol];
    if (destinationCell && destinationCell.owner === state.currentPlayer) {
      continue; // Cannot capture own piece
    }
    validMoves.push({ row: toRow, col: toCol });
  }

  return validMoves;
}

export function getValidDrops(state: GameState, player: Player): { row: number, col: number }[] {
    const validDrops: { row: number, col: number }[] = [];
    if (state.capturedPieces[player].length === 0) return [];

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (state.board[r][c] === null) {
                validDrops.push({ row: r, col: c });
            }
        }
    }
    return validDrops;
}


function checkWinner(board: Board, currentPlayer: Player): 'playing' | 'sente_win' | 'gote_win' {
    const opponent = getOpponent(currentPlayer);
    let opponentLionOnBoard = false;

    // Check for Lion capture
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const piece = board[r][c];
            if (piece && piece.type === PieceType.LION && piece.owner === opponent) {
                opponentLionOnBoard = true;
            }
            // Check for Lion "Try" (reaching the final rank)
            if (piece && piece.type === PieceType.LION) {
                if (piece.owner === Player.SENTE && r === 0) return 'sente_win';
                if (piece.owner === Player.GOTE && r === BOARD_ROWS - 1) return 'gote_win';
            }
        }
    }

    if (!opponentLionOnBoard) {
        return currentPlayer === Player.SENTE ? 'sente_win' : 'gote_win';
    }

    return 'playing';
}

function movePiece(state: GameState, from: { row: number, col: number }, to: { row: number, col: number }): GameState {
    const pieceToMove = state.board[from.row][from.col];
    if (!pieceToMove || pieceToMove.owner !== state.currentPlayer) return state;

    const isValidMove = getValidMoves(state, from.row, from.col).some(m => m.row === to.row && m.col === to.col);
    if (!isValidMove) return state;

    const newBoard = state.board.map(row => [...row]);
    const newCapturedPieces = {
      [Player.SENTE]: [...state.capturedPieces[Player.SENTE]],
      [Player.GOTE]: [...state.capturedPieces[Player.GOTE]],
    };

    const captured = newBoard[to.row][to.col];
    if (captured) {
        // Demote rooster back to chick if captured
        const capturedType = captured.type === PieceType.ROOSTER ? PieceType.CHICK : captured.type;
        newCapturedPieces[state.currentPlayer].push(capturedType);
    }

    newBoard[to.row][to.col] = pieceToMove;
    newBoard[from.row][from.col] = null;

    // Promotion
    const promotionRow = state.currentPlayer === Player.SENTE ? 0 : BOARD_ROWS - 1;
    if (pieceToMove.type === PieceType.CHICK && to.row === promotionRow) {
        newBoard[to.row][to.col] = { ...pieceToMove, type: PieceType.ROOSTER };
    }

    const newStatus = checkWinner(newBoard, state.currentPlayer);

    return {
        ...state,
        board: newBoard,
        currentPlayer: getOpponent(state.currentPlayer),
        capturedPieces: newCapturedPieces,
        status: newStatus,
        selectedCell: null,
        selectedCaptureIndex: null,
    };
}


function dropPiece(state: GameState, player: Player, pieceType: PieceType, to: { row: number, col: number }): GameState {
    if (state.board[to.row][to.col] !== null) return state;

    const captureIndex = state.capturedPieces[player].indexOf(pieceType);
    if (captureIndex === -1) return state;

    // A chick cannot be dropped in the final rank.
    const finalRank = player === Player.SENTE ? 0 : BOARD_ROWS - 1;
    if (pieceType === PieceType.CHICK && to.row === finalRank) {
        return state;
    }

    const newBoard = state.board.map(row => [...row]);
    newBoard[to.row][to.col] = { type: pieceType, owner: player };

    const newCapturedPieces = { ...state.capturedPieces };
    newCapturedPieces[player] = [...newCapturedPieces[player]];
    newCapturedPieces[player].splice(captureIndex, 1);

    return {
        ...state,
        board: newBoard,
        currentPlayer: getOpponent(player),
        capturedPieces: newCapturedPieces,
        selectedCell: null,
        selectedCaptureIndex: null,
    };
}


// =============================================================================
// Main Handler
// =============================================================================

export function handleCellClick(state: GameState, row: number, col: number): GameState {
    if (state.status !== 'playing') return state;

    const { selectedCell, selectedCaptureIndex, currentPlayer } = state;

    // 1. If a captured piece was selected, try to drop it
    if (selectedCaptureIndex !== null) {
        const pieceType = state.capturedPieces[selectedCaptureIndex.player][selectedCaptureIndex.index];
        return dropPiece(state, currentPlayer, pieceType, { row, col });
    }

    // 2. If a board piece was selected, try to move it
    if (selectedCell) {
        // Deselect if clicking the same piece
        if (selectedCell.row === row && selectedCell.col === col) {
            return { ...state, selectedCell: null, selectedCaptureIndex: null };
        }
        // Try to move
        return movePiece(state, selectedCell, { row, col });
    }

    // 3. If nothing is selected, try to select a piece on the board
    const piece = state.board[row][col];
    if (piece && piece.owner === currentPlayer) {
        return { ...state, selectedCell: { row, col }, selectedCaptureIndex: null };
    }

    return state; // Clicked on empty cell or opponent's piece with nothing selected
}

export function handleCaptureClick(state: GameState, player: Player, index: number): GameState {
    if (state.status !== 'playing' || player !== state.currentPlayer) return state;

    // Deselect if already selected
    if (state.selectedCaptureIndex?.player === player && state.selectedCaptureIndex?.index === index) {
        return { ...state, selectedCell: null, selectedCaptureIndex: null };
    }

    return {
        ...state,
        selectedCell: null,
        selectedCaptureIndex: { player, index },
    };
}
