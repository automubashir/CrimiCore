/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.mp4': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
