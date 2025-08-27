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
  winner: Player | 'DRAW' | null;
}

// スコア/統計情報の表示用型定義
export interface ScoreInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}

// ゲームコントローラーの共通インターフェース（厳密な型設計）
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
  // ゲーム固有の状態表示ロジック
  getDisplayStatus: () => string;
  // ゲーム固有のスコア/統計情報（オプショナル）
  getScoreInfo?: () => ScoreInfo | null;
}

// ヒント機能の共通型定義
export type HintLevel = 'off' | 'basic' | 'advanced';

// 位置情報の共通型
export interface Position {
  row: number;
  col: number;
}

// ヒント表示データの型定義
export interface HintOverlayData {
  position: Position;
  type: 'valid_move' | 'capturable' | 'threatened' | 'score_indicator' | 'move_count';
  content: string | number; // 表示内容（数値や記号）
  style: 'highlight' | 'warning' | 'info';
}

// ヒント機能の状態管理
export interface HintState {
  level: HintLevel;
  // ゲーム固有のヒント表示データ
  highlightedCells?: Position[]; // ハイライト対象のセル
  overlayData?: HintOverlayData[]; // オーバーレイ表示データ
  selectedCell?: Position | null; // 選択中のセル（フルヒントモード用）
}

// ヒント機能付きゲーム状態
export interface HintableGameState extends BaseGameState {
  hints: HintState;
}

// 履歴機能付きゲーム状態
export interface HistoryGameState extends BaseGameState {
  history: any[]; // ゲーム固有の履歴データ
  currentHistoryIndex: number;
}

// ヒント機能付きコントローラー
export interface HintableGameController<TState extends BaseGameState, TAction> 
  extends BaseGameController<TState, TAction> {
  toggleHints: () => void;
  hintState: HintState;
  clearHints?: () => void;
}

// 履歴機能付きコントローラー（リバーシなど）
export interface HistoryGameController<TState extends BaseGameState, TAction> 
  extends BaseGameController<TState, TAction> {
  undoMove: () => void;
  redoMove: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// 複合型（必要に応じて組み合わせ）
export type GameController<TState extends BaseGameState, TAction> = 
  | BaseGameController<TState, TAction>
  | HintableGameController<TState, TAction>
  | HistoryGameController<TState, TAction>
  | (HintableGameController<TState, TAction> & HistoryGameController<TState, TAction>);

// レスポンシブレイアウト用の厳密な型
export type ResponsiveState = 
  | { layoutMode: 'mobile'; screenWidth: number } // < 768px
  | { layoutMode: 'desktop'; screenWidth: number }; // >= 768px

// ヘルパー関数で判定
export const isMobile = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'mobile' } => 
  state.layoutMode === 'mobile';

export const isDesktop = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'desktop' } => 
  state.layoutMode === 'desktop';
