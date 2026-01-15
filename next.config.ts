/** @type {import('next').NextConfig} */
const nextConfig = {
  // ここが重要！ビルド時に 'fs' モジュールが見つからなくてもエラーにしない設定
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;