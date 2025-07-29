# 開発ガイド

このプロジェクトの開発手順について説明します。

## 1. 環境構築

### Node.jsのバージョン管理

本プロジェクトでは、Node.jsのバージョン管理に`nodenv`を使用しています。`.node-version`ファイルに指定されたバージョンを使用してください。

```bash
nodenv install
nodenv local
```

### 依存関係のインストール

プロジェクトのルートディレクトリで、以下のコマンドを実行して依存関係をインストールします。

```bash
npm install
```

## 2. 開発サーバーの起動

以下のコマンドを実行すると、開発サーバーが起動し、ブラウザでアプリケーションを確認できます。

```bash
npm run dev
```

## 3. ビルド

本プロジェクトは静的サイトとしてエクスポートされます。以下のコマンドでビルドを実行できます。

```bash
npm run build
```

## 4. GitHub Pagesへのデプロイ

`main`ブランチにプッシュされると、GitHub Actionsによって自動的にビルドされ、GitHub Pagesにデプロイされます。

デプロイが失敗した場合は、GitHubリポジトリの「Actions」タブでログを確認してください。

### GitHub Pagesの設定

GitHub Pagesが正しくデプロイされるためには、リポジトリの設定でGitHub Pagesのソースを「GitHub Actions」に設定する必要があります。

1.  GitHubリポジトリの「Settings」タブをクリックします。
2.  左側のサイドバーで「Pages」をクリックします。
3.  「Build and deployment」セクションで、Sourceを「GitHub Actions」に設定します。

## 5. コミットメッセージの規約

コミットメッセージは、Conventional Commitsの規約に従ってください。

例:

*   `feat: 新機能の追加`
*   `fix: バグ修正`
*   `docs: ドキュメントの更新`
*   `refactor: コードのリファクタリング`
*   `style: コードスタイルの修正`
*   `test: テストの追加・修正`
*   `chore: ビルドプロセスや補助ツールの変更`
