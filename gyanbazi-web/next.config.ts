import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/gyanbazi/backend/api/:path*',
        destination: 'http://localhost/gyanbazi/backend/api/:path*' // Proxy to XAMPP PHP backend
      }
    ];
  }
};

export default nextConfig;
