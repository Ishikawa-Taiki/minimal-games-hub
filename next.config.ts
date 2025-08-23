/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: isProd ? 'export' : undefined,
  distDir: isProd ? 'out' : '.next',
  assetPrefix: process.env.GITHUB_ACTIONS && '/minimal-games-hub',
  basePath: process.env.GITHUB_ACTIONS && '/minimal-games-hub',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
