# 実装計画 - 汎用ゲームエンジン

## 概要

本実装計画では、要件定義と設計書に基づき、全ゲーム共通の状態管理エンジンを段階的に実装する。

-   **Phase 1**: 状態管理の基盤となる、アクション合成によるエンジンを構築する。（完了）
-   **Phase 2**: Phase 1の基盤上に、タイムトラベル機能と状態再現機能を追加する。（今回計画）

---

## Phase 1: 状態合成基盤の構築（完了）

### 1. 基盤実装

- [x] 1.1 `useGameEngine` フックの新規作成
- [x] 1.2 `GameEngineDebugUtils` クラスの新規作成
- [x] 1.3 `useGameEngine` の単体テスト作成
- [x] 1.4 `GameEngineDebugUtils` の単体テスト作成

### 2. TicTacToe ゲームでの検証実装

- [x] 2.1 TicTacToe の reducer 実装
- [x] 2.2 `useGameEngine` を使用した新しい `useTicTacToe` フックの作成
- [x] 2.3 新しい `useTicTacToe` のためのテスト作成
- [x] 2.4 TicTacToe の実装切り替えと旧コード削除

---

## Phase 2: タイムトラベル機能の実装（計画）

### 3. `useGameEngine`の機能拡張

- [ ] 3.1 履歴ポインタ `currentIndex` の導入
  - `useGameEngine`フック内に`currentIndex`の状態を追加する。
  - _要件: 5.1, 5.5_

- [ ] 3.2 タイムトラベル機能の実装
  - `undo`, `redo`, `goToIndex`関数を実装し、`currentIndex`を操作するロジックを追加する。
  - _要件: 5.1, 5.2, 5.5_

- [ ] 3.3 履歴分岐機能の実装
  - `dispatch`関数を修正し、履歴の途中で新しいアクションが発行された場合に、それ以降の古い履歴を破棄するロジックを追加する。
  - _要件: 6.1_

- [ ] 3.4 状態再現機能の実装
  - `reconstruct`関数を実装し、任意のアクション列から状態を復元できるようにする。
  - _要件: 7.1, 7.2_

### 4. テストの拡張

- [ ] 4.1 タイムトラベル機能の単体テスト作成
  - `undo`, `redo`, `goToIndex`が`currentIndex`と`canUndo`/`canRedo`フラグを正しく更新することを検証する。
  - _要件: 5.3, 5.4_

- [ ] 4.2 履歴分岐のテスト作成
  - 履歴の途中での`dispatch`が、正しく新しい分岐を作成することを検証する。
  - _要件: 6.1_

### 5. リバーシゲームへの適用

- [ ] 5.1 リバーシの reducer 実装
  - `src/games/reversi/core.ts`のロジックをラップする`reversiReducer`を新規作成する。

- [ ] 5.2 `useReversi`フックのリファクタリング
  - 既存の`useReversi`フックから、独自の履歴管理ロジック (`gameHistory`, `currentHistoryIndex`など) を削除する。
  - 拡張された`useGameEngine`を使用するように全面的に書き換える。

- [ ] 5.3 リバーシのテスト更新
  - リファクタリングに伴い、`useReversi`のテストを修正する。
  - タイムトラベル機能（undo/redo）の動作をE2Eテストで確認する。

### 6. デバッグ機能の統合

- [ ] 6.1 `GameDebugger`コンポーネントの機能拡張
  - 拡張された`useGameEngine`の`actions`と`currentIndex`を使い、タイムトラベルUIを実装する。
  - Undo/Redoボタンと、履歴を直接クリックして移動できるUIを提供する。

### 7. 全ゲームへの展開とドキュメント更新

- [ ] 7.1 残りの全ゲームを新しい`useGameEngine`に移行する。
- [ ] 7.2 `technical-guide-application-architecture.md`を更新し、新しい状態管理パターンを正式なものとして記載する。