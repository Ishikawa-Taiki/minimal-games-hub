# アプリケーションアーキテクチャ (APPLICATION ARCHITECTURE)

本ドキュメントは、本アプリケーションの構造と、新しいゲームを追加する際の規約について定義します。

## 1. ゲームの追加方法

新しいゲームを追加する際は、以下の手順に従ってください。

1.  プロジェクトルートの `games/` ディレクトリに、ゲーム用の新しいディレクトリ（例: `games/new-game`）を作成します。
2.  作成したディレクトリ内に、ゲームの実装（Reactコンポーネントなど）と、以下の必須ファイルを配置します。

### 1.1. ディレクトリ構成

各ゲームディレクトリ (`games/[slug]/`) には、最低限以下のファイルを含める必要があります。

```
/games/[slug]/
├── core.ts             # ゲームのコアロジック (UI非依存)
├── index.tsx           # ゲームのUIコンポーネント
├── manifest.json       # ゲームのメタデータ
├── spec-rules.md       # ゲームのルール (ユーザー向け)
├── spec-action.md      # システム動作仕様書
└── spec-display.md     # システム表示仕様書
```

### 1.2. manifest.json の仕様

`manifest.json` は、ゲームのメタデータを定義するファイルです。`types/game.ts` で定義された `GameManifest` 型に準拠する必要があります。

-   `name` (string): ゲームの正式名称（内部的な識別子、英語表記を推奨）。
-   `displayName` (string): ユーザーインターフェースに表示するゲーム名。子供でも読みやすいように、**漢字を避け、ひらがな・カタカナ・記号（○×など）を基本とする**（例: はさみしょうぎ, リバーシ, ○×ゲーム）。
-   `shortDescription` (string): トップページなどで表示する、ゲームの簡潔な説明文。
-   `path` (string): ゲームページへのパス (例: `/games/tictactoe`)。
-   `rulesFile` (string): `spec-rules.md` へのパス。
-   `specActionFile` (string): `spec-action.md` へのパス。
-   `specDisplayFile` (string): `spec-display.md` へのパス。

## 2. ゲーム実装の原則

すべてのゲーム実装は、テスト容易性と保守性を高めるため、以下の原則に厳密に従う必要があります。

### 2.1. ロジックとビューの分離
-   **コアロジック (`core.ts`):** ゲームのルール、状態遷移、勝敗判定など、UIに依存しない純粋なロジックをすべて担当します。このファイルはReactやDOMのAPIに依存してはなりません。
-   **ビューコンポーネント (`index.tsx`):** `core.ts`から提供されたゲーム状態を描画することに専念します。状態の更新は`core.ts`に委譲し、自身ではロジックを持ちません。

### 2.2. スタイリング
-   **CSS-in-JS アプローチ:** スタイリングには、オブジェクトベースのCSS-in-JSアプローチを採用します。
-   **スタイルファイルの分離:** スタイル定義は、コンポーネントファイルとは別の `styles.ts` ファイルに記述します。これにより、関心の分離を徹底します。
-   **`StyleSheet.create` の使用:** スタイルオブジェクトは、`app/styles/StyleSheet.ts` で提供される `StyleSheet.create` メソッドを使用して作成します。これにより、一貫性のあるスタイル定義を強制します。
-   **インラインスタイルの禁止:** コンポーネントのJSX内で直接インラインスタイルを記述することは原則として禁止し、必ず `styles.ts` からインポートしたスタイルオブジェクトを参照します。

### 2.3. UIテキストガイドライン
-   **ターゲット層への配慮:** 本プロジェクトのゲームは幼児をメインターゲットに想定しているため、UIに表示されるすべてのテキストは、子供が容易に理解できることを最優先とします。
-   **漢字の使用:** 難しい漢字の使用は避け、ひらがな、カタカナ、または簡単な記号で表現することを原則とします。
-   **統一性:** ゲーム間で表現の統一性を保ち、ユーザーが混乱しないように努めます。
- **「おしえて！」機能の呼称:** 「ヒント」機能は、子供にも分かりやすいように「おしえて！」という呼称で統一します。

### 2.5. ヒント機能の設計指針

ゲームの「おしえて！」（ヒント）機能は、以下の2種類に明確に分類し、それぞれ異なる振る舞いを提供します。

