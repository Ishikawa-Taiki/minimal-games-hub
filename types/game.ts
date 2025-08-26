export type GameManifest = {
  name: string;
  displayName: string;
  shortDescription: string;
  path: string;
  rulesFile: string;
  specActionFile: string;
  specDisplayFile: string;
};

// ゲームの基本状態
export type GameStatus = 'waiting' | 'playing' | 'ended';
export type Player = string; // 'black', 'white', 'player1', etc.

// 全ゲーム共通の基本状態（厳密な型設計）
export interface BaseGameState {
  status: GameStatus;
  currentPlayer: Player | null;
  winner: Player | null;
}

// ゲームコントローラーの共通インターフェース（厳密な型設計）
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
}

// レスポンシブレイアウト用の厳密な型
export type ResponsiveState = 
  | { layoutMode: 'mobile'; screenWidth: number } // < 768px
  | { layoutMode: 'desktop'; screenWidth: number }; // >= 768px

// ヘルパー関数で判定
export const isMobile = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'mobile' } => 
  state.layoutMode === 'mobile';

export const isDesktop = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'desktop' } => 
  state.layoutMode === 'desktop';
