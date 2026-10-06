import type { NextConfig } from "next";

// `output: "export"` makes next dev throw on unknown `/[slug]` paths instead of
// rendering not-found. Keep export for production builds only; Capacitor and
// the VPS still get a full static `out/` from `next build`.
const config: NextConfig = {
  ...(process.env.NODE_ENV === "production" ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@upi-down/shared"],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;
