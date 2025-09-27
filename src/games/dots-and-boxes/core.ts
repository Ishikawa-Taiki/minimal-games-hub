// =================================================================
// Types
// =================================================================
export type Player = 'PLAYER1' | 'PLAYER2';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameStatus = 'playing' | 'ended';
export type Winner = Player | 'DRAW' | null;

type LineState = Player | null;
export type HorizontalLines = LineState[][];
export type VerticalLines = LineState[][];
export type BoxState = Player | null;
export type Boxes = BoxState[][];
export type LineType = 'horizontal' | 'vertical';

export interface DrawLinePayload {
  lineType: LineType;
  row: number;
  col: number;
}

export type GameAction =
  | {
      type: 'DRAW_LINE';
      payload: DrawLinePayload;
    }
  | {
      type: 'RESET';
      payload: GameState;
    };

export interface GameState {
  boardSize: { rows: number; cols: number };
  lines: {
    horizontal: HorizontalLines;
    vertical: VerticalLines;
  };
  boxes: Boxes;
  currentPlayer: Player;
  scores: { [key in Player]: number };
  status: GameStatus;
  winner: Winner;
  difficulty: Difficulty;
}

// =================================================================
// Constants
// =================================================================
const DIFFICULTY_SETTINGS: { [key in Difficulty]: { rows: number; cols: number } } = {
  easy: { rows: 2, cols: 2 },
  normal: { rows: 4, cols: 4 },
  hard: { rows: 6, cols: 6 },
};

// =================================================================
// Initial State
// =`================================================================
export const initialState: GameState = createGame('easy');

// =================================================================
// Game Logic
// =================================================================

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.status === 'ended') {
    return state;
  }

  switch (action.type) {
    case 'RESET':
      return action.payload;
    case 'DRAW_LINE': {
      const { lineType, row, col } = action.payload;
      const { currentPlayer } = state;

      const lines = JSON.parse(JSON.stringify(state.lines));

      // Check if the line is already drawn
      if (
        (lineType === 'horizontal' && lines.horizontal[row][col]) ||
        (lineType === 'vertical' && lines.vertical[row][col])
      ) {
        return state; // Line already exists, return current state
      }

      // Draw the line
      if (lineType === 'horizontal') {
        lines.horizontal[row][col] = currentPlayer;
      } else {
        lines.vertical[row][col] = currentPlayer;
      }

      // Check for completed boxes
      let boxesCompleted = 0;
      const newBoxes = JSON.parse(JSON.stringify(state.boxes));

      for (let r = 0; r < state.boardSize.rows; r++) {
        for (let c = 0; c < state.boardSize.cols; c++) {
          if (
            newBoxes[r][c] === null &&
            lines.horizontal[r][c] &&
            lines.horizontal[r + 1][c] &&
            lines.vertical[r][c] &&
            lines.vertical[r][c + 1]
          ) {
            newBoxes[r][c] = currentPlayer;
            boxesCompleted++;
          }
        }
      }

      const newScores = { ...state.scores };
      if (boxesCompleted > 0) {
        newScores[currentPlayer] += boxesCompleted;
      }

      const nextPlayer =
        boxesCompleted > 0
          ? currentPlayer
          : currentPlayer === 'PLAYER1'
          ? 'PLAYER2'
          : 'PLAYER1';

      const newState: GameState = {
        ...state,
        lines,
        boxes: newBoxes,
        scores: newScores,
        currentPlayer: nextPlayer,
      };

      // Check for game end
      const totalBoxes = state.boardSize.rows * state.boardSize.cols;
      const totalScore = newScores.PLAYER1 + newScores.PLAYER2;

      if (totalScore === totalBoxes) {
        newState.status = 'ended';
        if (newScores.PLAYER1 > newScores.PLAYER2) {
          newState.winner = 'PLAYER1';
        } else if (newScores.PLAYER2 > newScores.PLAYER1) {
          newState.winner = 'PLAYER2';
        } else {
          newState.winner = 'DRAW';
        }
      }

      return newState;
    }
    default:
      return state;
  }
}

/**
 * Creates a new game state based on the selected difficulty.
 * @param difficulty The difficulty level of the game.
 * @returns A new GameState object.
 */
export function createGame(difficulty: Difficulty): GameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const { rows, cols } = settings;

  return {
    boardSize: { rows, cols },
    lines: {
      horizontal: Array(rows + 1)
        .fill(null)
        .map(() => Array(cols).fill(null)),
      vertical: Array(rows)
        .fill(null)
        .map(() => Array(cols + 1).fill(null)),
    },
    boxes: Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null)),
    currentPlayer: 'PLAYER1',
    scores: { PLAYER1: 0, PLAYER2: 0 },
    status: 'playing',
    winner: null,
    difficulty,
  };
}