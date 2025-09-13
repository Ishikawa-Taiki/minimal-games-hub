# 状態管理アーキテクチャの分析と設計提案

## 1. 要件定義

本プロジェクトにおける全ゲームを対象とした、汎用的な状態管理システムの設計と実装に関する要件を以下に定義する。

### 1.1. 機能要件

#### 1.1.1. タイムトラベル（履歴操作）機能
すべてのゲームにおいて、以下の履歴操作を可能にすること。この操作は、各ゲーム画面の外部にある共通のUI（コントロールパネルなど）から実行できることを前提とする。

-   **一手戻る（Undo）**: 現在の状態から一手前の状態に戻る。
-   **一手進む（Redo）**: 戻した状態から一手後の状態に進む。
-   **最初の状態へ移動**: ゲーム開始時の状態に移動する。
-   **最新の状態へ移動**: 最新の進行状態に移動する。
-   **特定の位置へ移動**: 履歴の任意の位置の状態に移動する。

#### 1.1.2. 状態の再現（Reconstruction）
任意のゲーム状態（盤面など）を直接インポートし、その状態からゲームを開始できる機能を設けること。これは以下の目的で利用される。

-   **テスト**: 複雑な盤面のテストケースを容易に作成する。
-   **開発**: 特定のシナリオ（例: 終盤の局面）を再現し、デバッグやバランス調整を効率化する。
-   **コンテンツ作成**: 特定の難易度を持つ盤面や、チャレンジモードのような特殊な初期状態を提供する。

### 1.2. 非機能要件

#### 1.2.1. 関心の分離 (Separation of Concerns)
-   本機能は、特定のゲームロジックに依存しない、汎用的な共通モジュールとして実装すること。
-   ゲームごとの状態管理ロジック（UIの状態など）と、ゲームのルール（`core.ts`に記述される純粋なロジック）を明確に分離する。
-   UI（View）コンポーネントは、状態管理の詳細な実装に関知しない設計とする。

#### 1.2.2. テスト容易性 (Testability)
-   状態遷移のロジック（Reducer）、および状態管理のメカニズム（Engine/Hook）は、それぞれが独立してユニットテスト可能であること。

#### 1.2.3. アーキテクチャ方針
-   **アクションベースの履歴管理**: 履歴は、各時点での完全な状態スナップショットではなく、「初期状態」とそれに続く一連の「操作（Action）」のリストとして保持すること。
-   **状態の導出**: 現在のゲーム状態は、初期状態に対して、履歴内の指定位置までのアクションを順次適用（畳み込み/reduce）することで動的に導出する。
-   この方針は、ReduxやFluxなどの設計思想を参考にし、メモリ効率とロジックの純粋性を高めることを目的とする。

## 2. 現状アーキテクチャの分析

`src/core/types/game.ts`、`src/games/reversi/core.ts`、`src/games/reversi/useReversi.ts`、および関連する意思決定ログを分析した結果、現状のアーキテクチャは以下の特徴を持つ。

### 2.1. 評価できる点 (Pros)

-   **関心の分離の徹底**:
    -   ゲームの純粋なルールや状態遷移ロジックが `core.ts` に明確に分離されている。このファイルはReactなどのUIフレームワークに依存しておらず、単体でテスト可能であり、再利用性が高い。
    -   UIコンポーネント (`index.tsx`) と、ロジックを繋ぐカスタムフック (`useReversi.ts`) が分離されており、見通しが良い構造になっている。
-   **共通インターフェースの存在**:
    -   `src/core/types/game.ts` にて、`BaseGameState` や `HistoryGameController` といった共通の型やインターフェースが定義されている。これは、全ゲームに共通の機能を導入するための優れた基盤となる。

### 2.2. 課題 (Cons)

-   **履歴管理の実装が場当たり的**:
    -   意思決定ログにもあるように、リバーシの履歴機能は `useReversi.ts` 内で `useState` を用いて個別実装されている。これにより、以下の問題が生じている。
        1.  **再利用性の欠如**: 他のゲームに履歴機能を導入する場合、同様のロジックを再度実装する必要がある。
        2.  **メモリ非効率**: 履歴を「状態スナップショットの配列 (`GameState[]`)」として保持しているため、ゲームが複雑化し、状態オブジェクトが大きくなるにつれて、メモリ消費量が線形に増加する。
