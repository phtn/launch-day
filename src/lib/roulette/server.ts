import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createInitialRouletteState, normalizeRouletteState, type RouletteGameState } from './game'

const ROULETTE_COOKIE_NAME = 'launch-day---roulette'
const DEFAULT_ROULETTE_SECRET = 'launch-day-roulette-dev-secret'

const rouletteCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

export async function getRouletteServerState(): Promise<RouletteGameState> {
  const cookieStore = await cookies()
  return deserializeRouletteState(cookieStore.get(ROULETTE_COOKIE_NAME)?.value)
}

export function applyRouletteStateCookie<T>(
  response: NextResponse<T>,
  state: RouletteGameState
): NextResponse<T> {
  response.cookies.set(ROULETTE_COOKIE_NAME, serializeRouletteState(state), rouletteCookieOptions)
  return response
}

export function clearRouletteStateCookie<T>(response: NextResponse<T>): NextResponse<T> {
  response.cookies.delete(ROULETTE_COOKIE_NAME)
  return response
}

function serializeRouletteState(state: RouletteGameState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
  const signature = sign(payload)
  return `${payload}.${signature}`
}

function deserializeRouletteState(cookieValue?: string): RouletteGameState {
  if (!cookieValue) {
    return createInitialRouletteState()
  }

  const [payload, signature] = cookieValue.split('.')

  if (!payload || !signature || !isValidSignature(payload, signature)) {
    return createInitialRouletteState()
  }

  try {
    const parsedState = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return normalizeRouletteState(parsedState)
  } catch {
    return createInitialRouletteState()
  }
}

function sign(payload: string): string {
  return createHmac('sha256', getRouletteSecret()).update(payload).digest('base64url')
}

function isValidSignature(payload: string, signature: string): boolean {
  const expectedSignature = sign(payload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const receivedBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}

function getRouletteSecret(): string {
  return process.env.ROULETTE_SESSION_SECRET ?? DEFAULT_ROULETTE_SECRET
}
