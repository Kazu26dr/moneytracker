/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // 静的エクスポート時の最適化問題を回避
    if (!isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
