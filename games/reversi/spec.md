# リバーシ システム仕様

## 1. システム概要
8x8の盤面でリバーシをプレイできるWebアプリケーションです。コアロジック (`core.ts`) とUI (`index.tsx`) を分離しており、`core.ts`がゲームの状態管理とロジック計算を担当し、`index.tsx`がその状態を描画することに専念します。

## 2. データ構造
ゲームの状態は `core.ts` 内の `GameState` インターフェースで定義されます。
-   `board`: `CellState[][]` 型の8x8配列で、各マスの状態（`'BLACK'`, `'WHITE'`, `null`）を保持します。
-   `currentPlayer`: 現在のプレイヤー（`'BLACK'` または `'WHITE'`）を保持します。
-   `scores`: 各プレイヤーの石の数を `{ BLACK: number; WHITE: number }` 形式で保持します。
-   `gameStatus`: ゲームの進行状態（`'PLAYING'`, `'SKIPPED'`, `'GAME_OVER'`）を保持します。
-   `validMoves`: 現在のプレイヤーが石を置ける有効なマスの情報を `Map` で保持します。

## 3. ユーザーインタラクション
-   **マス選択:** ユーザーが有効なマスをクリックすると、`index.tsx`が`core.ts`の`handleCellClick`関数を呼び出し、状態を更新します。
-   **リセット:** 「もう一度プレイ」ボタンをクリックすると、`core.ts`の`createInitialState`関数でゲームの状態が初期化されます。

## 4. ゲームロジック
ゲームのコアロジックはすべて `games/reversi/core.ts` に集約されています。
-   `createInitialState()`: ゲームの初期状態を生成します。
-   `handleCellClick(currentState, r, c)`: プレイヤーのクリックを処理し、新しいゲーム状態を返します。無効な手の場合は `null` を返します。
-   `getValidMoves(player, board)`: 指定されたプレイヤーの有効な手を計算して返します。

## 5. 描画と表示
描画は `games/reversi/index.tsx` コンポーネントが担当します。
-   **状態管理:** `core.ts` から提供される `GameState` を `useState` フックで管理します。
-   **ゲームボード:** `GameState.board` をもとに8x8のグリッドを描画します。
-   **スコア表示:** `GameState.scores` に基づいて、各プレイヤーのスコアと現在のターンをハイライト表示します。
-   **スタイル:** スタイルは `index.tsx` 内のStyleオブジェクトで定義されます。
-   **有効な手の表示:** `GameState.validMoves` に基づいて、石を置けるマスにひっくり返せる石の数を表示します。
-   **アニメーション:** 石がひっくり返る際には、一つずつ回転するアニメーションが実行されます。
-   **ゲーム終了表示:** `GameState.gameStatus` が `GAME_OVER` になると、結果をモーダルで表示します。

## 6. エラーハンドリングと例外処理
-   **無効な操作:** `handleCellClick`関数が無効な操作（石を置けないマスをクリックするなど）を検知し、`null`を返すことで状態の更新を防ぎます。
