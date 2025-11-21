# 状態管理アーキテクチャの分析と設計

## 1. 全体要件

本プロジェクトにおける全ゲームを対象とした、汎用的な状態管理システムの最終目標を以下に定義する。

### 1.1. 機能要件

#### 1.1.1. タイムトラベル（履歴操作）機能
すべてのゲームにおいて、以下の履歴操作を可能にすること。

-   一手戻る（Undo） / 一手進む（Redo）
-   最初の状態や最新の状態への移動
-   履歴内の任意の位置の状態への移動

#### 1.1.2. 状態の再現（Reconstruction）
任意のゲーム状態をインポートし、その状態からゲームを開始できる機能を設けること。

### 1.2. 非機能要件

-   **関心の分離**: ゲーム固有のロジックと汎用的な状態管理エンジンを明確に分離する。
-   **テスト容易性**: 状態遷移ロジックと状態管理エンジンを、それぞれ独立してテスト可能にする。
-   **アクションベースの履歴管理**: 履歴を「初期状態」と「操作（Action）のリスト」として保持し、メモリ効率とロジックの純粋性を高める。

---

## 2. 現状アーキテクチャの分析 (Phase 1完了時点)

現在のコードベースは、`useGameEngine`フックを中心とした、明確な責務分離を持つ優れたアーキテクチャを確立している。これは要件実現のための強力な基盤となる。

### 2.1. 評価できる点 (Pros)

-   **関心の分離の徹底**:
    -   `useGameEngine`は汎用的な状態計算、各ゲームの`useXxx`フックはゲーム固有ロジック、UIコンポーネントは描画、という3層の責務分離が実現されている。
-   **ロジックの純粋性と再利用性**:
    -   ゲームルールが純粋な`reducer`関数に凝縮されているため、テストが容易である。
    -   `useGameEngine`は、新しいゲームを開発する際に容易に再利用可能である。
-   **状態管理手法の統一**:
    -   「初期状態 + アクション列」という統一されたアプローチにより、状態の予測可能性と再現性の基盤が整っている。リバーシのようなゲーム独自の状態管理が不要になる道筋が示されている。

### 2.2. 課題と次フェーズへの展望 (Cons)

-   **履歴操作機能の不在**:
    -   現在の`useGameEngine`は、アクションを履歴の末尾に追加するのみで、履歴を遡る（Undo/Redo）機能はない。
-   **状態再現機能の不在**:
    -   任意の盤面をインポートしてゲームを開始する仕組みはまだない。

### 2.3. 総括

現状のアーキテクチャは、Phase 1として、状態管理の堅牢な基盤を構築することに成功している。次のステップは、この基盤の上に、当初の要件であったタイムトラベル機能と状態再現機能を構築することである。

---

## 3. 設計提案 (Phase 2)

現状の`useGameEngine`を拡張し、完全なタイムトラベル機能を実現する。

### 3.1. 設計思想

-   **単一責任の原則の維持**: `useGameEngine`の責務は状態管理に集中させ、ゲーム固有のロジックは引き続き`reducer`として外部から注入する。
-   **履歴ポインタの導入**: アクション履歴 (`history`) に加え、履歴上の現在位置を示すポインタ (`currentIndex`) を導入する。これにより、Undo/Redoが可能になる。

### 3.2. `useGameEngine`の拡張設計

#### 3.2.1. 拡張後のインターフェース (`GameEngine<TState, TAction>`)
`useGameEngine`フックが返すコントローラーオブジェクトの目標インターフェース。

```typescript
export interface GameEngine<TState, TAction> {
  // --- 基本機能 (実装済み) ---
  gameState: TState;
  reset: () => void;

  // --- 拡張される機能 ---
  dispatch: (action: TAction) => void; // 履歴の途中からの分岐に対応

  // --- Phase 2で追加される機能 ---
  reconstruct: (actions: TAction[]) => void; // アクション列から状態を復元
  undo: () => void;
  redo: () => void;
  goToIndex: (index: number) => void;

  // --- 読み取り専用のデバッグ情報 ---
  readonly actions: readonly TAction[];
  readonly currentIndex: number;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}
```

#### 3.2.2. `useGameEngine` フックの実装方針
`useState`で`actions`と`currentIndex`を管理する。

**実装（擬似コード）:**
```typescript
function useGameEngine<TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState
): GameEngine<TState, TAction> {

  const [actions, setActions] = useState<TAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // gameStateは、currentIndexまでのアクションを畳み込んで計算する
  const gameState = useMemo(() => {
    return actions.slice(0, currentIndex).reduce(reducer, initialState);
  }, [actions, currentIndex, initialState, reducer]);

  const dispatch = useCallback((action: TAction) => {
    // 履歴の途中にいる場合、それ以降の履歴を破棄して新しいアクションを追加
    const newActions = [...actions.slice(0, currentIndex), action];
    setActions(newActions);
    setCurrentIndex(newActions.length);
  }, [actions, currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(i => Math.min(actions.length, i + 1));
  }, [actions]);

  // ... reconstruct, goToIndexなどの実装 ...

  return {
    gameState,
    dispatch,
    undo,
    redo,
    // ...その他
  };
}
```

### 3.3. 既存ゲームのリファクタリング (`useReversi.ts`の例)

`useReversi`に個別実装されている履歴管理ロジックを、拡張された`useGameEngine`に置き換える。これにより、リバーシは他のゲームと完全に同じ状態管理基盤に乗ることになる。

**リファクタリング後のイメージ:**
```typescript
// src/games/reversi/useReversi.ts (リファクタリング後)
import { useGameEngine } from '@/core/hooks/useGameEngine';
import { reversiReducer, createInitialState } from './reducer'; // reducerを別途定義

export function useReversi(): ReversiController {
  const gameEngine = useGameEngine(reversiReducer, createInitialState());

  // ゲーム固有の操作は、dispatchを呼び出すだけのシンプルな関数になる
  const makeMove = (row: number, col: number) => {
    gameEngine.dispatch({ type: 'MAKE_MOVE', payload: { row, col } });
  };

  // UIが必要とするコントローラーの形式に変換して返す
  return {
    gameState: gameEngine.gameState,
    makeMove,
    reset: gameEngine.reset,
    undo: gameEngine.undo, // GameEngineの機能をそのまま公開
    redo: gameEngine.redo,
    // ... その他、必要な値をマッピング
  };
}
```

### 3.4. 期待される効果

この拡張により、当初の要件がすべて満たされる。

-   **汎用的なタイムトラベル**: すべてのゲームでUndo/Redoが共通の仕組みで実現される。
-   **関心の完全な分離**: `useReversi`から履歴管理ロジックが完全に排除され、「ゲーム固有の操作を`dispatch`に変換する」という責務に集中できる。
-   **テスト容易性の向上**: 拡張された`useGameEngine`の履歴操作ロジックも、独立してテスト可能である。