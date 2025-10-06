// =============================================================================
// 定数と型定義
// =============================================================================

export const BOARD_ROWS = 4;
export const BOARD_COLS = 3;

export type Player = 'OKASHI' | 'OHANA';
export const OKASHI_TEAM: Player = 'OKASHI';
export const OHANA_TEAM: Player = 'OHANA';

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

export type MoveInfo = {
  piece: Piece;
  from: { row: number, col: number } | { player: Player }; // player for drops
  to: { row: number, col: number };
};

export interface GameState {
  board: Board;
  currentPlayer: Player;
  capturedPieces: CapturedPieces;
  status: 'playing' | 'okashi_win' | 'ohana_win';
  selectedCell: { row: number; col: number } | null;
  selectedCaptureIndex: { player: Player; index: number } | null;
  winReason: 'catch' | 'try' | null;
  lastMove: MoveInfo | null;
}

// 駒の移動定義 [行, 列]。おかしチーム（下側）を基準とする。
export const MOVES: { [key in PieceType]: [number, number][] } = {
  [LION]:    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  [GIRAFFE]: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  [ELEPHANT]:[[-1, -1], [-1, 1], [1, -1], [1, 1]],
  [CHICK]:   [[-1, 0]],
  [ROOSTER]: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
};

// =============================================================================
// 初期状態
// =============================================================================

export const createInitialState = (): GameState => {
  const board: (Piece | null)[][] = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  // おかしチームの駒
  board[3][0] = { type: GIRAFFE, owner: OKASHI_TEAM };
  board[3][1] = { type: LION,    owner: OKASHI_TEAM };
  board[3][2] = { type: ELEPHANT,owner: OKASHI_TEAM };
  board[2][1] = { type: CHICK,   owner: OKASHI_TEAM };

  // おはなチームの駒
  board[0][0] = { type: ELEPHANT, owner: OHANA_TEAM };
  board[0][1] = { type: LION,     owner: OHANA_TEAM };
  board[0][2] = { type: GIRAFFE,  owner: OHANA_TEAM };
  board[1][1] = { type: CHICK,    owner: OHANA_TEAM };

  return {
    board,
    currentPlayer: OKASHI_TEAM,
    capturedPieces: {
      [OKASHI_TEAM]: [],
      [OHANA_TEAM]: [],
    },
    status: 'playing',
    selectedCell: null,
    selectedCaptureIndex: null,
    winReason: null,
    lastMove: null,
  };
};

// =============================================================================
// ヘルパー関数
// =============================================================================

function isOutOfBounds(row: number, col: number): boolean {
  return row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS;
}

function getOpponent(player: Player): Player {
  return player === OKASHI_TEAM ? OHANA_TEAM : OKASHI_TEAM;
}

function getPieceMoves(piece: Piece): [number, number][] {
    const moves = MOVES[piece.type];
    if (piece.owner === OHANA_TEAM) {
        // おはなチーム（上側）の場合、行の向きを反転させる
        return moves.map(([r, c]) => [-r, c]);
    }
    return moves;
}

export function getValidMovesForPiece(board: Board, player: Player, fromRow: number, fromCol: number): { row: number, col: number }[] {
  const piece = board[fromRow][fromCol];
  if (!piece || piece.owner !== player) return [];

  const validMoves: { row: number, col: number }[] = [];
  const moves = getPieceMoves(piece);

  for (const [dr, dc] of moves) {
    const toRow = fromRow + dr;
    const toCol = fromCol + dc;

    if (isOutOfBounds(toRow, toCol)) continue;

    const destinationCell = board[toRow][toCol];
    if (destinationCell && destinationCell.owner === player) {
      continue;
    }
    validMoves.push({ row: toRow, col: toCol });
  }

  return validMoves;
}

function getAllPlayerMoves(board: Board, player: Player): { row: number, col: number }[] {
    const allMoves: { row: number, col: number }[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === player) {
                const moves = getValidMovesForPiece(board, player, r, c);
                allMoves.push(...moves);
            }
        }
    }
    return allMoves;
}

