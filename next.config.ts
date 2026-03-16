import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@prisma/adapter-libsql', '@libsql/client'],
};

export default nextConfig;
