export type Player = 'player1' | 'player2';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameStatus = 'waiting' | 'playing' | 'ended';

export interface Line {
  owner: Player | null;
  preview: Player | null;
}

export interface Box {
  owner: Player | null;
  preview: Player | null;
}

export interface GameState {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  hLines: Line[][];
  vLines: Line[][];
  boxes: Box[][];
  currentPlayer: Player;
  scores: Record<Player, number>;
  gameStatus: GameStatus;
  winner: Player | 'draw' | null;
  remainingLines: number;
  hintsEnabled: boolean;
}

const difficultySettings: Record<Difficulty, { rows: number; cols: number }> = {
  easy: { rows: 2, cols: 2 },
  normal: { rows: 4, cols: 4 },
  hard: { rows: 6, cols: 6 },
};

export const createInitialState = (difficulty: Difficulty): GameState => {
  const settings = difficultySettings[difficulty];
  const rows = settings.rows;
  const cols = settings.cols;

  const createLineArray = (r: number, c: number) =>
    Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({ owner: null, preview: null }))
    );

  const totalLines = rows * (cols + 1) + (rows + 1) * cols;

  return {
    difficulty,
    rows,
    cols,
    hLines: createLineArray(rows + 1, cols),
    vLines: createLineArray(rows, cols + 1),
    boxes: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ owner: null, preview: null }))
    ),
    currentPlayer: 'player1',
    scores: { player1: 0, player2: 0 },
    gameStatus: 'playing',
    winner: null,
    remainingLines: totalLines,
    hintsEnabled: false,
  };
};

export const selectLine = (
  state: GameState,
  r: number,
  c: number,
  type: 'h' | 'v'
): GameState => {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const { currentPlayer, hLines, vLines, boxes, rows, cols } = newState;

  const line = type === 'h' ? hLines[r][c] : vLines[r][c];
  if (line.owner) {
    return state; // Line already taken
  }

  line.owner = currentPlayer;
  newState.remainingLines--;

  let completedBoxesCount = 0;

  const checkAndOwnBox = (boxR: number, boxC: number) => {
    if (boxR >= 0 && boxR < rows && boxC >= 0 && boxC < cols) {
      if (
        !boxes[boxR][boxC].owner &&
        hLines[boxR][boxC].owner &&
        hLines[boxR + 1][boxC].owner &&
        vLines[boxR][boxC].owner &&
        vLines[boxR][boxC + 1].owner
      ) {
        boxes[boxR][boxC].owner = currentPlayer;
        completedBoxesCount++;
      }
    }
  };

  if (type === 'h') {
    // Check the box above and below the horizontal line
    checkAndOwnBox(r - 1, c);
    checkAndOwnBox(r, c);
  } else { // type === 'v'
    // Check the box to the left and right of the vertical line
    checkAndOwnBox(r, c - 1);
    checkAndOwnBox(r, c);
  }

  if (completedBoxesCount > 0) {
    newState.scores[currentPlayer] += completedBoxesCount;
  } else {
    newState.currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
  }

  if (newState.remainingLines === 0) {
    newState.gameStatus = 'ended';
    if (newState.scores.player1 > newState.scores.player2) {
      newState.winner = 'player1';
    } else if (newState.scores.player2 > newState.scores.player1) {
      newState.winner = 'player2';
    } else {
      newState.winner = 'draw';
    }
  }

  return newState;
};