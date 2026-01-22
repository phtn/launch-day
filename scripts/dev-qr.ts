import { spawn } from 'child_process'
import os from 'os'
import { join } from 'path'
import QRCode from 'qrcode'

function getServerIp(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    if (name && interfaces[name]) {
      for (const i of interfaces[name]) {
        if (i.family === 'IPv4' && !i.internal) {
          return i.address
        }
      }
    }
  }
  return '127.0.0.1'
}

function getPortFromArgs(args: string[]): string {
  const portIndex = args.indexOf('-p')
  if (portIndex !== -1 && args[portIndex + 1]) {
    return args[portIndex + 1]
  }
  const portMatch = args.find((arg) => arg.startsWith('--port='))
  if (portMatch) {
    return portMatch.split('=')[1] || '3000'
  }
  return '3000'
}

function getHostFromArgs(args: string[]): string {
  const hostIndex = args.indexOf('-H')
  if (hostIndex !== -1 && args[hostIndex + 1]) {
    return args[hostIndex + 1]
  }
  return getServerIp()
}

async function logQRCode(url: string) {
  try {
    console.log('\n')
    console.log('Network QR Code:')
    console.log('─'.repeat(32))
    const qrString = await QRCode.toString(url, { type: 'utf8' })
    console.log(qrString)
    console.log('─'.repeat(32))
    console.log(`${url}`)
    console.log('\n')
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)

  // Determine host and port from args or defaults
  let host: string

  // Check if -H flag is present (like dev:worker script)
  const hostIndex = args.indexOf('-H')
  if (hostIndex !== -1) {
    // If -H is set, use that host (likely 127.0.0.1 for dev:worker)
    host = getHostFromArgs(args)
  } else {
    // Otherwise use network IP for QR code
    host = getServerIp()
  }

  const port = getPortFromArgs(args)

  // Check if HTTPS is enabled
  const isHttps = args.includes('--experimental-https')
  const protocol = isHttps ? 'https' : 'http'
  const url = `${protocol}://${host}:${port}`

  // Start Next.js dev server
  // Find next binary in node_modules
  const nextBinary = join(process.cwd(), 'node_modules', '.bin', 'next')

  const nextDev = spawn(nextBinary, ['dev', ...args], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
    env: { ...process.env }
  })

  let serverReady = false

  // Monitor stdout for "Ready" message
  nextDev.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(data)
    const output = data.toString()

    // Next.js outputs "Ready" when server is ready
    if (!serverReady && (output.includes('Ready') || output.includes('Local:'))) {
      serverReady = true

      // Small delay to ensure server is fully ready
      setTimeout(async () => {
        await logQRCode(url)
      }, 1000)
    }
  })

  // Pipe stderr to stdout
  nextDev.stderr?.on('data', (data: Buffer) => {
    process.stderr.write(data)
  })

  nextDev.on('close', (code) => {
    process.exit(code ?? 0)
  })

  // Handle process termination
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM')
  })
}

main().catch(console.error)
