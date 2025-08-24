// =============================================================================
// Constants and Types
// =============================================================================

export const BOARD_ROWS = 4;
export const BOARD_COLS = 3;

export type Player = 'SENTE' | 'GOTE';
export const SENTE: Player = 'SENTE';
export const GOTE: Player = 'GOTE';

export type PieceType = 'LION' | 'GIRAFFE' | 'ELEPHANT' | 'CHICK' | 'ROOSTER';
export const LION: PieceType = 'LION';
export const GIRAFFE: PieceType = 'GIRAFFE';
export const ELEPHANT: PieceType = 'ELEPHANT';
export const CHICK: PieceType = 'CHICK';
export const ROOSTER: PieceType = 'ROOSTER';

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
  [LION]:    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  [GIRAFFE]: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  [ELEPHANT]:[[-1, -1], [-1, 1], [1, -1], [1, 1]],
  [CHICK]:   [[-1, 0]],
  [ROOSTER]: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
};

// =============================================================================
// Initial State
// =============================================================================

export const createInitialState = (): GameState => {
  const board: (Piece | null)[][] = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  // SENTE pieces
  board[3][0] = { type: GIRAFFE, owner: SENTE };
  board[3][1] = { type: LION,    owner: SENTE };
  board[3][2] = { type: ELEPHANT,owner: SENTE };
  board[2][1] = { type: CHICK,   owner: SENTE };

  // GOTE pieces
  board[0][0] = { type: ELEPHANT, owner: GOTE };
  board[0][1] = { type: LION,     owner: GOTE };
  board[0][2] = { type: GIRAFFE,  owner: GOTE };
  board[1][1] = { type: CHICK,    owner: GOTE };

  return {
    board,
    currentPlayer: SENTE,
    capturedPieces: {
      [SENTE]: [],
      [GOTE]: [],
    },
    status: 'playing',
    selectedCell: null,
    selectedCaptureIndex: null,
  };
};

// =============================================================================
// Helper Functions
// =============================================================================

function isOutOfBounds(row: number, col: number): boolean {
  return row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS;
}

function getOpponent(player: Player): Player {
  return player === SENTE ? GOTE : SENTE;
}

function getPieceMoves(piece: Piece): [number, number][] {
    const moves = MOVES[piece.type];
    if (piece.owner === GOTE) {
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
            if (piece && piece.type === LION && piece.owner === opponent) {
                opponentLionOnBoard = true;
            }
            // Check for Lion "Try" (reaching the final rank)
            if (piece && piece.type === LION) {
                if (piece.owner === SENTE && r === 0) return 'sente_win';
                if (piece.owner === GOTE && r === BOARD_ROWS - 1) return 'gote_win';
            }
        }
    }

    if (!opponentLionOnBoard) {
        return currentPlayer === SENTE ? 'sente_win' : 'gote_win';
    }

    return 'playing';
}

export function movePiece(state: GameState, from: { row: number, col: number }, to: { row: number, col: number }): GameState {
    console.log('movePiece called', { from, to });
    const pieceToMove = state.board[from.row][from.col];
    if (!pieceToMove || pieceToMove.owner !== state.currentPlayer) {
        console.log('movePiece: invalid piece or owner');
        return state;
    }

    const isValidMove = getValidMoves(state, from.row, from.col).some(m => m.row === to.row && m.col === to.col);
    if (!isValidMove) {
        console.log('movePiece: invalid move');
        return state;
    }

    const newBoard = state.board.map(row => [...row]);
    const newCapturedPieces: CapturedPieces = {
      SENTE: [...state.capturedPieces.SENTE],
      GOTE: [...state.capturedPieces.GOTE],
    };

    const captured = newBoard[to.row][to.col];
    if (captured) {
        // Demote rooster back to chick if captured
        const capturedType = captured.type === ROOSTER ? CHICK : captured.type;
        newCapturedPieces[state.currentPlayer].push(capturedType);
    }

    newBoard[to.row][to.col] = pieceToMove;
    newBoard[from.row][from.col] = null;

    // Promotion
    const promotionRow = state.currentPlayer === SENTE ? 0 : BOARD_ROWS - 1;
    if (pieceToMove.type === CHICK && to.row === promotionRow) {
        newBoard[to.row][to.col] = { ...pieceToMove, type: ROOSTER };
    }

    const newStatus = checkWinner(newBoard, state.currentPlayer);

    console.log('movePiece: success', { newBoard, newCapturedPieces, newStatus });
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


export function dropPiece(state: GameState, player: Player, pieceType: PieceType, to: { row: number, col: number }): GameState {
    console.log('dropPiece called', { player, pieceType, to });
    if (state.board[to.row][to.col] !== null) {
        console.log('dropPiece: target cell not empty');
        return state;
    }

    const captureIndex = state.capturedPieces[player].indexOf(pieceType);
    if (captureIndex === -1) {
        console.log('dropPiece: piece not found in captured pieces');
        return state;
    }

    // A chick cannot be dropped in the final rank.
    const finalRank = player === SENTE ? 0 : BOARD_ROWS - 1;
    if (pieceType === CHICK && to.row === finalRank) {
        console.log('dropPiece: chick cannot be dropped in final rank');
        return state;
    }

    const newBoard = state.board.map(row => [...row]);
    newBoard[to.row][to.col] = { type: pieceType, owner: player };

    const newCapturedPieces = { ...state.capturedPieces };
    newCapturedPieces[player] = [...newCapturedPieces[player]];
    newCapturedPieces[player].splice(captureIndex, 1);

    console.log('dropPiece: success', { newBoard, newCapturedPieces });
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
    console.log('handleCellClick called', { row, col });
    if (state.status !== 'playing') {
        console.log('handleCellClick: game not playing');
        return state;
    }

    const { selectedCell, selectedCaptureIndex, currentPlayer } = state;

    // 1. If a captured piece was selected, try to drop it
    if (selectedCaptureIndex !== null) {
        console.log('handleCellClick: captured piece selected');
        const pieceType = state.capturedPieces[selectedCaptureIndex.player][selectedCaptureIndex.index];
        return dropPiece(state, currentPlayer, pieceType, { row, col });
    }

    // 2. If a board piece was selected, try to move it or change selection
    if (selectedCell) {
        console.log('handleCellClick: board piece selected');
        // Deselect if clicking the same piece
        if (selectedCell.row === row && selectedCell.col === col) {
            console.log('handleCellClick: deselecting same piece');
            return { ...state, selectedCell: null, selectedCaptureIndex: null };
        }

        const clickedPiece = state.board[row][col];
        // If clicking on another one of current player's pieces, change selection
        if (clickedPiece && clickedPiece.owner === currentPlayer) {
            console.log('handleCellClick: changing selection');
            return { ...state, selectedCell: { row, col }, selectedCaptureIndex: null };
        }

        // Try to move
        console.log('handleCellClick: trying to move');
        return movePiece(state, selectedCell, { row, col });
    }

    // 3. If nothing is selected, try to select a piece on the board
    console.log('handleCellClick: nothing selected, trying to select piece');
    const piece = state.board[row][col];
    if (piece && piece.owner === currentPlayer) {
        console.log('handleCellClick: selecting piece');
        return { ...state, selectedCell: { row, col }, selectedCaptureIndex: null };
    }

    console.log('handleCellClick: clicked empty cell or opponent\'s piece with nothing selected');
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
