import { NextResponse } from 'next/server'
import {
  createInitialRouletteState,
  normalizeRouletteBets,
  replenishRouletteBalance,
  spinRouletteState,
  type RouletteApiAction,
  type RouletteApiResponse
} from '@/lib/roulette/game'
import { applyRouletteStateCookie, getRouletteServerState } from '@/lib/roulette/server'

export async function GET(): Promise<NextResponse<RouletteApiResponse>> {
  const state = await getRouletteServerState()
  const response = NextResponse.json({
    success: true as const,
    state
  })

  return applyRouletteStateCookie(response, state)
}

export async function POST(request: Request): Promise<NextResponse<RouletteApiResponse>> {
  const currentState = await getRouletteServerState()

  try {
    const body = (await request.json()) as RouletteApiAction

    switch (body.action) {
      case 'spin': {
        const { state, round } = spinRouletteState(currentState, normalizeRouletteBets(body.bets))
        const response = NextResponse.json({
          success: true as const,
          state,
          round
        })

        return applyRouletteStateCookie(response, state)
      }

      case 'replenish': {
        const state = replenishRouletteBalance(currentState, body.amount)
        const response = NextResponse.json({
          success: true as const,
          state
        })

        return applyRouletteStateCookie(response, state)
      }

      case 'reset': {
        const state = createInitialRouletteState()
        const response = NextResponse.json({
          success: true as const,
          state
        })

        return applyRouletteStateCookie(response, state)
      }

      default:
        return NextResponse.json(
          {
            success: false as const,
            error: 'Unsupported roulette action.',
            state: currentState
          },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unable to process roulette request.',
        state: currentState
      },
      { status: 400 }
    )
  }
}
