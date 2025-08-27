# 設計書

## 概要

本設計書では、レスポンシブデザイン改善のための技術的なアプローチ、アーキテクチャ、データモデル、コンポーネント構造を定義します。PCでのサイドバーレイアウトとモバイルでのミニマルレイアウト + FAB + ボトムシートパターンを採用し、ゲーム間で共通のアーキテクチャを提供します。

## アーキテクチャ

### 拡張性に関する考慮事項

現在の設計は、ターン進行性のオフライン2人対戦ボードゲームを前提としていますが、以下の点で将来的な拡張に対応できます：

#### ゲームタイプの拡張対応
- **リアルタイムゲーム**: `GameStatus`に`'realtime'`を追加し、`currentPlayer`を配列化することで対応可能
- **1人用ゲーム**: `Player`型を`'player' | 'computer'`に拡張し、AI思考状態を追加
- **マルチプレイヤー**: `BaseGameState`を拡張して`players: Player[]`を追加
- **非ターン制**: `currentPlayer`を`null`にし、ゲーム固有の進行状態を個別管理

#### ヒント機能の設計方針
ヒント機能は**ゲーム内のステートとコンポーネント**として実装することを推奨します：
- `BaseGameState`に`hints: HintState`を追加
- 各ゲームで`useHints`カスタムフックを実装
- ControlPanelに「ヒント」ボタンを共通配置
- ヒント表示は各ゲームのUI内でオーバーレイ表示

#### ポリモーフィック設計の採用
GameLayoutコンポーネントは各ゲーム固有の処理を直接持たず、ポリモーフィズムを活用した設計を採用：
- `BaseGameController`に`getScoreInfo()`メソッドを追加
- 各ゲームコントローラーが自身のスコア表示ロジックを実装
- GameLayoutは汎用的な表示ロジックのみを持つ
- 新しいゲーム追加時にGameLayoutの修正が不要

#### UIコンポーネント統一の必要性
既存ゲーム全体のレイアウト見直しに伴い、UIコンポーネントの一貫性確保は**本設計に含めるべき**です。理由：
- レスポンシブレイアウトと密接に関連
- ゲーム間の一貫性がUX向上に直結
- 共通コンポーネントライブラリの基盤となる

### 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Responsive Layout System                                   │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   PC Layout     │  │  Mobile Layout  │                 │
│  │  (Sidebar)      │  │   (Minimal)     │                 │
│  └─────────────────┘  └─────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  Common Game Architecture                                   │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ GameController  │  │   GameLayout    │                 │
│  │   Interface     │  │   Component     │                 │
│  └─────────────────┘  └─────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  Individual Game Components                                 │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Game Hooks     │  │  Game UI        │                 │
│  │  (useReversi)   │  │  Components     │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### レスポンシブデザインアーキテクチャ

#### ブレークポイントシステム
- **モバイル**: `< 768px` - ミニマルレイアウト
- **PC**: `>= 768px` - サイドバーレイアウト

#### レイアウトパターン

**PCレイアウト (>= 768px)**
```
┌─────────────────────────────────────────────────────────────┐
│                        Header                               │
├─────────────────┬───────────────────────────────────────────┤
│   Sidebar       │                                           │
│   Control       │            Game Board                     │
│   Panel         │            Main Area                      │
│   - Status      │                                           │
│   - Score       │                                           │
│   - Rules Btn   │                                           │
│   - Reset Btn   │                                           │
│                 │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

**モバイルレイアウト (< 768px)**
```
┌─────────────────────────────────────────────────────────────┐
│              Slim Header (Title + Status)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                   Game Board                                │
│                   Full Area                                 │
│                                                             │
│                                                             │
│                                                    ┌─────┐  │
│                                                    │ FAB │  │
│                                                    └─────┘  │
└─────────────────────────────────────────────────────────────┘
│                Bottom Sheet (Hidden)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - Rules Button                                     │   │
│  │  - Reset Button                                     │   │
│  │  - Score/Status Details                             │   │
│  └─────────────────────────────────────────────────────┘   │
```

## コンポーネントとインターフェース

### 1. 共通型定義 (`types/game.ts`)

```typescript
// ゲームの基本状態
export type GameStatus = 'waiting' | 'playing' | 'ended';
export type Player = string; // 'black', 'white', 'player1', etc.

// 全ゲーム共通の基本状態（厳密な型設計）
export interface BaseGameState {
  status: GameStatus;
  currentPlayer: Player | null;
  winner: Player | null;
}

