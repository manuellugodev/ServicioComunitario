import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Solo en la imagen de Docker: "next start" no admite esta salida.
  output: process.env.SALIDA_STANDALONE === "1" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
