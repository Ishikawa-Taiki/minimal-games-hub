import type { NextConfig } from "next";

// 'npm run build'時は'production'、'npm run dev'時は'development'になる
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // 本番ビルド時（GitHub Pagesデプロイ時）のみ、リポジトリ名をパスに含める
  // CI環境ではテストのためにbasePathを無効化する
  basePath: isProd ? '/minimal-games-hub' : undefined,
  assetPrefix: isProd ? '/minimal-games-hub/' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: { // 追加
    basePath: isProd ? '/minimal-games-hub' : '', // 追加: isProdに応じて設定
  },
  /* config options here */
};

export default nextConfig;
