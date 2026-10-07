import type { NextConfig } from "next";

const config: NextConfig = {
  // The marketing site is static HTML in /public; serve it at the root.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }] };
  },
};

export default config;
