import type { NextConfig } from 'next';

const isElectron = process.env.ELECTRON === 'true';

const nextConfig: NextConfig = {
  // Only use static export for Electron builds
  ...(isElectron && {
    output: 'export',
    trailingSlash: false,
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