-   **状態管理手法の不統一**:
    -   `BaseGameController` のインターフェースでは `dispatch` が定義されており、`useReducer` の利用が示唆されているが、`useReversi` の実装では `useState` が採用されている。これにより、 `dispatch` が空の関数として返されるなど、設計と実装に乖離が生じている。
-   **状態再現機能の欠如**:
    -   現状では、特定の盤面を外部から与えて状態を初期化する、汎用的な仕組みは存在しない。

### 2.3. 総括

現状のアーキテクチャは、ゲームロジックの純粋性を保つという点で優れた基盤を持っている。しかし、履歴管理などの横断的な機能については、特定のゲーム内に閉じた個別実装に留まっており、スケールしない構造になっている。

ユーザーが要求する「汎用的で、メモリ効率が良く、テスト容易性の高い状態管理システム」を構築するには、この個別実装されたロジックを抽出し、共通化されたメカニズムとして再設計する必要がある。

## 3. 設計提案

現状の課題を解決し、要件を満たすために、状態管理ロジックをカプセル化した汎用カスタムフック **`useGameEngine`** の導入を提案する。

### 3.1. 設計思想

-   **単一責任の原則**: `useGameEngine` は、履歴管理（Undo/Redo）、状態の計算、状態の再現といった横断的な関心事にのみ責任を持つ。
-   **ゲームロジックの注入**: 各ゲーム固有のルール（状態遷移）は、純粋な `reducer` 関数として `useGameEngine` に注入する。これにより、共通部分と個別部分を完全に分離する。
-   **アクションベースの履歴**: 履歴はメモリ効率の良い「アクションの配列」として保持し、状態は都度計算することで導出する。

### 3.2. 主要コンポーネントの定義

#### 3.2.1. `GameEngine<TState, TAction>`

`useGameEngine`フックが返すコントローラーオブジェクトのインターフェース。

```typescript
export interface GameEngine<TState, TAction> {
  // 現在のゲーム状態
  gameState: TState;
  // アクションを発行し、状態を更新する
  dispatch: (action: TAction) => void;
  // ゲームを初期状態にリセットする
  reset: () => void;
  // 任意の状態を復元する
  reconstruct: (state: TState) => void;

  // --- タイムトラベル機能 ---
  // 履歴を一手戻す
  undo: () => void;
  // 履歴を一手進める
  redo: () => void;
  // 履歴の指定したインデックスに移動する
  goToIndex: (index: number) => void;
  // 履歴の先頭に移動する
  goToStart: () => void;
  // 履歴の最後に移動する
  goToEnd: () => void;

  // --- 履歴情報 ---
  // 実行されたアクションの全履歴
  history: readonly TAction[];
  // 現在の履歴ポインタ
  currentIndex: number;
  // undo/redoが可能かどうかのフラグ
  canUndo: boolean;
  canRedo: boolean;
}
```

#### 3.2.2. `useGameEngine<TState, TAction>` フック

汎用のゲームエンジンフック。

-   **引数**:
    -   `reducer: (state: TState, action: TAction) => TState`: ゲーム固有の状態遷移ロジックを定義した純粋関数。
    -   `initialState: TState`: ゲームの初期状態。
-   **返り値**: `GameEngine<TState, TAction>` インターフェースを実装したオブジェクト。

**実装（擬似コード）:**