-   **1. 操作性のためのヒント（常時表示）:**
    -   **目的:** プレイヤーが「何を」「どこに」動かせるかという、基本的な操作方法を伝えるための視覚的補助。
    -   **具体例:**
        -   現在の手番で操作可能な駒のマスをハイライトする。
        -   駒を選択した際に、その駒が移動できる全てのマスをハイライトする。
    -   **ルール:** これらはゲームの基本的な操作性に関わるため、**「おしえて！」機能のON/OFF状態に関わらず、常に表示される必要があります。**

-   **2. 戦略的ヒント（任意表示）:**
    -   **目的:** 次の一手による結果や、盤面の有利・不利といった、より高度な戦略的情報を提供するための補助。
    -   **具体例:**
        -   あるマスに移動した場合に、次の手で相手に取られてしまう「危険マス」の表示。
        -   移動先に相手の駒があり、それを捕獲できる場合の「捕獲可能マス」の特別な表示。
        -   相手の次の手で取られる可能性がある自駒の警告表示。
    -   **ルール:** これらはゲームの戦略に直接的に影響を与えるため、**「おしえて！」ボタンがONの場合にのみ表示される必要があります。**

この分類により、初心者は基本的な操作に迷うことなくゲームを進められ、上級者は必要に応じて戦略的なヒントを得られるようになります。新しいゲームを実装する際は、この指針に従ってヒント機能を設計してください。

### 2.4. テストコードの記述

#### 2.4.1. ユニットテスト
-   **テスト対象:** ゲームのコアロジック (`core.ts`)。
-   **テストファイルの配置:** 各ゲームの `core.ts` に対応するテストファイルは、同じディレクトリ内に `core.test.ts` として配置します。
-   **テストの粒度:** 各テストケースは、ゲームロジックの特定の機能やシナリオを検証する、独立した粒度で記述します。
-   **テストタイトル:** 各 `it` ブロックのテストタイトルには、そのテストケースが何を検証しているのかを簡潔に説明する日本語の文言を記述します。これにより、テストが失敗した際に、その内容がすぐに理解できるようになります。

#### 2.4.2. E2Eテスト
-   **テスト対象:** ユーザー操作を伴う画面遷移。
-   **テストフレームワーク:** Playwrightを使用します。
-   **テストファイルの配置:** E2Eテストは `tests/` ディレクトリに配置します。ファイル名は `*.spec.ts` という命名規則に従います。
    -   例: `tests/navigation.spec.ts` は、サイト全体のナビゲーションに関するテストを格納します。
-   **テストの責務:** 各テストは、特定のユーザーシナリオ（例: トップページからゲームページへの遷移）をシミュレートし、**正しいURLに遷移すること**を表明(assert)します。**遷移先のコンテンツ表示の正確性については、このE2Eテストの範囲外とします。**

## 3. 共通コンポーネント

ゲーム間で共通して利用できるUIコンポーネントを `app/components/` に配置しています。

-   **`GameLayout.tsx`**: 全ゲーム共通のレイアウトを提供します。ゲームタイトル、ルール表示ボタン、ホームへのリンクを含むヘッダーと、ゲーム本体を描画するメイン領域で構成されます。
-   **`MarkdownViewer.tsx`**: Markdown文字列をHTMLに変換して表示するコンポーネントです。

### 3.1. 依存方向の原則

`app/` ディレクトリ配下に配置される共通コンポーネント（例: `app/components/GameLayout.tsx`）は、`games/` ディレクトリ配下の個別のゲーム実装に直接依存してはなりません。

これは、共通コンポーネントが特定のゲームのロジックや構造に縛られることなく、再利用性と保守性を高めるための重要な原則です。

-   **許可される依存:**
    -   `app/components/` -> `types/` (共通の型定義)
    -   `app/components/` -> `app/styles/` (共通のスタイル定義)
    -   `app/components/` -> `hooks/` (共通のカスタムフック)
    -   `app/components/` -> `public/` (静的アセット)

-   **禁止される依存:**
    -   `app/components/` -> `games/` (個別のゲーム実装)

共通コンポーネントがゲーム固有の情報を必要とする場合は、プロパティ（props）として受け取るか、GameControllerアーキテクチャを通じて抽象化されたインターフェースを利用してください。

**重要**: 共通コンポーネントの詳細な使用方法、実装パターン、トラブルシューティングについては、**必ず** `docs/rules/technical-guide-common-components.md` を参照してください。特に新しいゲームを実装する際や既存ゲームを修正する際は、このガイドに従って適切な共通コンポーネントを使用することが必須です.

