export type Player = 'BLACK' | 'WHITE';
export type CellState = Player | null;
export type Board = CellState[][];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  scores: { BLACK: number; WHITE: number };
  gameStatus: 'PLAYING' | 'SKIPPED' | 'GAME_OVER';
  validMoves: Map<string, [number, number][]>;
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function getOpponent(player: Player): Player {
  return player === 'BLACK' ? 'WHITE' : 'BLACK';
}

export function getValidMoves(player: Player, board: Board): Map<string, [number, number][]> {
  const validMoves = new Map<string, [number, number][]>();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== null) continue;

      const stonesToFlip: [number, number][] = [];
      for (const [dr, dc] of DIRS) {
        const line: [number, number][] = [];
        let nr = r + dr;
        let nc = c + dc;

        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === getOpponent(player)) {
          line.push([nr, nc]);
          nr += dr;
          nc += dc;
        }

        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player && line.length > 0) {
          stonesToFlip.push(...line);
        }
      }
      if (stonesToFlip.length > 0) {
        validMoves.set(`${r},${c}`, stonesToFlip);
      }
    }
  }
  return validMoves;
}

export function createInitialState(): GameState {
  const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  newBoard[3][3] = 'WHITE';
  newBoard[3][4] = 'BLACK';
  newBoard[4][3] = 'BLACK';
  newBoard[4][4] = 'WHITE';
  const initialPlayer = 'BLACK';
  return {
    board: newBoard,
    currentPlayer: initialPlayer,
    scores: { BLACK: 2, WHITE: 2 },
    gameStatus: 'PLAYING',
    validMoves: getValidMoves(initialPlayer, newBoard),
  };
}

export function handleCellClick(currentState: GameState, r: number, c: number): GameState | null {
  if (currentState.gameStatus === 'GAME_OVER') {
    console.error('Invalid action: The game is already over.');
    return null;
  }
  if (currentState.board[r][c] !== null) {
    console.error(`Invalid action: Cell (${r}, ${c}) is already occupied.`);
    return null;
  }
  if (!currentState.validMoves.has(`${r},${c}`)) {
    console.error(`Invalid move: Cannot place a stone at (${r}, ${c}).`);
    return null;
  }

  const newBoard = currentState.board.map(row => [...row]);
  const stonesToFlip = currentState.validMoves.get(`${r},${c}`)!;
  
  newBoard[r][c] = currentState.currentPlayer;
  stonesToFlip.forEach(([fr, fc]) => {
    newBoard[fr][fc] = currentState.currentPlayer;
  });

  const blackScore = newBoard.flat().filter(cell => cell === 'BLACK').length;
  const whiteScore = newBoard.flat().filter(cell => cell === 'WHITE').length;

  let nextPlayer = getOpponent(currentState.currentPlayer);
  let nextValidMoves = getValidMoves(nextPlayer, newBoard);
  let gameStatus: GameState['gameStatus'] = 'PLAYING';

  if (nextValidMoves.size === 0) {
    const currentPlayerValidMoves = getValidMoves(currentState.currentPlayer, newBoard);
    if (currentPlayerValidMoves.size === 0) {
      gameStatus = 'GAME_OVER';
    } else {
      gameStatus = 'SKIPPED';
      // The current player plays again, so we don't switch players
      nextPlayer = currentState.currentPlayer;
      nextValidMoves = currentPlayerValidMoves;
    }
  } 
  
  if (blackScore + whiteScore === 64) {
    gameStatus = 'GAME_OVER';
  }

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    scores: { BLACK: blackScore, WHITE: whiteScore },
    gameStatus,
    validMoves: nextValidMoves,
  };
}
