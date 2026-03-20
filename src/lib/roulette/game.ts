export type RouletteBets = Record<number, number>
export type RouletteNumberTone = 'zero' | 'red' | 'black'
export type RouletteOutcomeKind = 'win' | 'loss'

export interface RouletteDisplayResult {
  kind: RouletteOutcomeKind
  message: string
  amount: number
}

export interface RouletteSpinResult extends RouletteDisplayResult {
  finalNumber: number
  creditsAwarded: number
  timestamp: number
}

export interface RouletteGameState {
  balance: number
  history: number[]
  lastBets: RouletteBets
  resultsHistory: RouletteSpinResult[]
}

export interface RouletteSpinResolution {
  round: RouletteSpinResult
  state: RouletteGameState
}

export type RouletteApiAction =
  | {
      action: 'spin'
      bets: RouletteBets
    }
  | {
      action: 'replenish'
      amount?: number
    }
  | {
      action: 'reset'
    }

export type RouletteApiResponse =
  | {
      success: true
      state: RouletteGameState
      round?: RouletteSpinResult
    }
  | {
      success: false
      error: string
      state?: RouletteGameState
    }

export const DEFAULT_ROULETTE_CREDITS = 4110
export const DEFAULT_CHIP_VALUE = 5
export const DEFAULT_REPLENISH_AMOUNT = 420
export const TOTAL_ROULETTE_NUMBERS = 37
export const SPIN_INTERVAL_MS = 100
export const SPIN_FRAME_COUNT = 20
export const SPIN_ANIMATION_DURATION_MS = SPIN_INTERVAL_MS * SPIN_FRAME_COUNT
export const AUTO_PLAY_DELAY_MS = 30_000
export const MAX_HISTORY_ITEMS = 20

export const ROULETTE_GRID = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
] as const

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

export function createInitialRouletteState(balance = DEFAULT_ROULETTE_CREDITS): RouletteGameState {
  return {
    balance,
    history: [],
    lastBets: {},
    resultsHistory: []
  }
}

export function cloneBets(bets: RouletteBets): RouletteBets {
  return { ...bets }
}

export function hasBets(bets: RouletteBets): boolean {
  return Object.keys(bets).length > 0
}

export function sumBets(bets: RouletteBets): number {
  return Object.values(bets).reduce((sum, bet) => sum + bet, 0)
}

export function canAffordBets(balance: number, bets: RouletteBets): boolean {
  return sumBets(bets) <= balance
}

export function addBet(bets: RouletteBets, number: number, amount: number): RouletteBets {
  return {
    ...bets,
    [number]: (bets[number] ?? 0) + amount
  }
}

export function removeBetAmount(bets: RouletteBets, number: number, amount: number): RouletteBets {
  const currentAmount = bets[number] ?? 0

  if (currentAmount < amount) {
    return bets
  }

  const nextBets = { ...bets }
  const updatedAmount = currentAmount - amount

  if (updatedAmount === 0) {
    delete nextBets[number]
    return nextBets
  }

  nextBets[number] = updatedAmount
  return nextBets
}

export function multiplyBets(bets: RouletteBets, factor: number): RouletteBets {
  if (factor === 1) {
    return cloneBets(bets)
  }

  return Object.fromEntries(Object.entries(bets).map(([key, value]) => [Number(key), value * factor]))
}

export function getCoveragePercentage(bets: RouletteBets): number {
  return (Object.keys(bets).length / TOTAL_ROULETTE_NUMBERS) * 100
}

export function isRedNumber(number: number): boolean {
  return RED_NUMBERS.has(number)
}

export function getNumberTone(number: number): RouletteNumberTone {
  if (number === 0) {
    return 'zero'
  }

  return isRedNumber(number) ? 'red' : 'black'
}

export function normalizeRouletteBets(rawBets: unknown): RouletteBets {
  if (!rawBets || typeof rawBets !== 'object') {
    return {}
  }

  return Object.entries(rawBets).reduce<RouletteBets>((normalizedBets, [rawKey, rawAmount]) => {
    const number = Number(rawKey)
    const amount = Number(rawAmount)

    if (!Number.isInteger(number) || number < 0 || number > 36) {
      return normalizedBets
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return normalizedBets
    }

    normalizedBets[number] = amount
    return normalizedBets
  }, {})
}

