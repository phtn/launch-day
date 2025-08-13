import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  // webpack: (conf) => {
  //   conf.externals.push("pino-pretty", "lokijs", "encoding");
  //   return conf;
  // },
};
export default config;
