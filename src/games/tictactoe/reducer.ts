import { BaseGameState } from '@/core/types/game';
import { GameState as CoreGameState, createInitialState, handleCellClick, Player, Board, calculatePotentialLines } from './core';

/**
 * TicTacToe用のゲーム状態定義
 * useGameEngineで使用するための統一された状態構造
 */
export interface TicTacToeGameState extends BaseGameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  winningLines: number[][] | null;
  reachingLines: { player: Player; index: number }[];
  hintLevel: number; // 0: none, 1: enabled
  potentialLines: (number | null)[];
}

/**
 * TicTacToe用のアクション定義
 * useGameEngineで使用するためのアクション型
 */
export type TicTacToeAction =
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_HINTS_ENABLED'; enabled: boolean };

/**
 * TicTacToeの初期状態を生成する関数
 * 
 * @returns TicTacToeの初期ゲーム状態
 */
export function createInitialTicTacToeState(): TicTacToeGameState {
  const coreState = createInitialState();
  const potentialLines = calculatePotentialLines(coreState.board, coreState.currentPlayer);
  return {
    ...coreState,
    // BaseGameStateの必須フィールド
    status: 'playing',
    winner: null,
    potentialLines,
  };
}

/**
 * TicTacToe用のreducer関数
 * 
 * 純粋関数として実装され、useGameEngineで使用される。
 * 既存のcore.tsのロジックを活用しつつ、新しい状態管理パターンに適合。
 * 
 * @param state - 現在のゲーム状態
 * @param action - 実行するアクション
 * @returns 新しいゲーム状態
 */
export function ticTacToeReducer(state: TicTacToeGameState, action: TicTacToeAction): TicTacToeGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      // 既存のcore.tsのロジックを使用するため、CoreGameState形式に変換
      const coreState: CoreGameState = {
        board: state.board,
        currentPlayer: state.currentPlayer,
        winner: state.winner,
        isDraw: state.isDraw,
        winningLines: state.winningLines,
        reachingLines: state.reachingLines,
        hintLevel: state.hintLevel,
      };
      
      // 既存のhandleCellClickロジックを使用
      const newCoreState = handleCellClick(coreState, action.row, action.col);
      
      // 無効な移動の場合は状態を変更しない
      if (!newCoreState) {
        return state;
      }
      
      const potentialLines = calculatePotentialLines(newCoreState.board, newCoreState.currentPlayer);

      // 新しい状態を構築
      return {
        ...state,
        ...newCoreState,
        potentialLines,
        // BaseGameStateのstatusフィールドを適切に設定
        status: newCoreState.winner || newCoreState.isDraw ? 'ended' : 'playing',
        winner: newCoreState.winner,
      };
    }
    
    case 'RESET_GAME':
      // 初期状態に戻す
      return createInitialTicTacToeState();
    
    case 'SET_HINTS_ENABLED':
      // ヒント機能のON/OFF切り替え
      return { 
        ...state, 
        hintLevel: action.enabled ? 1 : 0 
      };
    
    default:
      // 未知のアクションの場合は状態を変更しない
      return state;
  }
}