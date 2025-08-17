// 1. タイプ定義 (Type Definitions)
export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13';
export type Player = 1 | 2;

export interface Card {
  id: number; // カード一意のID
  suit: Suit | 'Joker';
  rank: Rank | 'J';
  matchId: string; // ペア判定用ID (例: "S01", "Joker")
}

export interface BoardCard extends Card {
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameStatus = 'player1_turn' | 'player2_turn' | 'evaluating' | 'game_over';

export interface GameState {
  board: BoardCard[];
  currentPlayer: Player;
  scores: { player1: number; player2: number };
  flippedIndices: number[];
  revealedIndices: number[];
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// 2. 定数 (Constants)
const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];

// 3. ヘルパー関数 (Helper Functions)
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 4. コアロジック (Core Logic)
export function createInitialState(): GameState {
  let idCounter = 0;
  const standardCards: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      standardCards.push({
        id: idCounter++,
        suit,
        rank,
        matchId: `r${rank}`,
      });
    }
  }

  const jokers: Card[] = [
    { id: idCounter++, suit: 'Joker', rank: 'J', matchId: 'rJ' },
    { id: idCounter++, suit: 'Joker', rank: 'J', matchId: 'rJ' },
  ];

  const deck = shuffle([...standardCards, ...jokers]);

  const board: BoardCard[] = deck.map((card) => ({
    ...card,
    isFlipped: false,
    isMatched: false,
  }));

  return {
    board,
    currentPlayer: 1,
    scores: { player1: 0, player2: 0 },
    flippedIndices: [],
    revealedIndices: [],
    status: 'player1_turn',
    winner: null,
  };
}

export function handleCardClick(currentState: GameState, cardIndex: number): GameState {
  // 不正な操作は無視
  if (
    currentState.flippedIndices.length >= 2 ||
    currentState.board[cardIndex].isFlipped ||
    currentState.board[cardIndex].isMatched
  ) {
    return currentState;
  }

  const newState = JSON.parse(JSON.stringify(currentState)) as GameState;

  // カードを表向きにし、めくった履歴に追加
  newState.board[cardIndex].isFlipped = true;
  newState.flippedIndices.push(cardIndex);
  if (!newState.revealedIndices.includes(cardIndex)) {
    newState.revealedIndices.push(cardIndex);
  }

  // めくったカードが2枚になったら評価
  if (newState.flippedIndices.length === 2) {
    newState.status = 'evaluating';
    const [index1, index2] = newState.flippedIndices;
    const card1 = newState.board[index1];
    const card2 = newState.board[index2];

    if (card1.matchId === card2.matchId) {
      // --- マッチした場合 ---
      card1.isMatched = true;
      card2.isMatched = true;
      newState.scores[`player${newState.currentPlayer}`]++;
      newState.flippedIndices = [];

      // ターンはそのまま
      newState.status = newState.currentPlayer === 1 ? 'player1_turn' : 'player2_turn';

      // ゲーム終了チェック
      const allMatched = newState.board.every((card) => card.isMatched);
      if (allMatched) {
        newState.status = 'game_over';
        if (newState.scores.player1 > newState.scores.player2) {
          newState.winner = 1;
        } else if (newState.scores.player2 > newState.scores.player1) {
          newState.winner = 2;
        } else {
          newState.winner = 'draw';
        }
      }
    }
    // ミスマッチの場合は、状態を 'evaluating' のまま返し、UI側で遅延処理後に clearNonMatchingFlippedCards を呼ぶ
  }

  return newState;
}

export function clearNonMatchingFlippedCards(currentState: GameState): GameState {
  if (currentState.flippedIndices.length !== 2) {
    return currentState;
  }

  const newState = JSON.parse(JSON.stringify(currentState)) as GameState;
  const [index1, index2] = newState.flippedIndices;

  // カードを裏向きに戻す
  newState.board[index1].isFlipped = false;
  newState.board[index2].isFlipped = false;

  // プレイヤー交代
  newState.currentPlayer = newState.currentPlayer === 1 ? 2 : 1;
  newState.status = newState.currentPlayer === 1 ? 'player1_turn' : 'player2_turn';
  newState.flippedIndices = [];

  return newState;
}
