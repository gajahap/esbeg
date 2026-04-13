import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // AKTIFKAN INI
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.2.35',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.2.35',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;