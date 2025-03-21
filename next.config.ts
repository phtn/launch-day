import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    reactCompiler: true,
    turbo: {},
  },
  webpack: (conf) => {
    conf.externals.push("pino-pretty", "lokijs", "encoding");
    return conf;
  },
};
export default config;
