---
title: manifest.json の配置場所と読み込み戦略の変更
date: 2025-08-23
tags: [Next.js, FileSystem, E2Eテスト, Architecture]
---

## 意思決定の背景

新しいゲーム「アニマルチェス」のE2Eテスト（Playwright使用）において、コンポーネントが正しくレンダリングされずタイムアウトする問題が発生した。詳細な調査の結果、Next.jsの開発サーバー（`npm run dev`）がPlaywrightの`webServer`として起動される環境下で、`app/games/[slug]/page.tsx` および `app/page.tsx` 内で `fs.readFileSync` や `fs.readdir` を用いて `manifest.json` ファイルを読み込む際に、`SyntaxError: Unexpected end of JSON input` や `ENOENT: no such file or directory` といったエラーが断続的に発生することが判明した。

この問題は、手動で `npm run dev` を実行した際には発生せず、ユニットテストもパスしていたため、Playwrightのテスト環境におけるNext.jsのファイルシステムアクセスに関する特定のレースコンディションや環境依存の問題であると推測された。

## 検討された選択肢

1.  **`fs.readFileSync` の問題回避のためのワークアラウンド:**
    -   `fs.readFileSync` の呼び出しに `try-catch` を強化する。
    -   ファイル読み込み前に短い遅延（`sleep`）を挟む。
    -   Next.jsのキャッシュを頻繁にクリアする。
    -   **評価:** これらは根本的な解決策ではなく、問題の再発やデバッグの困難さを伴う一時的な回避策であると判断された。特に、Playwrightのテスト実行時に毎回キャッシュをクリアすることは非効率的である。

2.  **`manifest.json` を `public` ディレクトリに移動し、`fetch` API で読み込む:**
    -   `manifest.json` ファイルを `games/<slug>/` ディレクトリから `public/games/<slug>/` ディレクトリに移動する。
    -   `app/games/[slug]/page.tsx` の `getGameData` 関数および `app/page.tsx` の `getGames` 関数内で、`fs` モジュールによるファイル読み込みの代わりに、`fetch` API を使用して `manifest` を読み込むように変更する。
    -   **評価:** `public` ディレクトリに配置されたファイルは、Next.jsによって静的アセットとして扱われ、HTTP経由でアクセス可能となる。これにより、Node.jsの `fs` モジュールに起因するファイルシステムアクセスに関する潜在的な問題を回避できる。`fetch` API はWeb標準であり、クライアントサイド・サーバーサイドの両方で利用可能であるため、より柔軟なデータ取得戦略となる。

## 意思決定

`manifest.json` を `public` ディレクトリに移動し、`fetch` API で読み込む方法を採用する。

## 決定の理由

この決定は、以下の理由に基づいている。

-   **根本的な問題解決:** `fs.readFileSync` に起因する環境依存のレースコンディションやファイルシステムアクセスに関する問題を根本的に回避できる。これにより、E2Eテストの安定化が期待される。
-   **Next.jsのベストプラクティスへの準拠:** `public` ディレクトリは静的アセットを配置するためのNext.jsの標準的な方法であり、`fetch` API はWeb標準のデータ取得方法である。この変更は、よりモダンで堅牢なNext.jsアプリケーションのデータ取得戦略への移行を意味する。
-   **将来的なスケーラビリティとデプロイの容易性:** `public` ディレクトリのファイルはCDNなどを通じて高速に配信でき、サーバーの負荷を軽減する。また、サーバーレス環境など、ファイルシステムへの直接アクセスが制限される環境へのデプロイが容易になる。
-   **コードの一貫性と再利用性:** `fetch` API を使用することで、クライアントサイドとサーバーサイドで同様のデータ取得ロジックを記述できるようになり、コードの一貫性が向上する。

## 影響

-   `app/games/[slug]/page.tsx` の `getGameData` 関数が `fetch` API を使用するように変更される。
-   `app/page.tsx` の `getGames` 関数が `fetch` API を使用するように変更される。
-   すべてのゲームの `manifest.json` ファイルが `games/<slug>/` ディレクトリから `public/games/<slug>/` ディレクトリに移動される。
-   この変更は既存のゲームにも影響を与えるが、より良いアーキテクチャへの移行に伴うものであり、妥当な変更であると判断された。

## 補足

この問題の解決には多くの試行錯誤を要した。特に、Playwrightのテスト環境におけるNext.jsの挙動の複雑さが、問題特定を困難にした。今回の変更は、単なるバグ修正に留まらず、プロジェクト全体のデータ取得戦略を改善する重要な一歩となる。