// ヒント機能付きゲーム状態
export interface HintableGameState extends BaseGameState {
  hints: HintState;
}

// マルチプレイヤー対応ゲーム状態
export interface MultiPlayerGameState extends BaseGameState {
  players: Player[];
  currentPlayerIndex: number;
}

// 各ゲームは必要な機能を extends で追加
// 例: interface ReversiGameState extends HintableGameState { ... }

// ヒント機能の共通インターフェース（実際の実装に基づく）
export type HintLevel = 'off' | 'basic' | 'advanced';

export interface HintState {
  level: HintLevel;
  // ゲーム固有のヒント表示データ
  highlightedCells?: Position[]; // ハイライト対象のセル
  overlayData?: HintOverlayData[]; // オーバーレイ表示データ
}

export interface HintOverlayData {
  position: Position;
  type: 'valid_move' | 'capturable' | 'threatened' | 'score_indicator' | 'move_count';
  content: string | number; // 表示内容（数値や記号）
  style: 'highlight' | 'warning' | 'info';
}

// ゲームコントローラーの共通インターフェース（厳密な型設計）
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
}

// ヒント機能付きコントローラー
export interface HintableGameController<TState extends BaseGameState, TAction> 
  extends BaseGameController<TState, TAction> {
  toggleHints: () => void;
  hintState: HintState;
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
export type ControlPanelState = 
  | { mode: 'desktop'; isVisible: true } // デスクトップでは常に表示
  | { mode: 'mobile'; isVisible: boolean }; // モバイルでは表示/非表示切り替え可能
```

### 2. レスポンシブフック (`hooks/useResponsive.ts`)

```typescript
// 厳密な型設計（和構造と積構造を活用）
export type ResponsiveState = 
  | { layoutMode: 'mobile'; screenWidth: number } // < 768px
  | { layoutMode: 'desktop'; screenWidth: number }; // >= 768px

// ヘルパー関数で判定
export const isMobile = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'mobile' } => 
  state.layoutMode === 'mobile';

export const isDesktop = (state: ResponsiveState): state is ResponsiveState & { layoutMode: 'desktop' } => 
  state.layoutMode === 'desktop';

export function useResponsive(): ResponsiveState;

// 使用例
const responsiveState = useResponsive();
if (isMobile(responsiveState)) {
  // モバイル専用の処理（型安全）
  console.log('Mobile layout with width:', responsiveState.screenWidth);
} else {
  // デスクトップ専用の処理（型安全）
  console.log('Desktop layout with width:', responsiveState.screenWidth);
}
  state.layoutMode === 'desktop';

export function useResponsive(): ResponsiveState;
```

### 3. 改良されたGameLayoutコンポーネント

```typescript
interface GameLayoutProps<TState extends BaseGameState, TAction> {
  gameName: string;
  slug: string;
  gameController: GameController<TState, TAction>;
  children: React.ReactNode;
  // ゲーム固有のステータス表示コンポーネント（オプション）
  statusComponent?: React.ComponentType<{ gameState: TState }>;
}

export function GameLayout<TState extends BaseGameState, TAction>(
  props: GameLayoutProps<TState, TAction>
): JSX.Element;
```

### 4. スコア情報の型定義（新規追加）

```typescript
// スコア/統計情報の表示用型定義
export interface ScoreInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}

// BaseGameControllerの拡張
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
  getDisplayStatus: () => string;
  // 新規追加: ゲーム固有のスコア/統計情報（オプショナル）
  getScoreInfo?: () => ScoreInfo | null;
}
```

### 5. コントロールパネルコンポーネント

```typescript
interface ControlPanelProps<TState extends BaseGameState, TAction> {
  gameController: GameController<TState, TAction>;
  gameName: string;
  slug: string;
  layoutMode: LayoutMode;
  // モバイル用
  isVisible?: boolean;
  onClose?: () => void;
}

export function ControlPanel<TState extends BaseGameState, TAction>(
  props: ControlPanelProps<TState, TAction>
): JSX.Element;
```

### 5. フローティングアクションボタン (FAB)

```typescript
interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  ariaLabel: string;
}

export function FloatingActionButton(props: FABProps): JSX.Element;
```

### 6. ボトムシート/モーダル

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet(props: BottomSheetProps): JSX.Element;
```

### 7. 共通UIコンポーネントライブラリ

