export type Player = 'Player 1' | 'Player 2';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Stick {
  id: number;
  isTaken: boolean;
}

export interface GameState {
  rows: Stick[][];
  currentPlayer: Player;
  winner: Player | null;
  difficulty: Difficulty;
  selectedSticks: { row: number; stickId: number }[];
}

const STICKS_PER_ROW: { [key in Difficulty]: number[] } = {
  easy: [1, 3, 5],
  normal: [1, 3, 5, 7, 9],
  hard: [1, 3, 5, 7, 9, 11, 13],
};

export function createInitialState(difficulty: Difficulty): GameState {
  let stickIdCounter = 0;
  const rows = STICKS_PER_ROW[difficulty].map(stickCount => {
    return Array.from({ length: stickCount }, () => ({
      id: stickIdCounter++,
      isTaken: false,
    }));
  });

  return {
    rows,
    currentPlayer: 'Player 1',
    winner: null,
    difficulty,
    selectedSticks: [],
  };
}

export function selectStick(
  currentState: GameState,
  rowIndex: number,
  stickId: number
): GameState {
  const { rows, selectedSticks } = currentState;
  const stick = rows[rowIndex].find(s => s.id === stickId);

  if (!stick || stick.isTaken) {
    return currentState;
  }

  const isAlreadySelected = selectedSticks.some(
    s => s.row === rowIndex && s.stickId === stickId
  );

  // If the selection is in a new row, clear previous selections
  const newSelectedSticks =
    selectedSticks.length > 0 && selectedSticks[0].row !== rowIndex
      ? []
      : [...selectedSticks];

  if (isAlreadySelected) {
    // Deselect stick
    return {
      ...currentState,
      selectedSticks: newSelectedSticks.filter(
        s => !(s.row === rowIndex && s.stickId === stickId)
      ),
    };
  }

  // Add new selection
  newSelectedSticks.push({ row: rowIndex, stickId });

  // Ensure all selected sticks are in the same row and consecutive
  const selectedStickIds = newSelectedSticks
    .filter(s => s.row === rowIndex)
    .map(s => rows[rowIndex].findIndex(rs => rs.id === s.stickId))
    .sort((a, b) => a - b);

  const isConsecutive = selectedStickIds.every((id, i) => i === 0 || id === selectedStickIds[i-1] + 1);

  if(!isConsecutive) {
    // If not consecutive, only keep the last selected stick
    return {
      ...currentState,
      selectedSticks: [{ row: rowIndex, stickId }],
    }
  }

  return {
    ...currentState,
    selectedSticks: newSelectedSticks,
  };
}

export function handleTakeSticks(currentState: GameState): GameState {
  const { rows, currentPlayer, selectedSticks } = currentState;

  if (selectedSticks.length === 0) {
    return currentState; // No move made
  }

  const newRows = rows.map(row => row.map(stick => ({ ...stick })));
  selectedSticks.forEach(({ row, stickId }) => {
    const stick = newRows[row].find(s => s.id === stickId);
    if (stick) {
      stick.isTaken = true;
    }
  });

  const remainingSticks = newRows.flat().filter(stick => !stick.isTaken).length;

  let winner: Player | null = null;
  if (remainingSticks === 0) {
    // The current player took the last stick, so the other player wins.
    winner = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
  }

  return {
    ...currentState,
    rows: newRows,
    currentPlayer: winner ? currentState.currentPlayer : (currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'),
    winner,
    selectedSticks: [],
  };
}
