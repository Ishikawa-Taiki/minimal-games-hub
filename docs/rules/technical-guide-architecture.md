# 技術ガイド - アーキテクチャ (ARCHITECTURE)

本ドキュメントは、このリポジトリの全体的な構造、設計思想、および開発を進める上での規約を定義します。
開発者やAIエージェントがプロジェクトの全体像を素早く理解し、一貫性を保ちながら開発を進めるための基準情報となることを目的としています。

## 1. 基本思想

### 1.1. 判断基準
- **網羅的な全体像の提供:** 粗い粒度でプロジェクトの構造を視覚的に示し、原則としてトップレベルに存在する全ての主要なファイルとディレクトリについて言及します。
- **判断基準:** 新しいファイルを追加する際や、既存のコードを変更する際に、適切な配置場所を判断するための指針となります。
- **技術詳細の分離:** 本ドキュメントはプロジェクト固有の構造に焦点を当てます。採用フレームワーク（[Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/)等）の一般的なルールに関する詳細な説明は行いません。それらの情報は公式ドキュメントを参照してください。
- **外部リンクの活用:** 一般的な技術やツールについては、公式ドキュメント等へのリンクを積極的に用い、詳細な情報を辿れるようにします。
- **フォーマットの統一:** ディレクトリツリーのコメントは `# 役割概要 (ツール名)` の形式で記述します。

### 1.2. 3層のレイヤー構造
本プロジェクトのソースコードは、`src`ディレクトリ内に以下の3層のレイヤー構造で管理されます。
これにより、関心事の分離と見通しの良い依存関係を維持します。

1.  **`src/core` (下層):**
    - **役割:** 汎用的なUIコンポーネント、共有フック、型定義、スタイルなど、プロジェクト全体で再利用可能な基幹部品を格納します。
    - **原則:** このレイヤーのコードは、他のどのレイヤー（`games`, `app`）にも依存してはなりません。完全に独立した自己完結型のモジュールとして設計されます。

2.  **`src/games` (中層):**
    - **役割:** 各ゲーム固有のロジック、UI、フックなどを格納します。
    - **原則:** `core`レイヤーの部品を利用して構築されますが、`app`レイヤーの存在を知ることはありません。

3.  **`src/app` (上層):**
    - **役割:** Next.jsのルーティング（App Router）、グローバルレイアウト、各ゲームページの提供など、アプリケーション全体のエンドポイントとUI統合を担当します。
    - **原則:** `games`レイヤーと`core`レイヤーの機能を利用して、最終的なWebアプリケーションを構築します。

#### 依存関係のルール
**依存の方向は常に一方向（上層 → 中層 → 下層）でなければなりません。**

- **OK:** `app` → `games`, `app` → `core`, `games` → `core`
- **NG:** `core` → `games`, `core` → `app`, `games` → `app`

このルールを徹底することで、循環参照を防ぎ、コンポーネントやロジックの再利用性を高めます。

## 2. ディレクトリ構造

### 2.1. 俯瞰レベル
```
.
├── .devcontainer/  # 開発環境定義 (GitHub Codespaces)
├── .gemini/        # AIモデル設定 (Google Gemini)
├── .github/      # CI/CDワークフロー定義 (GitHub Actions)
├── .husky/       # Gitフック管理 (Husky)
├── .kiro/        # AI駆動開発IDEの設定 (Kiro)
├── .vscode/      # エディタ設定 (Visual Studio Code)
├── docs/         # プロジェクト関連ドキュメント
│   ├── logs/     # 意思決定・アクティビティログ
│   └── rules/    # プロジェクトルールや技術ガイド
├── public/       # 静的アセット
│   └── games/    # 各ゲームの公開アセット
├── scripts/      # 開発補助用のユーティリティスクリプト
├── src/          # アプリケーションのソースコード
│   ├── app/      # UI統合・ルーティング層 (Next.js App Router)
│   │   ├── components/ # App層固有のUIコンポーネント
│   │   ├── debug/      # UIコンポーネント等のデバッグページ
│   │   ├── games/      # 各ゲームページのコンテナ
│   │   ├── layout.tsx  # ルートレイアウト
│   │   └── page.tsx    # トップページ
│   ├── core/     # 汎用的な基盤部品層
│   │   ├── components/ # 汎用UIコンポーネント
│   │   │   └── ui/       # 基本的なUI部品（ボタン、モーダルなど）
│   │   ├── debug/      # デバッグ用ユーティリティ
│   │   ├── hooks/      # 共有カスタムフック
│   │   ├── styles/     # 共通スタイル定義
│   │   └── types/      # 共有の型定義
│   └── games/    # ゲーム実装層（各ゲームのロジックとUI）
├── tests/        # E2Eテスト (Playwright)
├── .gitignore    # バージョン管理除外設定 (Git)
├── AGENTS.md     # AIエージェント向け開発ガイド
├── ANALYSIS_AND_DESIGN.md # システムの分析・設計ドキュメント
├── LICENSE       # プロジェクトのライセンス情報
├── README.md     # プロジェクトの概要とセットアップ手順
├── eslint.config.mjs # ESLint設定ファイル (ESLint)
├── next.config.ts # 設定ファイル (Next.js)
├── package.json  # 依存関係とスクリプト定義 (npm)
├── package-lock.json # 依存関係バージョンロック (npm)
├── playwright.config.ts # E2Eテスト設定 (Playwright)
├── tsconfig.json # コンパイラ設定 (TypeScript)
├── vitest.config.mts # ユニットテスト設定 (Vitest)
└── vitest.setup.ts   # Vitestセットアップスクリプト (Vitest)
```
*NOTE: `node_modules`, `.next` のような、環境に依存する、あるいは自動生成されるディレクトリは意図的に除外しています。*

