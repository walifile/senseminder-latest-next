import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      dcv: path.resolve(__dirname, "public/dcvjs/dcv.js"), // Alias for dcv.js
    };
    return config;
  },
};

export default nextConfig;
