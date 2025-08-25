# npm run start コマンドの無効化

-   **日付:** 2025年8月24日
-   **ステータス:** 決定
-   **背景:**
    -   当プロジェクトは `next.config.ts` にて `output: 'export'` が設定されており、静的サイトとしてビルドされる。
    -   `npm run build` を実行すると、成果物は `out` ディレクトリに生成される。
    -   本番環境の動作確認は、`out` ディレクトリを静的ファイルサーバーでホスティングすることで行う (例: `npx serve@latest out`)。
    -   `package.json` に定義されていた `start` スクリプト (`next start`) は、Next.jsのNode.jsサーバーを起動するためのものであり、静的エクスポートされたサイトでは機能しない。
    -   このコマンドが存在することにより、開発者が誤って使用し、エラー `[Error: "next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.]` に遭遇する可能性があった。
-   **決定事項:**
    -   誤用による混乱を避けるため、`package.json` から `start` スクリプトを削除する。
    -   これにより、プロジェクトの運用方法がより明確になり、開発者が正しいコマンド (`npx serve@latest out`) を使用するよう促される。