export function normalizeRouletteState(rawState: unknown): RouletteGameState {
  if (!rawState || typeof rawState !== 'object') {
    return createInitialRouletteState()
  }

  const state = rawState as Partial<RouletteGameState>
  const balance = typeof state.balance === 'number' && Number.isFinite(state.balance) && state.balance >= 0
    ? Math.floor(state.balance)
    : DEFAULT_ROULETTE_CREDITS

  const history = Array.isArray(state.history)
    ? state.history
        .map((number) => Number(number))
        .filter((number) => Number.isInteger(number) && number >= 0 && number <= 36)
        .slice(0, MAX_HISTORY_ITEMS)
    : []

  const resultsHistory = Array.isArray(state.resultsHistory)
    ? state.resultsHistory
        .filter(isRouletteSpinResult)
        .slice(0, MAX_HISTORY_ITEMS)
    : []

  return {
    balance,
    history,
    lastBets: normalizeRouletteBets(state.lastBets),
    resultsHistory
  }
}

export function replenishRouletteBalance(
  state: RouletteGameState,
  amount = DEFAULT_REPLENISH_AMOUNT
): RouletteGameState {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : DEFAULT_REPLENISH_AMOUNT

  return {
    ...state,
    balance: state.balance + safeAmount
  }
}

export function spinRouletteState(
  currentState: RouletteGameState,
  bets: RouletteBets,
  randomSource: () => number = Math.random
): RouletteSpinResolution {
  const normalizedBets = normalizeRouletteBets(bets)

  if (!hasBets(normalizedBets)) {
    throw new Error('Place at least one bet before spinning.')
  }

  if (!canAffordBets(currentState.balance, normalizedBets)) {
    throw new Error('Insufficient balance for that bet.')
  }

  const finalNumber = drawRouletteNumber(randomSource)
  const round = settleStraightUpRound(finalNumber, normalizedBets)

  if (!round) {
    throw new Error('Unable to settle this round.')
  }

  const totalBet = sumBets(normalizedBets)

  return {
    round,
    state: {
      balance: currentState.balance - totalBet + round.creditsAwarded,
      history: prependAndLimit(currentState.history, finalNumber),
      lastBets: normalizedBets,
      resultsHistory: prependAndLimit(currentState.resultsHistory, round)
    }
  }
}

export function settleStraightUpRound(finalNumber: number, bets: RouletteBets): RouletteSpinResult | null {
  if (!hasBets(bets)) {
    return null
  }

  const winningBet = bets[finalNumber]

  if (winningBet) {
    const winnings = winningBet * 35

    return {
      kind: 'win',
      message: getWinMessage(winnings),
      amount: winnings,
      creditsAwarded: winnings + winningBet,
      finalNumber,
      timestamp: Date.now()
    }
  }

  return {
    kind: 'loss',
    message: getLossMessage(finalNumber),
    amount: sumBets(bets),
    creditsAwarded: 0,
    finalNumber,
    timestamp: Date.now()
  }
}

export function prependAndLimit<T>(items: T[], item: T, limit = MAX_HISTORY_ITEMS): T[] {
  return [item, ...items].slice(0, limit)
}

export function drawRouletteNumber(randomSource: () => number = Math.random): number {
  return Math.floor(randomSource() * TOTAL_ROULETTE_NUMBERS)
}

function isRouletteSpinResult(value: unknown): value is RouletteSpinResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const result = value as Partial<RouletteSpinResult>

  return (
    (result.kind === 'win' || result.kind === 'loss') &&
    typeof result.message === 'string' &&
    typeof result.amount === 'number' &&
    typeof result.creditsAwarded === 'number' &&
    Number.isInteger(result.finalNumber) &&
    typeof result.timestamp === 'number'
  )
}

function getWinMessage(winnings: number): string {
  if (winnings > 5000) {
    return 'Jackpot'
  }

  if (winnings > 1000) {
    return 'Big win'
  }

  return 'You win'
}

function getLossMessage(finalNumber: number): string {
  const tone = getNumberTone(finalNumber)

  if (tone === 'zero') {
    return `ZERO ${finalNumber}`
  }

  return `${tone.toUpperCase()} ${finalNumber}`
}
