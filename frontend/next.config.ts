import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL 
      ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api`)
      : 'https://playcasthubai.onrender.com/api';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