### 2.2. 各ディレクトリ・ファイルの詳細

#### ルートディレクトリ
- **`.devcontainer/`**: [GitHub Codespaces](https://github.com/features/codespaces) 上での開発環境を定義します。
- **`.gemini/`**: [Google Gemini](https://gemini.google.com/) モデルを利用する際の設定やキャッシュを格納します。
- **`.github/`**: [GitHub Actions](https://github.com/features/actions)を用いたCI/CDワークフロー定義を格納します。
- **`.husky/`**: [Husky](https://typicode.github.io/husky/)で管理されるGitフックを格納します。コミット前にリンターやテストを自動実行します。
- **`.kiro/`**: AWS製のAI仕様駆動開発IDE「[Kiro](https://kiro.dev/docs/)」に関連するファイルを格納します。
- **`.vscode/`**: [Visual Studio Code](https://code.visualstudio.com/) の設定（推奨拡張機能やデバッグ構成など）を格納します。
- **`docs/`**: プロジェクトに関連する全てのドキュメントを格納します。
- **`public/`**: ビルドプロセスを経ずに直接配信される静的アセット（画像、フォント、`manifest.json`など）を格納します。
- **`scripts/`**: ライセンス情報の自動更新など、開発ワークフローを補助するユーティリティスクリプトを格納します。
- **`src/`**: アプリケーションの全てのソースコードを格納します。（詳細は後述）
- **`tests/`**: [Playwright](https://playwright.dev/)を使用した、プロジェクト全体にまたがる横断的なE2E（エンドツーエンド）テストを格納します。
- **`.gitignore`**: [Git](https://git-scm.com/)のバージョン管理から除外するファイルやディレクトリを指定します。
- **`AGENTS.md`**: AIエージェントに対する指示や開発上のヒントを記述するファイルです。
- **`ANALYSIS_AND_DESIGN.md`**: システムの分析や設計に関する高レベルな思考プロセスを記録するドキュメントです。
- **`LICENSE`**: プロジェクトのライセンスを記載したファイルです。
- **`README.md`**: プロジェクトの概要、目的、技術スタック、基本的なセットアップ方法などを記述した、開発者が最初に読むべきドキュメントです。
- **`eslint.config.mjs`**: [ESLint](https://eslint.org/) の設定ファイルです。
- **`next.config.ts`**: [Next.js](https://nextjs.org/)のビルドや開発サーバーの挙動をカスタマイズするための設定ファイルです。
- **`package.json`**: プロジェクト名、バージョン、依存パッケージ、開発用スクリプトなどを定義する[npm](https://www.npmjs.com/)の構成ファイルです。
- **`package-lock.json`**: インストールされるパッケージの正確なバージョンを記録し、環境間での依存関係の一貫性を保証します。
- **`playwright.config.ts`**: E2Eテストフレームワーク [Playwright](https://playwright.dev/) の設定ファイルです。
- **`tsconfig.json`**: [TypeScript](https://www.typescriptlang.org/)コンパイラの設定ファイルです。
- **`vitest.config.mts`**: ユニットテストフレームワーク [Vitest](https://vitest.dev/) の設定ファイルです。
- **`vitest.setup.ts`**: [Vitest](https://vitest.dev/) のテスト実行前に読み込まれるセットアップスクリプトです。

#### `src` ディレクトリ
- **`src/app/` (UI統合・ルーティング層)**
    - **役割**: [Next.js App Router](https://nextjs.org/docs/app)に基づき、アプリケーション全体のエンドポイントとUI統合を担当します。
        - **`debug/`**: 開発中にUIコンポーネントなどを個別に確認するためのデバッグページを格納します。
    - **原則**: `games`層と`core`層に依存します。
- **`src/games/` (ゲーム実装層)**
    - **役割**: 個別のゲーム実装を格納します。各ゲームは自身の名前を持つサブディレクトリ（例: `[game-slug]/`）で管理されます。
    - **原則**: `core`層にのみ依存し、`app`層には依存しません。
- **`src/core/` (汎用基盤層)**
    - **役割**: プロジェクト全体で再利用可能な、特定のゲームロジックに依存しない基幹部品を格納します。
        - **`components/ui/`**: ボタンやモーダルなど、特定のアプリケーションコンテキストに依存しない、ごく基本的なUI部品を格納します。
        - **`debug/`**: UIに依存しない、純粋なデータやロジックをデバッグするためのユーティリティ関数などを格納します。
        - **`hooks/`**: 複数のゲームやアプリケーション全体で共有されるカスタムフックを格納します。
        - **`styles/`**: アプリケーション全体で利用されるスタイル定義やテーマなどを格納します。
        - **`types/`**: プロジェクト全体で共有されるTypeScriptの型定義を格納します。
    - **原則**: 他のどのレイヤーにも依存しない、完全に自己完結したモジュールです。

## 3. ゲーム実装の規約

### 3.1. 新規ゲームの追加方法
1.  `src/games/` にゲーム実装用のディレクトリを作成します。（例: `src/games/new-game`）
2.  `public/games/` に公開アセット用のディレクトリを作成します。（例: `public/games/new-game`）
3.  `public/games/[slug]/manifest.json` を作成し、ゲームのメタデータを定義します。

#### manifest.json の仕様
-   `name` (string): ゲームの正式名称（内部的な識別子、英語表記を推奨）。
-   `displayName` (string): UIに表示するゲーム名。子供でも読みやすいように、ひらがな・カタカナを基本とします。
-   `shortDescription` (string): ゲームの簡潔な説明文。
-   `path` (string): ゲームページへのパス。
-   `rulesFile`, `specActionFile`, `specDisplayFile`, `specHintFile`: 各仕様書への絶対パス。

### 3.2. 実装原則
-   **ロジックとビューの分離:**
    -   **`core.ts`**: UIに依存しない純粋なゲームロジック。ReactやDOMに依存しません。
    -   **`index.tsx`**: ゲーム状態を描画するビューコンポーネント。ロジックを持ちません。
-   **スタイリング:**
    -   CSS-in-JSアプローチを採用し、スタイル定義は `styles.ts` に分離します。
    -   スタイルオブジェクトは `StyleSheet.create` を用いて作成し、インラインスタイルは禁止します。
-   **UIテキストガイドライン:**
    -   幼児をメインターゲットとし、ひらがな・カタカナ主体の分かりやすい表現を用います。
    -   ヒント機能は「おしえて！」という呼称で統一します。

## 4. GameControllerアーキテクチャ

レスポンシブデザイン対応のため、統一されたGameControllerアーキテクチャを導入しています。すべてのゲームは、共通のインターフェースに準拠したカスタムフック（`use[GameName]`）を実装する必要があります。

### 4.1. 基本インターフェース (`BaseGameController`)
```typescript
export interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
  getDisplayStatus: () => string;
  getScoreInfo?: () => ScoreInfo | null;
}
```
ゲームの機能に応じて `HintableGameController` や `HistoryGameController` といった拡張インターフェースも利用します。

### 4.2. ポリモーフィック設計 (`getScoreInfo`)
`getScoreInfo` メソッドは、各ゲームが独自のスコア情報を `GameLayout` コンポーネントに提供するための仕組みです。これにより、`GameLayout` はゲーム固有のスコア構造を知ることなく、統一された方法でスコアを表示できます。

## 5. 共通コンポーネント
- **配置場所:** `src/core/components/`
- **`GameLayout.tsx`**: 全ゲーム共通のレイアウト。
- **`MarkdownViewer.tsx`**: MarkdownをHTMLとして表示。
- **依存方向の原則:** 共通コンポーネントは、個別のゲーム実装 (`games/`) に依存してはなりません。

## 6. レスポンシブアーキテクチャ
PC (幅768px以上) とモバイル (幅768px未満) で最適なUIを提供するため、`useResponsive` フックと `GameLayout` コンポーネントによる統一されたレスポンシブアーキテクチャを採用しています。詳細は `technical-guide-responsive-architecture.md` を参照してください。

## 7. 型定義
プロジェクト全体で利用する型定義は `types/` ディレクトリに配置します。特にゲーム関連の型は `types/game.ts` で定義されています。
