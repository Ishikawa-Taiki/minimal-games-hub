**日付:** 2025年8月9日 (Jules対応分)

## 目的
Playwrightを導入し、プロジェクトにE2Eテストの基盤を構築する。

## 議論と意思決定の過程

### 1. VitestとPlaywrightのランナー競合
- **課題:** `npm test` を実行した際、VitestがPlaywrightのテストファイル (`tests/**`) を読み込もうとしてエラーが発生した。
- **解決策:** `vitest.config.ts` に `exclude: ['tests/**']` を追加し、Vitestのテスト対象からPlaywrightのディレクトリを明示的に除外することで、競合を回避した。

### 2. CI環境におけるbasePathの問題
- **課題:** テストサーバーはサイトをルート (`/`) として配信するが、Next.jsのビルド成果物は `basePath` (`/minimal-games-hub`) を前提としているため、CI上でページが見つからず404エラーが発生した。
- **解決策:** `next.config.ts` を修正し、環境変数 `CI` が `true` の場合は `basePath` と `assetPrefix` を無効にする設定を追加。これにより、CI環境でのビルド成果物がテストサーバーの挙動と一致するようになり、問題を解決した。