```typescript
// 統一されたボタンコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

// 統一されたモーダルコンポーネント
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

// ゲーム内ヒント表示コンポーネント
interface HintOverlayProps {
  hint: HintData;
  onDismiss: () => void;
  position?: { x: number; y: number };
}
```

## データモデル

### ゲーム状態の拡張例

```typescript
// リバーシゲームの状態例
interface ReversiGameState extends BaseGameState {
  board: ('black' | 'white' | null)[][];
  blackScore: number;
  whiteScore: number;
  validMoves: Position[];
}

// 三目並べゲームの状態例
interface TicTacToeGameState extends BaseGameState {
  board: ('X' | 'O' | null)[];
  moveHistory: number[];
}
```

### レスポンシブ状態管理

```typescript
interface ResponsiveLayoutState {
  layoutMode: LayoutMode;
  controlPanelState: ControlPanelState;
  sidebarWidth: number; // PC用
  fabPosition: { bottom: number; right: number }; // モバイル用
}
```

## エラーハンドリング

### 1. レスポンシブ検出エラー
- ブラウザAPIが利用できない場合のフォールバック
- SSR時の初期レンダリング対応

### 2. ゲーム状態エラー
- 不正な状態遷移の検出と修正
- ゲームリセット時の状態クリーンアップ

### 3. UI状態エラー
- モーダル/ボトムシートの重複表示防止
- レイアウト切り替え時の状態保持

## テスト戦略

### 1. ユニットテスト
- **レスポンシブフック**: 画面サイズ変更時の状態変化
- **ゲームコントローラー**: 共通インターフェースの動作
- **レイアウトコンポーネント**: プロパティに応じた表示切り替え

### 2. インテグレーションテスト
- **レイアウト切り替え**: ブラウザリサイズ時の動作
- **ゲーム状態保持**: レイアウト変更時のデータ保持
- **モーダル操作**: FAB → ボトムシート → 操作の一連の流れ

### 3. ビジュアルリグレッションテスト
- **PC/モバイル表示**: 各デバイスでの表示確認
- **レスポンシブ境界**: ブレークポイント前後での表示
- **アニメーション**: ボトムシートのスライドアップ動作

### 4. E2Eテスト
- **デバイス切り替え**: PC → モバイル表示の切り替え
- **ゲームプレイ**: 各レイアウトでのゲーム操作
- **ナビゲーション**: ページ遷移時のレイアウト保持

## パフォーマンス考慮事項

### 1. レンダリング最適化
- `useMemo`/`useCallback`によるレスポンシブ計算の最適化
- レイアウト切り替え時の不要な再レンダリング防止

### 2. CSS-in-JS最適化
- スタイルオブジェクトのメモ化
- 条件付きスタイルの効率的な適用

### 3. モバイル最適化
- タッチイベントの最適化
- ボトムシートアニメーションのパフォーマンス

### 4. バンドルサイズ
- レスポンシブ関連コードの適切な分割
- 使用されないスタイルの除去

## 実装フェーズ

### フェーズ1: 基盤整備
- 拡張可能な共通型定義の作成
- レスポンシブフックの実装
- ブレークポイントシステムの構築

### フェーズ2: 共通UIコンポーネントライブラリ
- 統一されたButton、Modal、HintOverlayコンポーネントの実装
- 一貫性のあるデザインシステムの構築
- アクセシビリティ対応

### フェーズ3: レスポンシブレイアウトコンポーネント
- GameLayoutコンポーネントの改良
- ControlPanelコンポーネントの実装
- FAB/BottomSheetコンポーネントの実装

### フェーズ4: 既存ゲームの移行
- 既存ゲームのGameController対応
- レスポンシブレイアウトの適用
- 共通UIコンポーネントの適用

### フェーズ5: 拡張機能の実装
- ヒント機能の基盤実装
- 将来のゲームタイプ対応の準備
- パフォーマンス最適化

### フェーズ6: テストと品質保証
- 各種テストの実装
- ブラウザ互換性確認
- アクセシビリティ監査

## 将来の拡張シナリオ

### 1. リアルタイムゲーム対応
- WebSocket統合
- リアルタイム状態同期
- 接続状態管理

### 2. AI対戦機能
- AI思考状態の表示
- 難易度設定
- 思考時間の調整

### 3. マルチプレイヤー対応
- プレイヤー管理
- ターン順序制御
- 観戦モード

これらの拡張は、現在の設計を基盤として段階的に実装可能です。