## 4. GameControllerアーキテクチャ（2025年8月更新）

### 4.1. 概要

レスポンシブデザイン対応に伴い、統一されたGameControllerアーキテクチャを導入しました。すべてのゲームは、共通のインターフェースに準拠したカスタムフックを実装する必要があります。

### 4.2. 基本インターフェース

#### BaseGameController
すべてのゲームコントローラーが実装すべき基本インターフェース：

```typescript
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
  getDisplayStatus: () => string;
  getScoreInfo?: () => ScoreInfo | null; // ポリモーフィック設計
}
```

#### 拡張インターフェース
ゲームの機能に応じて以下のインターフェースを組み合わせて使用：

- **HintableGameController**: 「おしえて！」機能（ヒント機能）を持つゲーム。`setHints(enabled: boolean)` メソッドでON/OFFを制御します。
- **HistoryGameController**: 履歴機能（undo/redo）を持つゲーム

### 4.3. ポリモーフィック設計

#### ScoreInfo型による統一表示
各ゲームが独自のスコア/統計情報を提供するための標準化された型：

```typescript
export interface ScoreInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}
```

#### 実装例
```typescript
// はさみ将棋の場合
getScoreInfo: () => ({
  title: '捕獲数',
  items: [
    { label: '「歩」', value: gameState.capturedPieces.PLAYER2 },
    { label: '「と」', value: gameState.capturedPieces.PLAYER1 }
  ]
})

// アニマルチェスの場合
getScoreInfo: () => ({
  title: '捕獲駒数',
  items: [
    { label: 'プレイヤー1', value: `${gameState.capturedPieces.SENTE.length}個` },
    { label: 'プレイヤー2', value: `${gameState.capturedPieces.GOTE.length}個` }
  ]
})
```

### 4.4. GameLayoutとの連携

GameLayoutコンポーネントは、ポリモーフィック設計により各ゲームのスコア情報を自動的に表示します：

```typescript
// GameLayout内での自動表示
const renderScoreInfo = () => {
  if ('getScoreInfo' in gameController && typeof gameController.getScoreInfo === 'function') {
    const scoreInfo = gameController.getScoreInfo();
    if (scoreInfo) {
      return (
        <div style={gameLayoutStyles.scoreInfo}>
          <h4>{scoreInfo.title}</h4>
          <div>
            {scoreInfo.items.map((item, index) => (
              <span key={index}>{item.label}: {item.value}</span>
            ))}
          </div>
        </div>
      );
    }
  }
  return null;
};
```

### 4.5. 新しいゲーム実装時の注意点

1. **GameControllerフックの実装**: `useGameName`形式のカスタムフックを作成
2. **インターフェース準拠**: 適切なGameControllerインターフェースを実装
3. **getScoreInfo実装**: スコア表示が必要な場合は必ず実装
4. **テスト実装**: @testing-library/reactによるフックテストを必須実装
5. **GameLayoutの修正不要**: ポリモーフィック設計により自動対応

### 4.6. 参考実装

- **完全実装**: `games/hasami-shogi/useHasamiShogi.ts`
- **完全実装**: `games/animal-chess/useAnimalChess.ts`
- **基本実装**: `games/tictactoe/useTicTacToeController.ts`
- **履歴機能付き**: `games/reversi/useReversi.ts`

## 5. 型定義

プロジェクト全体で利用する型定義は `types/` ディレクトリに配置します。

-   **`game.ts`**: `GameManifest`、GameControllerインターフェース、ScoreInfo型など、ゲームに関連する型を定義します。

## 6. レスポンシブアーキテクチャ

本アプリケーションは、PCとモバイルデバイスで最適なUI/UXを提供するための、統一されたレスポンシブアーキテクチャを採用しています。

-   **PC (幅768px以上):** サイドバーレイアウト
-   **モバイル (幅768px未満):** ミニマルレイアウト（FAB + ボトムシート）

このアーキテクチャは、`useResponsive`フックと共通の`GameLayout`コンポーネントによって実現されます。

**重要:** レスポンシブデザインに関する技術的な詳細、コンポーネント構造、実装ガイドラインについては、**必ず**以下の専門ドキュメントを参照してください。

-   **[技術ガイド - レスポンシブアーキテクチャ](./technical-guide-responsive-architecture.md)**
