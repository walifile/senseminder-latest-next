import type { NextConfig } from "next";
const path = require("path");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      dcv: path.resolve(__dirname, "public/dcvjs/dcv.js"), // Alias for dcv.js
    };
    return config;
  },
};

export default nextConfig;
