/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'onnxruntime-node': false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node']
  }
};

module.exports = nextConfig;