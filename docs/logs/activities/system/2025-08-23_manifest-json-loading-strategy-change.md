---
title: manifest.json 読み込み戦略の変更
date: 2025-08-23
tags: [Next.js, FileSystem, E2Eテスト, Architecture]
---

## 概要

新しいゲーム「アニマルチェス」のE2Eテストにおける問題解決のため、プロジェクト全体の `manifest.json` ファイルの配置場所と読み込み戦略を変更しました。具体的には、`manifest.json` ファイルを `games/<slug>/` ディレクトリから `public/games/<slug>/` ディレクトリに移動し、読み込み方法を Node.js の `fs` モジュールによるファイルシステムアクセスから、Web標準の `fetch` API に変更しました。

## 変更点

-   **`manifest.json` ファイルの移動:**
    -   すべてのゲームの `manifest.json` ファイルが、以下のパスに移動されました。
        -   旧: `games/<slug>/manifest.json`
        -   新: `public/games/<slug>/manifest.json`

-   **`manifest.json` 読み込みロジックの変更:**
    -   `app/games/[slug]/page.tsx` の `getGameData` 関数が、`fs.readFileSync` の代わりに `fetch` API を使用して `manifest.json` を読み込むように変更されました。
    -   `app/page.tsx` の `getGames` 関数が、`fs.readdir` および `fs.readFile` の代わりに `fetch` API を使用して `manifest.json` を読み込むように変更されました。

## 変更の理由

この変更は、主に以下の問題に対処し、システムを改善するために行われました。

-   **E2Eテストの不安定性:** `animal-chess` のE2Eテストにおいて、Next.jsの開発サーバーがPlaywrightの`webServer`として起動される環境下で、`fs` モジュールによる `manifest.json` の読み込みが原因で、`SyntaxError: Unexpected end of JSON input` や `ENOENT` エラーが発生し、テストがタイムアウトする問題が頻発していました。これは、ファイルシステムアクセスに関する環境依存のレースコンディションが原因であると推測されました。
-   **Next.jsのベストプラクティスへの準拠:** `public` ディレクトリは静的アセットを配置するための標準的な方法であり、`fetch` API はWeb標準のデータ取得方法です。この変更により、よりモダンで堅牢なデータ取得戦略に移行しました。
-   **将来的なスケーラビリティとデプロイの容易性:** `public` ディレクトリのファイルはCDNなどを通じて高速に配信でき、サーバーレス環境など、ファイルシステムへの直接アクセスが制限される環境へのデプロイが容易になります。

## 影響範囲

-   すべてのゲームの `manifest.json` ファイルのパスが変更されました。
-   ホームページ (`/`) および各ゲームページ (`/games/[slug]`) でのゲーム情報の取得方法が変更されました。
-   この変更は、既存のゲームの動作には影響を与えないことを確認済みです。

## 補足

この問題の解決には多くの試行錯誤を要しました。今回の変更は、単なるバグ修正に留まらず、プロジェクト全体のデータ取得戦略を改善する重要な一歩となります。
