import type { NextConfig } from 'next'

const config: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream']
}
export default config
