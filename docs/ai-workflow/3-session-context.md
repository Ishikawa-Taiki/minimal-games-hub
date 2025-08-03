# セッションコンテキスト (更新済み)

## 現在のタスク
- **ブランチ:** `feature/refactor-tictactoe` (プッシュ済み、PR提案済み)
- **ゴール:** 各ゲームのViewとコアロジックの分離、仕様書の分割と命名規則の整備
- **ステータス:** 完了

## 直近のタスク履歴 (サマリー)
- ◯×ゲームのViewとコアロジックを分離 (`games/tictactoe/core.ts`, `games/tictactoe/index.tsx`)。
- リバーシのViewとコアロジックを分離 (`games/reversi/core.ts`, `games/reversi/index.tsx`)。
- ゲームのシステム仕様書を「システム動作仕様 (`spec-action.md`)」と「システム表示仕様 (`spec-display.md`)」にファイル分割。
- `manifest.json` および `types/game.ts` を更新し、新しい仕様書ファイル名と命名規則 (`displayName`, `shortDescription`) に対応。
- 技術ガイド (`docs/ai-workflow/2-technical-guide.md`) を更新し、ゲーム実装の原則、仕様書の標準フォーマット、命名規則を定義。
- ゲーム画面から仕様書へのリンク機能の試行と、404エラー解消のためのルーティング修正。
- `rules` ページにルール、動作仕様、表示仕様を統合表示するよう修正。
- ゲーム名の表記ゆれを統一し、トップページとrulesページの表示を改善。

## 未解決の課題
(なし)

## 重要なドキュメントへのポインタ
- **人間向けガイド:** `docs/project-info/human-guide.md`
- **セットアップログ:** `docs/project-info/setup-log.md`
- **憲法:** `docs/ai-workflow/1-project-manifest.md`
- **技術ガイド:** `docs/ai-workflow/2-technical-guide.md`
- **システムログ:** `docs/ai-workflow/logs/system.log`