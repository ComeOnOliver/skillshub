import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skillshub/db", "@skillshub/shared"],
  serverExternalPackages: ["pg"],
};

export default nextConfig;
