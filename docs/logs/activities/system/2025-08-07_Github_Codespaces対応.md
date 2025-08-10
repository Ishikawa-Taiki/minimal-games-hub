## 2025-08-07

-   **タスク:** Github Codespaces対応
-   **作業概要:**
    -   Github Codespaces上での開発を可能にするため、`.devcontainer/devcontainer.json` を追加し、環境構築を自動化。
    -   開発サーバーが外部（スマートフォン等）からアクセスできるよう、`package.json` の `dev` スクリプトを `next dev -H 0.0.0.0` に更新。
    -   `setup.sh` を `npm install` のみを実行するシンプルな内容に更新。
    -   `@google/gemini-cli` をプロジェクトの `devDependencies` に追加し、`npm run gemini` で実行できるように `package.json` の `scripts` を更新。
    -   Codespaces起動時の `git-lfs` と `husky` のフックの競合を避けるため、`.devcontainer.json` で使用するDockerイメージを調整。