export function isSquareThreatened(board: Board, row: number, col: number, player: Player): boolean {
    const opponent = getOpponent(player);
    const opponentMoves = getAllPlayerMoves(board, opponent);
    return opponentMoves.some(move => move.row === row && move.col === col);
}

// =============================================================================
// コアロジック関数
// =============================================================================

export function getValidMoves(state: GameState, fromRow: number, fromCol: number): { row: number, col: number }[] {
  const piece = state.board[fromRow][fromCol];
  if (!piece || piece.owner !== state.currentPlayer) return [];
  return getValidMovesForPiece(state.board, state.currentPlayer, fromRow, fromCol);
}

export function getValidDrops(state: GameState, player: Player, pieceType: PieceType): { row: number, col: number }[] {
    const validDrops: { row: number, col: number }[] = [];
    const finalRank = player === OKASHI_TEAM ? 0 : BOARD_ROWS - 1;

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (state.board[r][c] === null) {
                // ヒヨコは相手の最終段には置けない
                if (pieceType === CHICK && r === finalRank) {
                    continue;
                }
                validDrops.push({ row: r, col: c });
            }
        }
    }
    return validDrops;
}


interface WinResult {
  status: 'playing' | 'okashi_win' | 'ohana_win';
  reason: 'catch' | 'try' | null;
}

function checkWinner(board: Board, mover: Player): WinResult {
    const opponent = getOpponent(mover);

    // 1. 「トライ」の確認（ライオンが相手の最終段に到達）
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const piece = board[r][c];
            if (piece && piece.type === LION && piece.owner === mover) {
                const finalRank = mover === OKASHI_TEAM ? 0 : BOARD_ROWS - 1;
                if (r === finalRank) {
                    return {
                        status: mover === OKASHI_TEAM ? 'okashi_win' : 'ohana_win',
                        reason: 'try'
                    };
                }
            }
        }
    }

    // 2. ライオンの捕獲を確認
    let opponentLionOnBoard = false;
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const piece = board[r][c];
            if (piece && piece.type === LION && piece.owner === opponent) {
                opponentLionOnBoard = true;
                break;
            }
        }
        if(opponentLionOnBoard) break;
    }

    if (!opponentLionOnBoard) {
        return {
            status: mover === OKASHI_TEAM ? 'okashi_win' : 'ohana_win',
            reason: 'catch'
        };
    }

    return { status: 'playing', reason: null };
}

export function movePiece(state: GameState, from: { row: number, col: number }, to: { row: number, col: number }): GameState {
    const pieceToMove = state.board[from.row][from.col];
    if (!pieceToMove || pieceToMove.owner !== state.currentPlayer) {
        return { ...state, lastMove: null };
    }

    const isValidMove = getValidMoves(state, from.row, from.col).some(m => m.row === to.row && m.col === to.col);
    if (!isValidMove) {
        return { ...state, lastMove: null };
    }

    const newBoard = state.board.map(row => [...row]);
    const newCapturedPieces: CapturedPieces = {
      OKASHI: [...state.capturedPieces.OKASHI],
      OHANA: [...state.capturedPieces.OHANA],
    };

    const captured = newBoard[to.row][to.col];
    if (captured) {
        // 捕獲した駒が「にわとり」なら「ひよこ」に戻す
        const capturedType = captured.type === ROOSTER ? CHICK : captured.type;
        newCapturedPieces[state.currentPlayer].push(capturedType);
    }

    newBoard[to.row][to.col] = pieceToMove;
    newBoard[from.row][from.col] = null;

    // 「成り」の処理
    const promotionRow = state.currentPlayer === OKASHI_TEAM ? 0 : BOARD_ROWS - 1;
    if (pieceToMove.type === CHICK && to.row === promotionRow) {
        newBoard[to.row][to.col] = { ...pieceToMove, type: ROOSTER };
    }

    const winResult = checkWinner(newBoard, state.currentPlayer);

    return {
        ...state,
        board: newBoard,
        currentPlayer: getOpponent(state.currentPlayer),
        capturedPieces: newCapturedPieces,
        status: winResult.status,
        winReason: winResult.reason,
        selectedCell: null,
        selectedCaptureIndex: null,
        lastMove: { piece: pieceToMove, from, to },
    };
}


