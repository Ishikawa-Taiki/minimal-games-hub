// 1. タイプ定義 (Type Definitions)
export type Difficulty = 'easy' | 'normal' | 'hard';
export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13';
export type Player = 1 | 2;

export interface Card {
  id: number; // カード一意のID
  suit: Suit | 'Joker';
  rank: Rank | 'J';
  matchId: string; // ペア判定用ID (例: "r01", "rJ")
}

export interface BoardCard extends Card {
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy: Player | null;
}

export type GameStatus = 'player1_turn' | 'player2_turn' | 'evaluating' | 'game_over';

export interface GameState {
  board: BoardCard[];
  currentPlayer: Player;
  scores: { player1: number; player2: number };
  flippedIndices: number[];
  revealedIndices: number[];
  newlyMatchedIndices: number[];
  hintedIndices: number[];
  status: GameStatus;
  winner: Player | 'draw' | null;
  difficulty: Difficulty | null;
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

export function calculateHintedIndices(board: BoardCard[], revealedIndices: number[]): number[] {
  const revealedAndUnmatched = new Map<string, number[]>();
  revealedIndices.forEach(index => {
    const card = board[index];
    if (card && !card.isMatched) {
      if (!revealedAndUnmatched.has(card.matchId)) {
        revealedAndUnmatched.set(card.matchId, []);
      }
      revealedAndUnmatched.get(card.matchId)!.push(index);
    }
  });

  const potentialPairs = [...revealedAndUnmatched.values()].filter(indices => indices.length >= 2);
  return potentialPairs.length >= 2 ? potentialPairs.flat() : [];
}

// 4. コアロジック (Core Logic)
export function createInitialState(difficulty: Difficulty): GameState {
  const cardPool: Omit<Card, 'id'>[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      cardPool.push({ suit, rank, matchId: `${suit}-${rank}` });
    });
  });

  let gameCardsSource: Omit<Card, 'id'>[];
  switch (difficulty) {
    case 'easy':
      gameCardsSource = shuffle(cardPool).slice(0, 10);
      break;
    case 'normal':
      gameCardsSource = shuffle(cardPool).slice(0, 20);
      break;
    case 'hard':
    default:
      gameCardsSource = shuffle(cardPool).slice(0, 26);
      gameCardsSource.push({ suit: 'Joker', rank: 'J', matchId: 'Joker' });
      break;
  }

  const deck: Card[] = [];
  let uniqueId = 0;
  gameCardsSource.forEach((cardSource) => {
    deck.push({ ...cardSource, id: uniqueId++ });
    deck.push({ ...cardSource, id: uniqueId++ });
  });

  return {
    difficulty,
    board: shuffle(deck).map((card) => ({
      ...card,
      isFlipped: false,
      isMatched: false,
      matchedBy: null,
    })),
    currentPlayer: 1,
    scores: { player1: 0, player2: 0 },
    flippedIndices: [],
    revealedIndices: [],
    newlyMatchedIndices: [],
    hintedIndices: [],
    status: 'player1_turn',
    winner: null,
  };
}

export function handleCardClick(currentState: GameState, cardIndex: number): GameState {
  if (
    currentState.flippedIndices.length >= 2 ||
    currentState.board[cardIndex].isFlipped ||
    currentState.board[cardIndex].isMatched
  ) {
    return currentState;
  }

  const newBoard = currentState.board.map((card, i) =>
    i === cardIndex ? { ...card, isFlipped: true } : card
  );

  const newFlippedIndices = [...currentState.flippedIndices, cardIndex];
  const newRevealedIndices = currentState.revealedIndices.includes(cardIndex)
    ? currentState.revealedIndices
    : [...currentState.revealedIndices, cardIndex];

  const baseNextState: GameState = {
    ...currentState,
    board: newBoard,
    flippedIndices: newFlippedIndices,
    revealedIndices: newRevealedIndices,
    newlyMatchedIndices: [], // Reset on new click
  };

  if (newFlippedIndices.length === 2) {
    const [index1, index2] = newFlippedIndices;
    const card1 = newBoard[index1];
    const card2 = newBoard[index2];

    if (card1.matchId === card2.matchId) {
      const finalBoard = newBoard.map((card, i) =>
        i === index1 || i === index2
          ? { ...card, isMatched: true, matchedBy: currentState.currentPlayer }
          : card
      );
      const newScores = { ...currentState.scores };
      newScores[`player${currentState.currentPlayer}`]++;

      const allMatched = finalBoard.every((card) => card.isMatched);
      if (allMatched) {
        return {
          ...baseNextState,
          board: finalBoard,
          scores: newScores,
          status: 'game_over',
          winner: newScores.player1 > newScores.player2 ? 1 : newScores.player2 > newScores.player1 ? 2 : 'draw',
          flippedIndices: [],
          newlyMatchedIndices: [index1, index2],
        };
      }
      return {
        ...baseNextState,
        board: finalBoard,
        scores: newScores,
        status: currentState.currentPlayer === 1 ? 'player1_turn' : 'player2_turn',
        flippedIndices: [],
        newlyMatchedIndices: [index1, index2],
        hintedIndices: calculateHintedIndices(finalBoard, newRevealedIndices),
      };
    } else {
      return { ...baseNextState, status: 'evaluating' };
    }
  }

  return {
    ...baseNextState,
    hintedIndices: calculateHintedIndices(newBoard, newRevealedIndices),
  };
}

export function clearNonMatchingFlippedCards(currentState: GameState): GameState {
  if (currentState.flippedIndices.length < 2) {
    return currentState;
  }

  const newBoard = currentState.board.map((card, index) =>
    currentState.flippedIndices.includes(index) ? { ...card, isFlipped: false } : card
  );

  const newPlayer = currentState.currentPlayer === 1 ? 2 : 1;

  return {
    ...currentState,
    board: newBoard,
    currentPlayer: newPlayer,
    status: newPlayer === 1 ? 'player1_turn' : 'player2_turn',
    flippedIndices: [],
  };
}