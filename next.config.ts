import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
