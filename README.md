# Minimal Games Hub

[![ja](https://img.shields.io/badge/lang-ja-blue.svg)](./GEMINI/SETUP_LOG.md)

これは、人間とAIの対話を通じて開発される、ミニマルなWebゲームのプラットフォームです。

**[ゲームをプレイする！](https://ishikawa-taiki.github.io/minimal-games-hub/)**

---

## ✨ このプロジェクトについて: AI駆動開発モデル

このリポジトリのコードは、[GoogleのGemini](https://gemini.google.com/)との対話を通じて生成・変更されています。

-   **開発スタイル:** 人間が「監督」「レビュアー」として方針を示し、AIが「実装者」としてコーディング、テスト、ドキュメント作成を行います。
-   **目的:** AI駆動開発の実践的なワークフローを模索し、その過程と成果を公開すること。
-   **ルールブック:** 私たち（人間とAI）が従うルールやプロジェクトの憲法は、すべて[`GEMINI/`](./GEMINI/)ディレクトリに記録されています。興味のある方はご覧ください。

## 🎮 開発者向け情報 (For Developers)

### 環境構築

1.  **リポジトリをクローン:**
    ```bash
    git clone https://github.com/Ishikawa-Taiki/minimal-games-hub.git
    cd minimal-games-hub
    ```

2.  **Node.jsのセットアップ:**
    本プロジェクトは`nodenv`によるバージョン管理を行っています。
    ```bash
    nodenv install
    ```

3.  **依存関係のインストール:**
    ```bash
    npm install
    ```

4.  **開発サーバーの起動:**
    ```bash
    npm run dev
    ```
    [http://localhost:3000](http://localhost:3000) で開発中のアプリケーションを確認できます。

より詳細な技術情報や規約については、[`docs/ai-workflow/2-technical-guide.md`](./docs/ai-workflow/2-technical-guide.md)を参照してください。

## ⚖️ 注意事項（権利について）

本プロジェクトは、制作者の家族向けの私的利用を主な目的として構築された静的ゲーム集サイトです。営利目的ではなく、第三者の著作権や商標権を侵害する意図は一切ありません。

使用されているゲームの名称、ルール、素材は、すべて独自の創作名称または一般名称によって構成されています。内容はGitHub Pagesで公開されていますが、特定の家庭向けの個人的なプロジェクトであることをご理解ください。