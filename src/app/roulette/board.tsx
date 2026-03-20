import { ROULETTE_GRID, RouletteBets } from '@/lib/roulette/game'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { ChipBet } from './chip'
import { StreetBetOptions, ZeroNumberCell } from './components'

interface RouletteBoardProps {
  getNumberColor: (value: number) => string
  onPlaceBet: (value: number) => void
  onRemoveBet: (value: number) => void
  selectedBets: RouletteBets
  selectedNumber: number | null
  spinning: boolean
}

interface RouletteNumberCellProps {
  betAmount: number
  colorClass: string
  isCurrentNumber: boolean
  isSettledWinner: boolean
  onPlaceBet: (value: number) => void
  onRemoveBet: (value: number) => void
  value: number
}

const RouletteNumberCell = memo(function RouletteNumberCell({
  betAmount,
  colorClass,
  isCurrentNumber,
  isSettledWinner,
  onPlaceBet,
  onRemoveBet,
  value
}: RouletteNumberCellProps) {
  return (
    <div
      className={cn('relative rounded-xs flex select-none size-full overflow-hidden', {
        'rounded-2xl border-warning': isSettledWinner
      })}>
      <div
        className={cn(
          'w-full aspect-square flex items-center justify-center text-base font-bold text-neutral-100 cursor-pointer',
          colorClass
        )}
        onClick={(event) => {
          event.preventDefault()
          onPlaceBet(value)
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          onRemoveBet(value)
        }}>
        <span
          className={cn('text-xl md:text-4xl font-abril', {
            'text-minty': isCurrentNumber
          })}>
          {value}
        </span>
      </div>
      {betAmount > 0 && (
        <div className='absolute pointer-events-none top-4 left-4 md:top-1 md:left-1 bg-white p-[0.5px] drop-shadow-lg border border-panel/60 rounded-full flex items-center size-5 md:size-10 justify-center'>
          <ChipBet value={betAmount} />
        </div>
      )}
    </div>
  )
})

export const RouletteBoard = memo(function RouletteBoard({
  getNumberColor,
  onPlaceBet,
  onRemoveBet,
  selectedBets,
  selectedNumber,
  spinning
}: RouletteBoardProps) {
  return (
    <div className='h-fit rounded-lg md:mb-4 bg-zinc-600 shadow-dark-panel p-3'>
      <div className='md:flex'>
        <ZeroNumberCell
          onPlaceBet={onPlaceBet}
          onRemoveBet={onRemoveBet}
          getNumberColor={getNumberColor}
          selectedBets={selectedBets}
        />

        <div className='grid grid-rows-3 border border-b-0 backdrop-blur-lg gap-px bg-white/60 h-full grow overflow-hidden'>
          {ROULETTE_GRID.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className='grid grid-cols-6 gap-px md:grid-cols-12 size-full md:overflow-hidden'>
              {row.map((value) => (
                <RouletteNumberCell
                  key={value}
                  value={value}
                  betAmount={selectedBets[value] ?? 0}
                  colorClass={getNumberColor(value)}
                  isCurrentNumber={selectedNumber === value}
                  isSettledWinner={selectedNumber === value && !spinning}
                  onPlaceBet={onPlaceBet}
                  onRemoveBet={onRemoveBet}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='flex'>
        <div className='w-[86.01px]'></div>
        <StreetBetOptions />
      </div>
    </div>
  )
})
