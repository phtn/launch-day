import type { NextConfig } from 'next'

const config: NextConfig = {
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        worker_threads: false,
      }
    }
    // Ignore pino and thread-stream issues from WalletConnect
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
    }
    return config
  },
}
export default config
