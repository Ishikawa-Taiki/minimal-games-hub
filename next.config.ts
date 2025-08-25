import type { NextConfig } from "next";

// 'npm run build'時は'production'、'npm run dev'時は'development'になる
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // 本番ビルド時（GitHub Pagesデプロイ時）のみ、リポジトリ名をパスに含める
  // CI環境ではテストのためにbasePathを無効化する
  basePath: isProd ? '/minimal-games-hub' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: {
    basePath: isProd ? '/minimal-games-hub' : '',
  },
  /* config options here */
};

export default nextConfig;
