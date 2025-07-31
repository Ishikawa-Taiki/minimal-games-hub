import type { NextConfig } from "next";

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'minimal-games-hub';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  /* config options here */
};

export default nextConfig;
