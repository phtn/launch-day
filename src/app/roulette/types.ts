import { MouseEventHandler } from 'react'
import { RouletteBets, RouletteSpinResult } from '@/lib/roulette/game'

interface Controls {
  repeatBet: VoidFunction
  doubleBet: VoidFunction
  clearBets: MouseEventHandler<HTMLButtonElement>
  spin: VoidFunction
  replenishFn: VoidFunction
}

interface ControlState {
  lastBets: RouletteBets
  selectedBets: RouletteBets
  spinning: boolean
  hasPlacedBet: boolean
  credits: number
  isAutoPlaying: boolean
  autoPlayTimeRemaining: number
}

export interface DeviceControlProps {
  chipValue: number
  onChangeChipValue: (
    value: number
  ) => MouseEventHandler<HTMLButtonElement>
  controls: Controls
  state: ControlState
}

export type ResultHistory = RouletteSpinResult

export interface DataListProps {
  history: number[]
  resultsHistory: ResultHistory[]
  getNumberColor: (v: number) => string
}
