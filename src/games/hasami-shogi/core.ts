export type Player = 'PLAYER1' | 'PLAYER2';
export type Board = (Player | null)[][];
export type WinCondition = 'standard' | 'five_captures' | 'total_capture';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: 'READY' | 'PLAYING' | 'GAME_OVER';
  winner: Player | null;
  selectedPiece: { r: number; c: number } | null;
  validMoves: Map<string, { captured: [number, number][]; isUnsafe: boolean }>;
  potentialCaptures: [number, number][];
  capturedPieces: { [key in Player]: number };
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
    gameStatus: 'READY',
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
  const isBoardInitial = currentState.board.every((row, r) =>
    row.every(cell => {
      if (r === 0) return cell === 'PLAYER2';
      if (r === BOARD_SIZE - 1) return cell === 'PLAYER1';
      return cell === null;
    })
  );

  if (currentState.capturedPieces.PLAYER1 > 0 || currentState.capturedPieces.PLAYER2 > 0 || !isBoardInitial) {
    return currentState;
  }
  return { ...createInitialState(), winCondition };
}

function getOpponent(player: Player): Player {
  return player === 'PLAYER1' ? 'PLAYER2' : 'PLAYER1';
}

export function isPathClear(board: Board, fromR: number, fromC: number, toR: number, toC: number): boolean {
  if (fromR !== toR && fromC !== toC) return false;
  if (board[toR][toC] !== null) return false;

  if (fromR === toR) {
    const start = Math.min(fromC, toC);
    const end = Math.max(fromC, toC);
    for (let c = start + 1; c < end; c++) {
      if (board[fromR][c] !== null) return false;
    }
    return true;
  }

  if (fromC === toC) {
    const start = Math.min(fromR, toR);
    const end = Math.max(fromR, toR);
    for (let r = start + 1; r < end; r++) {
      if (board[r][fromC] !== null) return false;
    }
    return true;
  }
  return false;
}

function getSandwichCapturesByMove(board: Board, player: Player, toR: number, toC: number): [number, number][] {
  const opponent = getOpponent(player);
  const captured: [number, number][] = [];
  const directions = [
    { r: 0, c: 1 }, { r: 0, c: -1 }, { r: 1, c: 0 }, { r: -1, c: 0 }
  ];

  for (const dir of directions) {
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
  return captured;
}

function getSurroundCapturesByMove(board: Board, player: Player, toR: number, toC: number): [number, number][] {
    const opponent = getOpponent(player);
    const capturedGroups: [number, number][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const checkedGroups: Set<string> = new Set();

    for (const [dr, dc] of directions) {
        const nr = toR + dr;
        const nc = toC + dc;
        const startNode = `${nr},${nc}`;

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === opponent && !checkedGroups.has(startNode)) {
            const group: [number, number][] = [];
            const queue: [number, number][] = [[nr, nc]];
            const visitedInGroup: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
            visitedInGroup[nr][nc] = true;
            let hasLiberty = false;
            let head = 0;

            while (head < queue.length) {
                const [curR, curC] = queue[head++];
                group.push([curR, curC]);
                checkedGroups.add(`${curR},${curC}`);

                for (const [gr, gc] of directions) {
                    const nnr = curR + gr;
                    const nnc = curC + gc;

                    if (nnr < 0 || nnr >= BOARD_SIZE || nnc < 0 || nnc >= BOARD_SIZE) continue;

                    if (board[nnr][nnc] === null) {
                        hasLiberty = true;
                        break;
                    }

                    if (board[nnr][nnc] === opponent && !visitedInGroup[nnr][nnc]) {
                        visitedInGroup[nnr][nnc] = true;
                        queue.push([nnr, nnc]);
                    }
                }
                if (hasLiberty) break;
            }

            if (!hasLiberty) {
                capturedGroups.push(...group);
            }
        }
    }
    return capturedGroups;
}

function getCornerCapturesByMove(board: Board, player: Player, toR: number, toC: number): [number, number][] {
  const opponent = getOpponent(player);
  const captures: [number, number][] = [];
  const corners = [
    { r: 0, c: 0, adjs: [[0, 1], [1, 0]] },
    { r: 0, c: 8, adjs: [[0, 7], [1, 8]] },
    { r: 8, c: 0, adjs: [[7, 0], [8, 1]] },
    { r: 8, c: 8, adjs: [[7, 8], [8, 7]] },
  ];

  for (const corner of corners) {
    if (board[corner.r][corner.c] !== opponent) continue;

    const isAdjacentToCorner = corner.adjs.some(([ar, ac]) => ar === toR && ac === toC);
    if (!isAdjacentToCorner) continue;

    const [adj1, adj2] = corner.adjs;
    if (board[adj1[0]][adj1[1]] === player && board[adj2[0]][adj2[1]] === player) {
      captures.push([corner.r, corner.c]);
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
  const boardAfterMove = board.map(row => [...row]);
  boardAfterMove[toR][toC] = player;
  boardAfterMove[fromR][fromC] = null;

  const sandwichCaptures = getSandwichCapturesByMove(boardAfterMove, player, toR, toC);
  const surroundCaptures = getSurroundCapturesByMove(boardAfterMove, player, toR, toC);
  const cornerCaptures = getCornerCapturesByMove(boardAfterMove, player, toR, toC);

  const allCaptures = [...sandwichCaptures, ...surroundCaptures, ...cornerCaptures];
  const uniqueCaptures = Array.from(new Set(allCaptures.map(p => `${p[0]},${p[1]}`))).map(s =>
    s.split(',').map(Number)
  ) as [number, number][];

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
    const validMoves = new Map<string, { captured: [number, number][]; isUnsafe: boolean }>();
    const captureSet = new Set<string>();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (isPathClear(board, r, c, i, j)) {
          const isUnsafeMove = isMoveUnsafe(board, currentPlayer, r, c, i, j);
          const { captured } = simulateMove(board, currentPlayer, r, c, i, j);
          validMoves.set(`${i},${j}`, { captured, isUnsafe: isUnsafeMove });
          if (!isUnsafeMove) {
            captured.forEach(p => captureSet.add(`${p[0]},${p[1]}`));
          }
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