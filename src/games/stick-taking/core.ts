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
  const stick = rows[rowIndex]?.find(s => s.id === stickId);

  // 選択されたスティックが存在しない、または既に取られている場合は何もしない
  if (!stick || stick.isTaken) {
    return currentState;
  }

  const isAlreadySelected = selectedSticks.some(
    s => s.row === rowIndex && s.stickId === stickId
  );

  // 選択中のスティックが別の行にある場合、選択をリセットして新しいスティックを選択する
  if (selectedSticks.length > 0 && selectedSticks[0].row !== rowIndex) {
    return {
      ...currentState,
      selectedSticks: [{ row: rowIndex, stickId }],
    };
  }

  if (isAlreadySelected) {
    // === 選択解除のロジック ===
    // 選択されているスティックが1つだけの場合、その選択を解除する
    if (selectedSticks.length === 1) {
      return { ...currentState, selectedSticks: [] };
    }

    const stickIds = selectedSticks.map(s => s.stickId).sort((a, b) => a - b);
    const minId = stickIds[0];
    const maxId = stickIds[stickIds.length - 1];

    // 選択範囲の端のスティックのみ選択解除を許可する
    if (stickId === minId || stickId === maxId) {
      return {
        ...currentState,
        selectedSticks: selectedSticks.filter(s => s.stickId !== stickId),
      };
    } else {
      // 選択範囲の中間のスティックがクリックされた場合、選択をリセットして現在のスティックのみを選択する
      return {
        ...currentState,
        selectedSticks: [{ row: rowIndex, stickId }],
      };
    }
  }

  // === 新規選択のロジック ===
  if (selectedSticks.length > 0) {
    const stickIds = selectedSticks.map(s => s.stickId).sort((a, b) => a - b);
    const minId = stickIds[0];
    const maxId = stickIds[stickIds.length - 1];

    // 新しく選択されたスティックが、既存の選択範囲に隣接しているかチェック
    if (stickId === minId - 1 || stickId === maxId + 1) {
      // 隣接している場合、選択範囲に追加
      return {
        ...currentState,
        selectedSticks: [...selectedSticks, { row: rowIndex, stickId }],
      };
    } else {
      // 隣接していない場合、選択をリセットして現在のスティックのみを選択
      return {
        ...currentState,
        selectedSticks: [{ row: rowIndex, stickId }],
      };
    }
  }

  // 選択されているスティックがなかった場合、新しく選択を開始
  return {
    ...currentState,
    selectedSticks: [{ row: rowIndex, stickId }],
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