export function dropPiece(state: GameState, player: Player, pieceType: PieceType, to: { row: number, col: number }): GameState {
    if (state.board[to.row][to.col] !== null) {
        return { ...state, lastMove: null };
    }

    const captureIndex = state.capturedPieces[player].indexOf(pieceType);
    if (captureIndex === -1) {
        return { ...state, lastMove: null };
    }

    // ひよこは相手の最終段に置くことはできない。
    const finalRank = player === OKASHI_TEAM ? 0 : BOARD_ROWS - 1;
    if (pieceType === CHICK && to.row === finalRank) {
        return { ...state, lastMove: null };
    }

    const newBoard = state.board.map(row => [...row]);
    const droppedPiece: Piece = { type: pieceType, owner: player };
    newBoard[to.row][to.col] = droppedPiece;

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
        lastMove: { piece: droppedPiece, from: { player }, to },
    };
}




// =============================================================================
// メインハンドラー
// =============================================================================

export function handleCellClick(state: GameState, row: number, col: number): GameState {
    if (state.status !== 'playing') {
        return { ...state, lastMove: null };
    }

    const { selectedCell, selectedCaptureIndex, currentPlayer } = state;

    // 1. 持ち駒を選択中の場合：駒を盤面に置くか、選択を変更する
    if (selectedCaptureIndex !== null) {
        const clickedPiece = state.board[row][col];

        // 自分の駒をクリックした場合、選択対象をそちらに変更する
        if (clickedPiece && clickedPiece.owner === currentPlayer) {
            return {
                ...state,
                selectedCell: { row, col },
                selectedCaptureIndex: null,
                lastMove: null,
            };
        }

        const pieceType = state.capturedPieces[selectedCaptureIndex.player][selectedCaptureIndex.index];
        return dropPiece(state, currentPlayer, pieceType, { row, col });
    }

    // 2. 盤上の駒を選択中の場合：駒を移動させるか、選択を変更する
    if (selectedCell) {
        // 同じ駒を再度クリックした場合は選択を解除する
        if (selectedCell.row === row && selectedCell.col === col) {
            return { ...state, selectedCell: null, selectedCaptureIndex: null, lastMove: null };
        }

        const clickedPiece = state.board[row][col];
        // 別の自分の駒をクリックした場合、選択対象をそちらに変更する
        if (clickedPiece && clickedPiece.owner === currentPlayer) {
            return { ...state, selectedCell: { row, col }, selectedCaptureIndex: null, lastMove: null };
        }

        // 駒の移動を試みる
        return movePiece(state, selectedCell, { row, col });
    }

    // 3. 何も選択していない場合：盤上の駒を選択する
    const piece = state.board[row][col];
    if (piece && piece.owner === currentPlayer) {
        return { ...state, selectedCell: { row, col }, selectedCaptureIndex: null, lastMove: null };
    }

    // 何も選択していない状態で、空のマスか相手の駒をクリックした場合
    return { ...state, lastMove: null };
}

export function handleCaptureClick(state: GameState, player: Player, index: number): GameState {
    if (state.status !== 'playing' || player !== state.currentPlayer) {
        return { ...state, lastMove: null };
    }

    // すでに選択されている持ち駒を再度クリックした場合は選択を解除する
    if (state.selectedCaptureIndex?.player === player && state.selectedCaptureIndex?.index === index) {
        return { ...state, selectedCell: null, selectedCaptureIndex: null, lastMove: null };
    }

    return {
        ...state,
        selectedCell: null,
        selectedCaptureIndex: { player, index },
        lastMove: null,
    };
}
