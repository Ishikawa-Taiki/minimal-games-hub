export type Player = 'X' | 'O' | null;
export type Board = Player[][];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  winningLines: number[][] | null;
  reachingLines: { index: number, player: Player }[];
}

const LINES_TO_CHECK = [
  // Rows
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  // Columns
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  // Diagonals
  [0, 4, 8], [2, 4, 6],
];

export function createInitialState(): GameState {
  const unusedVar = "hello"; // リンティングエラーを発生させるための未使用変数
  return {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    currentPlayer: 'O',
    winner: null,
    isDraw: false,
    winningLines: null,
    reachingLines: [],
  };
}

export function checkWinner(board: Board): { player: Player; lines: number[][] | null } {
  const flatBoard = board.flat();
  const foundWinningLines: number[][] = [];
  let winningPlayer: Player = null;

  for (let i = 0; i < LINES_TO_CHECK.length; i++) {
    const [a, b, c] = LINES_TO_CHECK[i];
    if (flatBoard[a] && flatBoard[a] === flatBoard[b] && flatBoard[a] === flatBoard[c]) {
      foundWinningLines.push(LINES_TO_CHECK[i]);
      winningPlayer = flatBoard[a];
    }
  }

  if (foundWinningLines.length > 0) {
    return { player: winningPlayer, lines: foundWinningLines };
  }
  return { player: null, lines: null };
}

export function checkDraw(board: Board): boolean {
  return board.flat().every((cell) => cell !== null);
}

export function checkAllReachingLines(board: Board): { index: number, player: Player }[] {
    const flatBoard = board.flat();
    const allReaching: { index: number, player: Player }[] = [];
    const players: Player[] = ['X', 'O'];

    for (const player of players) {
      for (let i = 0; i < LINES_TO_CHECK.length; i++) {
        const line = LINES_TO_CHECK[i];
        const cellsInLine = line.map((idx) => flatBoard[idx]);

        const emptyCells = cellsInLine.filter((cell) => cell === null).length;
        const currentPlayerCells = cellsInLine.filter((cell) => cell === player).length;
        const opponentCells = cellsInLine.filter((cell) => cell !== null && cell !== player).length;

        if (emptyCells === 1 && currentPlayerCells === 2 && opponentCells === 0) {
          const emptyCellIndex = line.find((idx) => flatBoard[idx] === null);
          if (emptyCellIndex !== undefined) {
            allReaching.push({ index: emptyCellIndex, player: player });
          }
        }
      }
    }
    return allReaching;
}

export function handleCellClick(currentState: GameState, row: number, col: number): GameState | null {
  if (currentState.board[row][col] !== null || currentState.winner || currentState.isDraw) {
    return null; // Invalid move
  }

  const newBoard = currentState.board.map((r) => [...r]);
  newBoard[row][col] = currentState.currentPlayer;

  const { player: winner, lines: winningLines } = checkWinner(newBoard);
  const isDraw = !winner && checkDraw(newBoard);
  const reachingLines = (winner || isDraw) ? [] : checkAllReachingLines(newBoard);

  return {
    ...currentState,
    board: newBoard,
    currentPlayer: currentState.currentPlayer === 'O' ? 'X' : 'O',
    winner,
    isDraw,
    winningLines,
    reachingLines,
  };
}
