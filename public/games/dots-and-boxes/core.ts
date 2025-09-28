export type Player = 'player1' | 'player2';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameStatus = 'waiting' | 'playing' | 'ended';
export type LineId = { r: number; c: number; type: 'h' | 'v' };

// core.tsは純粋なゲームロジックのみを扱うため、プレビューの状態を持たない
export interface Line {
  owner: Player | null;
}

export interface Box {
  owner: Player | null;
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
  status: GameStatus;
  winner: Player | 'draw' | null;
  remainingLines: number;
  hintsEnabled: boolean;
}

export interface Preview {
  line: LineId;
  boxes: { r: number; c: number }[];
}

const difficultySettings: Record<Difficulty, { rows: number; cols: number }> = {
  easy: { rows: 2, cols: 2 },
  normal: { rows: 4, cols: 4 },
  hard: { rows: 6, cols: 6 },
};

export const createInitialState = (difficulty: Difficulty): GameState => {
  const settings = difficultySettings[difficulty];
  const { rows, cols } = settings;

  const createLineArray = (r: number, c: number): Line[][] =>
    Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({ owner: null }))
    );

  const createBoxArray = (r: number, c: number): Box[][] =>
    Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({ owner: null }))
    );

  const totalLines = rows * (cols + 1) + (rows + 1) * cols;

  return {
    difficulty,
    rows,
    cols,
    hLines: createLineArray(rows + 1, cols),
    vLines: createLineArray(rows, cols + 1),
    boxes: createBoxArray(rows, cols),
    currentPlayer: 'player1',
    scores: { player1: 0, player2: 0 },
    status: 'playing',
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
  const { currentPlayer, hLines, vLines, boxes, scores, remainingLines } =
    state;

  const line = type === 'h' ? hLines[r][c] : vLines[r][c];
  if (line.owner) {
    return state; // 既に引かれた線は選択不可
  }

  // 選択されたラインを新しい所有者で更新
  const newHLines =
    type === 'h'
      ? hLines.map((row, rowIndex) =>
          rowIndex !== r
            ? row
            : row.map((line, colIndex) =>
                colIndex !== c ? line : { ...line, owner: currentPlayer }
              )
        )
      : hLines;

  const newVLines =
    type === 'v'
      ? vLines.map((row, rowIndex) =>
          rowIndex !== r
            ? row
            : row.map((line, colIndex) =>
                colIndex !== c ? line : { ...line, owner: currentPlayer }
              )
        )
      : vLines;

  let completedBoxesCount = 0;
  const newBoxes = boxes.map((row, boxR) =>
    row.map((box, boxC) => {
      if (box.owner) return box; // 既に所有されているボックスはスキップ

      // 新しいラインによってボックスが完成したか判定
      const isTopOwned = newHLines[boxR][boxC].owner;
      const isBottomOwned = newHLines[boxR + 1][boxC].owner;
      const isLeftOwned = newVLines[boxR][boxC].owner;
      const isRightOwned = newVLines[boxR][boxC + 1].owner;

      if (isTopOwned && isBottomOwned && isLeftOwned && isRightOwned) {
        completedBoxesCount++;
        return { ...box, owner: currentPlayer };
      }
      return box;
    })
  );

  // スコアと次のプレイヤーを決定
  const newScores = { ...scores };
  if (completedBoxesCount > 0) {
    newScores[currentPlayer] += completedBoxesCount;
  }
  const nextPlayer =
    completedBoxesCount > 0
      ? currentPlayer
      : currentPlayer === 'player1'
      ? 'player2'
      : 'player1';

  // ゲームの終了を判定
  const newRemainingLines = remainingLines - 1;
  let newStatus: GameStatus = 'playing';
  let newWinner: Player | 'draw' | null = null;
  if (newRemainingLines === 0) {
    newStatus = 'ended';
    if (newScores.player1 > newScores.player2) {
      newWinner = 'player1';
    } else if (newScores.player2 > newScores.player1) {
      newWinner = 'player2';
    } else {
      newWinner = 'draw';
    }
  }

  // 新しいゲーム状態を返す
  return {
    ...state,
    hLines: newHLines,
    vLines: newVLines,
    boxes: newBoxes,
    currentPlayer: nextPlayer,
    scores: newScores,
    remainingLines: newRemainingLines,
    status: newStatus,
    winner: newWinner,
  };
};

/**
 * 各ボックスの残りライン数を計算する
 * @param state 現在のゲーム状態
 * @returns 各ボックスの残りライン数（2次元配列）
 */
export const calculateRemainingLinesCounts = (state: GameState): number[][] => {
  const { rows, cols, hLines, vLines, boxes } = state;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (boxes[r][c].owner) return 0;
      let count = 4;
      if (hLines[r][c].owner) count--;
      if (hLines[r + 1][c].owner) count--;
      if (vLines[r][c].owner) count--;
      if (vLines[r][c + 1].owner) count--;
      return count;
    })
  );
};

/**
 * 指定されたラインを引いた場合のプレビュー情報を取得する
 * @param state 現在のゲーム状態
 * @param r ラインの行
 * @param c ラインの列
 * @param type ラインの種類（水平 or 垂直）
 * @returns プレビュー情報（プレビュー対象のラインと、それによって完成するボックスのリスト）
 */
export const getPreview = (
  state: GameState,
  r: number,
  c: number,
  type: 'h' | 'v'
): Preview => {
  const { rows, cols, boxes } = state;
  const previewBoxes: { r: number; c: number }[] = [];

  // ラインが引かれたと仮定した一時的な盤面を作成
  const tempHLines = state.hLines.map((row) => [...row]);
  const tempVLines = state.vLines.map((row) => [...row]);
  if (type === 'h') {
    tempHLines[r][c] = { owner: state.currentPlayer };
  } else {
    tempVLines[r][c] = { owner: state.currentPlayer };
  }

  const checkAndAddPreviewBox = (boxR: number, boxC: number) => {
    if (boxR >= 0 && boxR < rows && boxC >= 0 && boxC < cols) {
      if (
        !boxes[boxR][boxC].owner &&
        tempHLines[boxR][boxC].owner &&
        tempHLines[boxR + 1][boxC].owner &&
        tempVLines[boxR][boxC].owner &&
        tempVLines[boxR][boxC + 1].owner
      ) {
        previewBoxes.push({ r: boxR, c: boxC });
      }
    }
  };

  // 新しいラインに関連するボックスをチェック
  if (type === 'h') {
    checkAndAddPreviewBox(r - 1, c); // 上のボックス
    checkAndAddPreviewBox(r, c); // 下のボックス
  } else {
    checkAndAddPreviewBox(r, c - 1); // 左のボックス
    checkAndAddPreviewBox(r, c); // 右のボックス
  }

  return { line: { r, c, type }, boxes: previewBoxes };
};