```typescript
function useGameEngine<TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState
): GameEngine<TState, TAction> {

  const [history, setHistory] = useState<TAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 現在の状態は、初期状態にアクション履歴を畳み込んで計算する
  const gameState = useMemo(() => {
    return history.slice(0, currentIndex).reduce(reducer, initialState);
  }, [history, currentIndex, initialState, reducer]);

  const dispatch = useCallback((action: TAction) => {
    // 履歴の途中にいる場合、それ以降の履歴を破棄して新しい分岐を作成
    const newHistory = [...history.slice(0, currentIndex), action];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length);
  }, [history, currentIndex]);

  const reset = useCallback(() => {
    setHistory([]);
    setCurrentIndex(0);
  }, []);

  const reconstruct = useCallback((newState: TState) => {
    // 状態再現は、履歴をリセットし、新しい初期状態とみなすことで実現
    // ※ 実際の初期状態を上書きするため、カスタムフック内で工夫が必要
    // 例：内部で`useState<TState>(initialState)`を持ち、それを更新する
    // この例では簡略化のため、resetで代用
    console.log("Reconstructing state:", newState);
    reset();
    // ここで newState を新しい初期状態として設定するロジックを追加
  }, [reset]);

  const undo = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(i => Math.min(history.length, i + 1));
  }, [history]);

  // ... goToIndex, goToStart, goToEnd などの実装 ...

  return {
    gameState,
    dispatch,
    reset,
    reconstruct,
    undo,
    redo,
    // ...その他
  };
}
```

### 3.3. リファクタリング例 (`useReversi.ts`)

新しい `useGameEngine` を導入することで、`useReversi.ts` は大幅に簡潔になる。

**変更前 (抜粋)**

```typescript
// useReversi.ts (現状)
export function useReversi(): ReversiController {
  const [gameHistory, setGameHistory] = useState<ReversiGameState[]>([createInitialReversiState()]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const gameState = gameHistory[currentHistoryIndex];

  const makeMove = useCallback((row: number, col: number) => {
    const newState = reversiReducer(gameState, { type: 'MAKE_MOVE', row, col });
    const newHistory = [...gameHistory.slice(0, currentHistoryIndex + 1), newState];
    setGameHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [/* ... */]);

  const undoMove = useCallback(() => {
    if (canUndo) setCurrentHistoryIndex(prev => prev - 1);
  }, [/* ... */]);

  // ... redo, resetなど、履歴管理のロジックが多数存在する ...
}
```

**変更後 (イメージ)**

```typescript
// src/core/hooks/useGameEngine.ts (新規作成)
// ここに前述の useGameEngine の実装を配置

// src/games/reversi/useReversi.ts (リファクタリング後)
import { useGameEngine } from '@/core/hooks/useGameEngine';
import { reversiReducer, createInitialState } from './core'; // coreからreducerと初期状態をインポート

export function useReversi(): ReversiController {
  const {
    gameState,
    dispatch,
    reset,
    reconstruct, // 状態再現機能
    undo,      // タイムトラベル機能
    redo,
    // ...その他GameEngineの返り値
  } = useGameEngine(reversiReducer, createInitialState());

  // ゲーム固有の操作は、dispatchを呼び出すだけのシンプルな関数になる
  const makeMove = (row: number, col: number) => {
    dispatch({ type: 'MAKE_MOVE', payload: { row, col } });
  };

  // UIが必要とするコントローラーの形式に変換して返す
  return {
    gameState,
    makeMove,
    reset,
    reconstruct,
    undoMove: undo,
    redoMove: redo,
    // ... その他、必要な値をマッピング
  };
}
```
※ `reversiReducer` は `core.ts` のロジックをラップする形で調整が必要。

### 3.4. 期待される効果

この設計変更により、以下のメリットが期待される。

-   **再利用性の向上**: `useGameEngine` はどのゲームからも再利用可能。新しいゲームに履歴機能を追加する際は、`reducer`と`initialState`を渡すだけで済む。
-   **関心の分離**: `useReversi`フックは「リバーシ固有の操作を`dispatch`に変換する」という責務に集中でき、複雑な履歴管理ロジックから解放される。
-   **メモリ効率の改善**: 状態スナップショットの配列ではなく、軽量な`Action`オブジェクトの配列を保持するため、メモリ使用量を大幅に削減できる。
-   **テスト容易性の向上**:
    -   `reversiReducer`は純粋関数として、入力と出力のテストが容易。
    -   `useGameEngine`フックも、汎用的な振る舞いについて独立してテスト可能。
-   **要件の充足**: タイムトラベル機能と状態再現機能が、汎用的なインターフェースを通じて提供される。
