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
  };
};

export const selectLine = (
  state: GameState,
  r: number,
  c: number,
  type: 'h' | 'v'
): GameState => {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const { currentPlayer, rows, cols } = newState;

  const line = type === 'h' ? newState.hLines[r][c] : newState.vLines[r][c];

  if (line.owner) {
    return state; // Already taken, do nothing
  }

  line.owner = currentPlayer;
  newState.remainingLines--;

  const previousTotalScore = newState.scores.player1 + newState.scores.player2;

  // Check all boxes to see if any are newly completed
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!newState.boxes[i][j].owner) {
        const top = newState.hLines[i][j].owner;
        const bottom = newState.hLines[i + 1][j].owner;
        const left = newState.vLines[i][j].owner;
        const right = newState.vLines[i][j + 1].owner;

        if (top && bottom && left && right) {
          newState.boxes[i][j].owner = currentPlayer;
        }
      }
    }
  }

  // Recalculate scores from scratch
  const newScores: Record<Player, number> = { player1: 0, player2: 0 };
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (newState.boxes[i][j].owner) {
        newScores[newState.boxes[i][j].owner!]++;
      }
    }
  }
  newState.scores = newScores;

  const newTotalScore = newScores.player1 + newScores.player2;
  const boxCompletedThisTurn = newTotalScore > previousTotalScore;

  if (newState.remainingLines === 0) {
    newState.gameStatus = 'ended';
    if (newState.scores.player1 > newState.scores.player2) {
      newState.winner = 'player1';
    } else if (newState.scores.player2 > newState.scores.player1) {
      newState.winner = 'player2';
    } else {
      newState.winner = 'draw';
    }
  } else {
    if (!boxCompletedThisTurn) {
      newState.currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    }
  }

  return newState;
};