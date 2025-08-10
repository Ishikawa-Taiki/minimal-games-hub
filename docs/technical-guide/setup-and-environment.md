# セットアップと環境 (SETUP AND ENVIRONMENT)

本ドキュメントは、プロジェクトのセットアップと開発環境に関する技術情報を定義します。

## 1. 環境構築

### 1.1. Node.jsバージョン管理
本プロジェクトでは、Node.jsのバージョン管理に`nodenv`を使用しています。`.node-version`ファイルに指定されたバージョンを使用してください。

```bash
# プロジェクトで使用するNode.jsバージョンをインストール
nodenv install

# プロジェクトディレクトリでバージョンを有効化
nodenv local
```

### 1.2. 依存関係のインストール
プロジェクトのルートディレクトリで、以下のコマンドを実行して依存関係をインストールします。

```bash
npm install
```

## 2. 開発サイクル

### 2.1. 開発サーバーの起動
以下のコマンドを実行すると、`http://localhost:3000` で開発サーバーが起動します。

```bash
npm run dev
```

### 2.2. ビルド
本プロジェクトは静的サイトとしてエクスポートされます。
以下のコマンドでビルドを実行できます。

```bash
npm run build
```

## 3. 技術スタック
-   **フレームワーク:** Next.js
-   **言語:** TypeScript
-   **スタイリング:** Tailwind CSS (`globals.css` と PostCSS経由)
-   **Node.jsバージョン管理:** `nodenv` (`.node-version` ファイルを参照)
-   **リンティング & フォーマット:** `eslint.config.mjs` に定義されたルールに準拠します。

## 4. サポート対象環境

本プロジェクトは、以下の環境での動作をサポート対象とします。
特に、**開発および主要な動作確認はGoogle Chromeの最新バージョンで行われます。**

### 4.1. ブラウザ

*   **デスクトップブラウザ:**
    *   Google Chrome: 最新2バージョン
    *   Mozilla Firefox: 最新2バージョン
    *   Microsoft Edge: 最新2バージョン
    *   Apple Safari: 最新2バージョン
*   **モバイルブラウザ:**
    *   iOS 12以降に搭載されるSafari
    *   Android 9以降に搭載されるChrome

### 4.2. オペレーティングシステム (参考)

上記ブラウザが動作する以下のOSバージョンを想定しています。

*   **iOS:** 12.0 以降
*   **Android:** 9.0 以降
*   **Windows:** Windows 10 以降
*   **macOS:** macOS Mojave (10.14) 以降
