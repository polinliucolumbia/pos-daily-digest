import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phones on the local network to load dev assets (dev-only setting)
  allowedDevOrigins: ['192.168.0.4'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;
