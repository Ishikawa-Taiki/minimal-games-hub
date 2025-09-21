export type Player = 'プレイヤー1' | 'プレイヤー2';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Stick {
  id: number;
  isTaken: boolean;
  takenBy: Player | null;
}

export interface GameState {
  rows: Stick[][];
  currentPlayer: Player;
  winner: Player | null;
  difficulty: Difficulty;
  selectedSticks: { row: number; stickId: number }[];
  status: 'waiting' | 'playing' | 'ended';
}

export interface Chunk {
  length: number;
  startIndex: number;
  endIndex: number;
}

export interface NimData {
  chunkLists: Chunk[][];
  nimSum: number;
}

const STICKS_PER_ROW: { [key in Difficulty]: number[] } = {
  easy: [1, 2, 3],
  normal: [1, 2, 3, 4, 5],
  hard: [1, 2, 3, 4, 5, 6, 7],
};

export function createInitialState(difficulty: Difficulty): GameState {
  let stickIdCounter = 0;
  const rows = STICKS_PER_ROW[difficulty].map(stickCount => {
    return Array.from({ length: stickCount }, () => ({
      id: stickIdCounter++,
      isTaken: false,
      takenBy: null,
    }));
  });

  return {
    rows,
    currentPlayer: 'プレイヤー1',
    winner: null,
    difficulty,
    selectedSticks: [],
    status: 'waiting',
  };
}

export function calculateNimData(rows: Stick[][]): NimData {
  const chunkLists = rows.map(row => {
    const chunksInRow: Chunk[] = [];
    let currentChunkSize = 0;
    let chunkStartIndex = -1;

    row.forEach((stick, index) => {
      if (!stick.isTaken) {
        if (currentChunkSize === 0) {
          chunkStartIndex = index;
        }
        currentChunkSize++;
      } else {
        if (currentChunkSize > 0) {
          chunksInRow.push({
            length: currentChunkSize,
            startIndex: chunkStartIndex,
            endIndex: index - 1,
          });
        }
        currentChunkSize = 0;
        chunkStartIndex = -1;
      }
    });

    if (currentChunkSize > 0) {
      chunksInRow.push({
        length: currentChunkSize,
        startIndex: chunkStartIndex,
        endIndex: row.length - 1,
      });
    }
    return chunksInRow;
  });

  const allChunkLengths = chunkLists.flat().map(chunk => chunk.length);
  const nimSum = allChunkLengths.reduce((acc, val) => acc ^ val, 0);

  return {
    chunkLists,
    nimSum,
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
    const sortedSelection = newSelectedSticks.map(s => s.stickId).sort((a, b) => a - b);
    const deselectedStickIndex = sortedSelection.indexOf(stickId);

    if (deselectedStickIndex > 0 && deselectedStickIndex < sortedSelection.length - 1) {
      // If the deselected stick is in the middle, reset selection to only the currently clicked stick
      return {
        ...currentState,
        selectedSticks: [{ row: rowIndex, stickId }],
      };
    }
    // Deselect stick if it's at the ends
    return {
      ...currentState,
      selectedSticks: newSelectedSticks.filter(
        s => !(s.row === rowIndex && s.stickId === stickId)
      ),
    };
  }

  // Add new selection
  const prospectiveSelection = [...newSelectedSticks, { row: rowIndex, stickId }];

  // Check for consecutiveness
  if (prospectiveSelection.length > 1) {
    const stickIds = prospectiveSelection.map(s => s.stickId).sort((a, b) => a - b);
    const isConsecutive = stickIds.every((id, i) => i === 0 || id === stickIds[i - 1] + 1);

    if (!isConsecutive) {
      // If not consecutive, reset selection to only the currently clicked stick
      return {
        ...currentState,
        selectedSticks: [{ row: rowIndex, stickId }],
      };
    }
  }

  return {
    ...currentState,
    selectedSticks: prospectiveSelection,
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
      stick.takenBy = currentPlayer;
    }
  });

  const remainingSticks = newRows.flat().filter(stick => !stick.isTaken).length;

  let winner: Player | null = null;
  if (remainingSticks === 0) {
    // The current player took the last stick, so the other player wins.
    winner = currentPlayer === 'プレイヤー1' ? 'プレイヤー2' : 'プレイヤー1';
  }

  return {
    ...currentState,
    rows: newRows,
    currentPlayer: winner ? currentState.currentPlayer : (currentPlayer === 'プレイヤー1' ? 'プレイヤー2' : 'プレイヤー1'),
    winner,
    selectedSticks: [],
  };
}
