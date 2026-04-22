import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images-1.medium.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/contact-centres",
        permanent: true,
      },
      {
        source: "/doctors",
        destination: "/our-doctors",
        permanent: true,
      },
      {
        source: "/at-home-testing",
        destination: "/at-home-fertility-testing",
        permanent: true,
      },
      {
        source: "/bengaluru-aecs-layout",
        destination: "/ivf-clinic-bangalore-aecs-layout",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
