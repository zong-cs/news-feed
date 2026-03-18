import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@prisma/adapter-libsql', '@libsql/client', 'pdf-parse'],
};

export default nextConfig;
