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
  isHintVisible: boolean;
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
    isHintVisible: false,
  };
}

export function toggleHintVisibility(currentState: GameState): GameState {
  return {
    ...currentState,
    isHintVisible: !currentState.isHintVisible,
  };
}

export function getHintData(state: GameState) {
  const remainingSticksCount = state.rows.flat().filter(stick => !stick.isTaken).length;

  if (remainingSticksCount === 0) {
    return {
      remainingSticksCount: 0,
      totalChunkCount: 0,
    };
  }

  const totalChunkCount = state.rows
    .map(row => {
      let chunkCountInRow = 0;
      let inChunk = false;
      row.forEach(stick => {
        if (!stick.isTaken && !inChunk) {
          inChunk = true;
          chunkCountInRow++;
        } else if (stick.isTaken) {
          inChunk = false;
        }
      });
      return chunkCountInRow;
    })
    .reduce((total, count) => total + count, 0);

  return {
    remainingSticksCount,
    totalChunkCount,
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

  // Ensure all selected sticks are in the same row and consecutive
  const selectedRowIndex = selectedSticks[0].row;
  const selectedStickIndices = selectedSticks
    .map(s => rows[selectedRowIndex].findIndex(rs => rs.id === s.stickId))
    .sort((a, b) => a - b);

  const isConsecutive = selectedStickIndices.every((index, i) => i === 0 || index === selectedStickIndices[i-1] + 1);

  if(!isConsecutive) {
    // If not consecutive, this is an invalid move. Clear selection.
    return {
      ...currentState,
      selectedSticks: [],
    }
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
