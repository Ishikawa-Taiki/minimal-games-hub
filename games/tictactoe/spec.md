# Tic-Tac-Toe システム仕様

## 1. システム概要
3x3のグリッド上で動作する2人対戦の○×ゲームです。コアロジック (`core.ts`) とUI (`index.tsx`) を分離しており、`core.ts`がゲームの状態管理とロジック計算を担当し、`index.tsx`がその状態を描画することに専念します。

## 2. データ構造
ゲームの状態は `core.ts` 内の `GameState` インターフェースで定義されます。
-   `board`: `Player[][]` 型の3x3配列で、各マスの状態（`'X'`, `'O'`, `null`）を保持します。
-   `currentPlayer`: 現在のプレイヤー（`'X'` または `'O'`）を保持します。
-   `winner`: 勝者（`'X'` または `'O'`）または `null` を保持します。
-   `isDraw`: 引き分け状態かどうかを `boolean` で保持します。
-   `winningLines`: 勝利ラインのインデックス配列（例: `[[0, 1, 2]]`）または `null` を保持します。
-   `reachingLines`: リーチ状態のセルのインデックスとプレイヤーの配列を保持します。

## 3. ユーザーインタラクション
-   **マス選択:** ユーザーが空いているマスをクリックすると、`index.tsx`が`core.ts`の`handleCellClick`関数を呼び出し、状態を更新します。
-   **リセット:** リセットボタンをクリックすると、`core.ts`の`createInitialState`関数でゲームの状態が初期化されます。

## 4. ゲームロジック
ゲームのコアロジックはすべて `games/tictactoe/core.ts` に集約されています。
-   `createInitialState()`: ゲームの初期状態を生成します。
-   `handleCellClick(currentState, row, col)`: プレイヤーのクリックを処理し、新しいゲーム状態を返します。無効な手の場合は `null` を返します。
-   `checkWinner(board)`: 盤面を受け取り、勝者と勝利ラインを判定します。
-   `checkDraw(board)`: 盤面が引き分けかどうかを判定します。
-   `checkAllReachingLines(board)`: リーチ状態のセルを検出します。

## 5. 描画と表示
描画は `games/tictactoe/index.tsx` コンポーネントが担当します。
-   **状態管理:** `core.ts` から提供される `GameState` を `useState` フックで管理します。
-   **ゲームボード:** `GameState.board` をもとに3x3のグリッドを描画します。
-   **ステータス表示:** `GameState` の `winner`, `isDraw`, `currentPlayer` に基づいて、現在の状況をテキストで表示します。
-   **スタイル:** スタイルは `index.tsx` 内のStyleオブジェクトで定義されます。
-   **ハイライト:** `GameState` の `winningLines` と `reachingLines` に基づいて、該当するセルをハイライトします。

## 6. エラーハンドリングと例外処理
-   **無効な操作:** `handleCellClick`関数が無効な操作（既にマークが置かれているマスをクリックするなど）を検知し、`null`を返すことで状態の更新を防ぎます。
-   **データ不整合:** （現時点では想定しないが、将来的に）ゲームの状態データに不整合が生じた場合、適切なエラーメッセージを表示するか、ゲームを初期状態に戻すなどの処理を行います。