## 2025-08-09 (Issue #44)

-   **タスク:** PlaywrightによるE2Eテストの初期導入
-   **作業概要:**
    -   Playwrightをプロジェクトに導入し、リバーシを対象としたE2Eテストを初めて実装。
    -   `vitest.config.ts` に `exclude: ['tests/**']` を追加し、VitestがPlaywrightのテストファイルを誤って実行する問題を解決。
    -   CI環境でのみ `basePath` を無効にする設定を `next.config.ts` に追加し、テストサーバーでの404エラーを回避。
    -   CI/CDパイプラインにE2Eテストの実行ステップを組み込み。