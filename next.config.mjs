/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: {
    rules: {
      '*.mp4': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
