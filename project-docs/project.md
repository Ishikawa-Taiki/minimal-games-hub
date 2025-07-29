# プロジェクト名: Minimal Education Games Hub (MEGH)

## 🧭 概要
個人的な学習と家族向けの遊びを目的とした静的Webゲーム集です。GitHub Pages上にホストされ、React + TypeScript (Next.js) により構築されます。各ゲームは個別URLで動作・検証可能で、商標や権利に配慮した構成を徹底します。

## 🛠 技術構成
- Next.js + TypeScript
- Tailwind CSS（柔らかいUI）
- Redux Toolkit（必要に応じて）
- next.config.js に `output: 'export'` を指定し静的出力
- GitHub Pages に `main` ブランチの静的HTMLをホスト
- GitHub Actions による自動デプロイ（push → ホスト反映）
- Node.js v18.18.0 以上（`.nvmrc`で指定）
- スマホ／PCレスポンシブ設計
- 各ゲームは `/games/{slug}/` に配置し、直接アクセス可能で完全動作

## 📁 ディレクトリ構成（初期）

MEGH/ 
├ public/ 
│ └ favicon.ico 
├ app/ 
├ page.tsx ← ゲーム一覧ページ（空でOK） 
│ └ games/ 
│ └ [slug]/page.tsx ← 個別ゲームページ（単体動作可能） 
├ games/ 
├ └ sample-game/ 
├ rules.md ← 商標なし仕様記述 
│ └ manifest.json ← メタ情報（任意） 
├ types/ 
│ └ game.ts ← Props型やState型定義 
├ styles/ 
│ └ globals.css ← UIスタイル設定 
├ .github/ 
│ └ workflows/ 
│ └ deploy.yml ← GitHub Pages自動デプロイ設定 
├ next.config.js ← 静的出力設定（output: 'export'） 
├ tsconfig.json ← TypeScript設定 
├ package.json ← 必要パッケージ（Next.js, Tailwindなど） 
├ .eslintrc.json ← Lint設定 
├ .nojekyll ← Jekyll回避（必要なら） 
├ README.md ← 構想・制約・但し書き含む説明


## ⚖️ 商標・権利・目的について

このプロジェクトは非営利かつ私的利用（自分の息子向け）を目的としたものであり、**第三者の著作権・商標権を侵害する意図は一切ありません。**

- 市販ゲーム名や商標の使用は厳禁
- 使用する名称・ルール・素材はすべて一般名称または創作名称
- パブリックなホスティングで誤解が生じないよう、但し書きを明記

## 📜 README.md に含める但し書き（自動生成に含めてください）

```markdown
## 注意事項

本プロジェクトは私的・家族向け利用を目的として構築された静的ゲーム集サイトです。営利目的ではなく、第三者の著作権や商標権を侵害する意図は一切ありません。市販商品名やブランド、企業名などの使用は避け、すべて独自の創作名称や一般名称によって構成されています。

内容はGitHub Pagesでパブリックにホストされますが、教育目的ではなく特定家庭向けの構成であることをご理解ください。
