/** @type {import('next').NextConfig} */

// output:'export' is production-only.
// In dev (NODE_ENV==='development') Next.js runs as a normal SSR server so
// you can navigate to any dynamic route without listing every param in
// generateStaticParams.  The static-export constraints only apply at build time.
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  ...(isProd ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.mp4': { type: 'asset' },
    },
  },
};

export default nextConfig;
