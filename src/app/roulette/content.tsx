'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent
} from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { Icon } from '@/lib/icons'
import {
  AUTO_PLAY_DELAY_MS,
  DEFAULT_CHIP_VALUE,
  SPIN_ANIMATION_DURATION_MS,
  SPIN_INTERVAL_MS,
  addBet,
  canAffordBets,
  cloneBets,
  drawRouletteNumber,
  getCoveragePercentage,
  getNumberTone,
  hasBets,
  multiplyBets,
  removeBetAmount,
  type RouletteApiAction,
  type RouletteApiResponse,
  type RouletteBets,
  type RouletteDisplayResult,
  type RouletteGameState,
  type RouletteSpinResult
} from '@/lib/roulette/game'
import { cn } from '@/lib/utils'
import { RouletteBoard } from './board'
import { ChipList } from './chip'
import { CreditBalance, Header, HistoryList, ResultsSection } from './components'
import { useSFX } from './sfx'
import { DeviceControlProps } from './types'

type RouletteApiSuccess = Extract<RouletteApiResponse, { success: true }>

interface RouletteGameProps {
  initialState: RouletteGameState
}

export default function RouletteGame({ initialState }: RouletteGameProps) {
  const isMobile = useMobile()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(initialState.history[0] ?? null)
  const [spinning, setSpinning] = useState(false)
  const [selectedBets, setSelectedBets] = useState<RouletteBets>({})
  const [outcome, setOutcome] = useState<RouletteDisplayResult | null>(
    initialState.resultsHistory[0] ? toDisplayResult(initialState.resultsHistory[0]) : null
  )
  const [serverState, setServerState] = useState<RouletteGameState>(initialState)
  const [chipValue, setChipValue] = useState(DEFAULT_CHIP_VALUE)
  const [muted, setMuted] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(true)
  const [autoPlayTimeRemaining, setAutoPlayTimeRemaining] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoPlayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoPlayDeadlineRef = useRef<number | null>(null)
  const handleAutoPlaySpinRef = useRef<VoidFunction | null>(null)
  const selectedBetsRef = useRef(selectedBets)
  const chipValueRef = useRef(chipValue)
  const spinningRef = useRef(spinning)
  const mutedRef = useRef(muted)
  const isAutoPlayingRef = useRef(isAutoPlaying)
  const serverStateRef = useRef(serverState)

  const {
    winSFX,
    loseSFX,
    startSFX,
    errorSFX,
    betBigSFX,
    placeBetSFX,
    removeBetSFX,
    clearBetsSFX,
    repeatBetSFX,
    chipSelectSFX,
    notAllowedSFX,
    rouletteSpinSFX,
    stopRouletteSpinSFX
  } = useSFX()

  useEffect(() => {
    selectedBetsRef.current = selectedBets
    chipValueRef.current = chipValue
    spinningRef.current = spinning
    mutedRef.current = muted
    isAutoPlayingRef.current = isAutoPlaying
    serverStateRef.current = serverState
  }, [selectedBets, chipValue, spinning, muted, isAutoPlaying, serverState])

  const balance = serverState.balance
  const history = serverState.history
  const lastBets = serverState.lastBets
  const resultsHistory = serverState.resultsHistory
  const totalBet = Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0)
  const hasPlacedBet = hasBets(selectedBets)
  const hasLastBet = hasBets(lastBets)
  const coverage = hasPlacedBet ? getCoveragePercentage(selectedBets) : 0
  const showHistory = !isMobile && historyVisible

  const clearSpinInterval = useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current)
      spinIntervalRef.current = null
    }
  }, [])

  const clearAutoPlayTimeout = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
      autoPlayTimeoutRef.current = null
    }
  }, [])

  const clearAutoPlayInterval = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
      autoPlayIntervalRef.current = null
    }
  }, [])

  const playSFX = useCallback((sound: VoidFunction) => {
    if (!mutedRef.current) {
      sound()
    }
  }, [])

  const applyServerState = useCallback((nextState: RouletteGameState) => {
    serverStateRef.current = nextState
    startTransition(() => {
      setServerState(nextState)
    })
  }, [])

  const stopAutoPlay = useCallback(() => {
    isAutoPlayingRef.current = false
    autoPlayDeadlineRef.current = null
    clearAutoPlayTimeout()
    clearAutoPlayInterval()
    setIsAutoPlaying(false)
    setAutoPlayTimeRemaining(0)
  }, [clearAutoPlayInterval, clearAutoPlayTimeout])

  const getNumberColor = useCallback((number: number) => {
    switch (getNumberTone(number)) {
      case 'zero':
        return 'bg-zinc-600 hover:bg-avocado/90'
      case 'red':
        return 'bg-brood hover:bg-brood/90'
      default:
        return 'bg-panel-dark hover:bg-panel-dark/90'
    }
  }, [])

  useEffect(() => {
    return () => {
      clearSpinInterval()
      clearAutoPlayTimeout()
      clearAutoPlayInterval()
      stopRouletteSpinSFX()
    }
  }, [clearAutoPlayInterval, clearAutoPlayTimeout, clearSpinInterval, stopRouletteSpinSFX])

  const updateAutoPlayRemaining = useCallback(() => {
    if (autoPlayDeadlineRef.current === null) {
      setAutoPlayTimeRemaining(0)
      return
    }

    const remainingMs = Math.max(autoPlayDeadlineRef.current - Date.now(), 0)
    setAutoPlayTimeRemaining(Math.ceil(remainingMs / 1000))
  }, [])

  const scheduleAutoPlay = useCallback(
    (delayMs = AUTO_PLAY_DELAY_MS) => {
      if (!isAutoPlayingRef.current) {
        return
      }

      autoPlayDeadlineRef.current = Date.now() + delayMs
      clearAutoPlayTimeout()
      clearAutoPlayInterval()
      updateAutoPlayRemaining()

      autoPlayTimeoutRef.current = setTimeout(() => {
        autoPlayDeadlineRef.current = null
        clearAutoPlayTimeout()
        clearAutoPlayInterval()
        handleAutoPlaySpinRef.current?.()
      }, delayMs)

      autoPlayIntervalRef.current = setInterval(() => {
        updateAutoPlayRemaining()
      }, 1000)
    },
    [clearAutoPlayInterval, clearAutoPlayTimeout, updateAutoPlayRemaining]
  )

  const finishSpin = useCallback(() => {
    clearSpinInterval()
    spinningRef.current = false
    setSpinning(false)
    stopRouletteSpinSFX()
  }, [clearSpinInterval, stopRouletteSpinSFX])

  const restoreLastBets = useCallback(
    (quiet = false) => {
      const repeatedBets = cloneBets(serverStateRef.current.lastBets)

      if (!hasBets(repeatedBets)) {
        return null
      }

      if (!canAffordBets(serverStateRef.current.balance, repeatedBets)) {
        if (!quiet) {
          playSFX(notAllowedSFX)
        }
        return null
      }

      selectedBetsRef.current = repeatedBets
      setSelectedBets(repeatedBets)
      return repeatedBets
    },
    [notAllowedSFX, playSFX]
  )

  const getSpinSnapshot = useCallback(
    (playFailureSFX = true) => {
      if (hasBets(selectedBetsRef.current)) {
        return cloneBets(selectedBetsRef.current)
      }

      const repeatedBets = restoreLastBets(!playFailureSFX)

      if (repeatedBets) {
        return repeatedBets
      }

      if (playFailureSFX) {
        playSFX(errorSFX)
      }

      return null
    },
    [errorSFX, playSFX, restoreLastBets]
  )

  const handleSpinSuccess = useCallback(
    (payload: RouletteApiSuccess) => {
      const nextState = payload.state
      const round = payload.round

      if (!round) {
        throw new Error('Spin completed without a round payload.')
      }

      finishSpin()
      selectedBetsRef.current = {}
      setSelectedNumber(round.finalNumber)

      startTransition(() => {
        setSelectedBets({})
        setOutcome(toDisplayResult(round))
        setServerState(nextState)
      })

      serverStateRef.current = nextState
      playSFX(round.kind === 'win' ? winSFX : loseSFX)

      if (isAutoPlayingRef.current) {
        scheduleAutoPlay()
      }
    },
    [finishSpin, loseSFX, playSFX, scheduleAutoPlay, winSFX]
  )

  const spinRoulette = useCallback(
    async (fromAutoPlay = false) => {
      if (spinningRef.current) {
        return
      }

      const spinBets = getSpinSnapshot(!fromAutoPlay)

      if (!spinBets) {
        if (fromAutoPlay) {
          stopAutoPlay()
        }
        return
      }

      clearAutoPlayTimeout()
      clearAutoPlayInterval()
      autoPlayDeadlineRef.current = null

      spinningRef.current = true
      setSpinning(true)
      setOutcome(null)
      setAutoPlayTimeRemaining(0)
      playSFX(startSFX)
      playSFX(rouletteSpinSFX)

      clearSpinInterval()
      spinIntervalRef.current = setInterval(() => {
        setSelectedNumber(drawRouletteNumber())
      }, SPIN_INTERVAL_MS)

      try {
        const [payload] = await Promise.all([
          requestRouletteAction({
            action: 'spin',
            bets: spinBets
          }),
          delay(SPIN_ANIMATION_DURATION_MS)
        ])

        handleSpinSuccess(payload)
      } catch (error) {
        finishSpin()
        playSFX(errorSFX)

        if (fromAutoPlay) {
          stopAutoPlay()
        }

        console.error(error)
      }
    },
    [
      clearAutoPlayInterval,
      clearAutoPlayTimeout,
      clearSpinInterval,
      errorSFX,
      finishSpin,
      getSpinSnapshot,
      handleSpinSuccess,
      playSFX,
      rouletteSpinSFX,
      startSFX,
      stopAutoPlay
    ]
  )

  useEffect(() => {
    handleAutoPlaySpinRef.current = () => {
      void spinRoulette(true)
    }

    return () => {
      handleAutoPlaySpinRef.current = null
    }
  }, [spinRoulette])

  const clearBets = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (spinningRef.current || !hasBets(selectedBetsRef.current)) {
      return
    }

    selectedBetsRef.current = {}
    setSelectedBets({})
    playSFX(clearBetsSFX)
  }, [clearBetsSFX, playSFX])

  const repeatBet = useCallback(() => {
    const repeatedBets = restoreLastBets()

    if (repeatedBets) {
      playSFX(repeatBetSFX)
    }
  }, [playSFX, repeatBetSFX, restoreLastBets])

  const doubleBet = useCallback(() => {
    if (!hasBets(selectedBetsRef.current)) {
      return
    }

    const doubledBets = multiplyBets(selectedBetsRef.current, 2)

    if (!canAffordBets(serverStateRef.current.balance, doubledBets)) {
      playSFX(notAllowedSFX)
      return
    }

    selectedBetsRef.current = doubledBets
    setSelectedBets(doubledBets)
    playSFX(betBigSFX)
  }, [betBigSFX, notAllowedSFX, playSFX])

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted
      mutedRef.current = nextMuted

      if (nextMuted) {
        stopRouletteSpinSFX()
      }

      return nextMuted
    })
  }, [stopRouletteSpinSFX])

  const handleChipValueChange = useCallback(
    (value: number) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      chipValueRef.current = value
      setChipValue(value)
      playSFX(chipSelectSFX)
    },
    [chipSelectSFX, playSFX]
  )

  const handleChangeHistory = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setHistoryVisible((currentValue) => !currentValue)
  }, [])

  const handleReplenish = useCallback(async () => {
    if (spinningRef.current) {
      return
    }

    try {
      const payload = await requestRouletteAction({
        action: 'replenish'
      })

      applyServerState(payload.state)
    } catch (error) {
      playSFX(errorSFX)
      console.error(error)
    }
  }, [applyServerState, errorSFX, playSFX])

  const placeBet = useCallback(
    (value: number) => {
      if (spinningRef.current) {
        return
      }

      const nextChipValue = chipValueRef.current

      setSelectedBets((currentBets) => {
        const nextBets = addBet(currentBets, value, nextChipValue)

        if (!canAffordBets(serverStateRef.current.balance, nextBets)) {
          playSFX(errorSFX)
          return currentBets
        }

        selectedBetsRef.current = nextBets
        playSFX(placeBetSFX)
        return nextBets
      })
    },
    [errorSFX, placeBetSFX, playSFX]
  )

  const removeBet = useCallback(
    (value: number) => {
      if (spinningRef.current) {
        return
      }

      const nextBets = removeBetAmount(selectedBetsRef.current, value, chipValueRef.current)

      if (nextBets === selectedBetsRef.current) {
        return
      }

      selectedBetsRef.current = nextBets
      setSelectedBets(nextBets)
      playSFX(removeBetSFX)
    },
    [playSFX, removeBetSFX]
  )

  const handleAutoPlay = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()

      if (!event.target.checked) {
        stopAutoPlay()
        return
      }

      isAutoPlayingRef.current = true
      setIsAutoPlaying(true)

      if (!spinningRef.current) {
        scheduleAutoPlay()
      }
    },
    [scheduleAutoPlay, stopAutoPlay]
  )

  const controls: DeviceControlProps['controls'] = {
    repeatBet,
    doubleBet,
    clearBets,
    spin: () => {
      void spinRoulette()
    },
    replenishFn: () => {
      void handleReplenish()
    }
  }

  const controlState: DeviceControlProps['state'] = {
    spinning,
    lastBets,
    selectedBets,
    hasPlacedBet,
    credits: balance,
    isAutoPlaying,
    autoPlayTimeRemaining
  }

  return (
    <div className='h-screen px-4 md:px-0 overflow-hidden text-white bg-black flex flex-col'>
      <Header muted={muted} isMobile={isMobile} toggleMute={toggleMute} replenishFn={controls.replenishFn} credits={balance} />

      <div className='grow flex flex-col overflow-hidden'>
        <div className='flex flex-col h-full'>
          <div className='grow overflow-hidden md:px-4 md:py-4'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='grow'>
                <ResultsSection
                  coverage={coverage}
                  getNumberColor={getNumberColor}
                  outcome={outcome}
                  selectedNumber={selectedNumber}
                  spinning={spinning}
                  totalBet={totalBet}
                />

                <RouletteBoard
                  getNumberColor={getNumberColor}
                  onPlaceBet={placeBet}
                  onRemoveBet={removeBet}
                  selectedBets={selectedBets}
                  selectedNumber={selectedNumber}
                  spinning={spinning}
                />

                {!isMobile && (
                  <div className='md:fixed md:bottom-40 md:left-1/5 w-fit'>
                    <h3 className='text-lg font-medium text-cyan-300 border-cyan-800/50 pb-1'></h3>
                    <div className='flex h-28 items-center w-full justify-around space-x-8'>
                      <ChipList chipValue={chipValue} onChangeFn={handleChipValueChange} />

                      <div className='grid grid-cols-3 gap-2'>
                        <button
                          onClick={() => {
                            void spinRoulette()
                          }}
                          disabled={spinning || (!hasPlacedBet && !hasLastBet)}
                          className='py-6 btn rounded-full bg-minty overflow-hidden text-slate-700 w-32 text-lg flex items-center gap-2'>
                          {spinning ? (
                            <Icon name='spinners-scale-rotate' className='shrink-0 size-7 text-lime-300' />
                          ) : (
                            <>{isAutoPlaying ? `Auto ${autoPlayTimeRemaining}s` : 'Spin'}</>
                          )}
                        </button>

                        <button
                          onClick={doubleBet}
                          disabled={spinning || !hasPlacedBet}
                          className={cn('py-6 w-16 btn btn-outline text-lg border-slate-300/50 text-slate-300 rounded-full', {
                            hidden: !hasPlacedBet
                          })}>
                          2x
                        </button>

                        <button
                          onClick={repeatBet}
                          disabled={spinning}
                          className={cn(
                            'py-6 btn rounded-full tracking-tighter w-16 btn-outline border-stone-500/60 text-stone-300 font-medium flex items-center gap-2',
                            {
                              hidden: !hasLastBet || hasPlacedBet
                            }
                          )}>
                          <Icon name='repeat' />
                        </button>

                        <button
                          onClick={clearBets}
                          disabled={spinning || !hasPlacedBet}
                          className='py-6 w-16 btn btn-outline overflow-hidden text-stone-300 rounded-full font-medium border-error/60'>
                          <Icon name='eraser' className='size-7 shrink-0' />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showHistory && (
                <HistoryList
                  data={{
                    history,
                    resultsHistory,
                    getNumberColor
                  }}
                  onChangeHistoryFn={handleChangeHistory}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobile && <MobileControls chipValue={chipValue} onChangeChipValue={handleChipValueChange} controls={controls} state={controlState} />}

      <div className='md:flex md:p-4 py-4 hidden space-x-2 items-center'>
        <input
          type='checkbox'
          className='toggle toggle-sm toggle-accent'
          checked={isAutoPlaying}
          onChange={handleAutoPlay}
        />
        <span className='text-sm font-bold text-accent'>Auto Play</span>
      </div>
      <div className='text-center hidden md:flex text-xs text-cyan-400/70 py-1 px-4'>
        Left-click to add chips ({chipValue} credits). Right-click to remove chips.
      </div>
    </div>
  )
}

const MobileControls = ({ chipValue, onChangeChipValue, controls, state }: DeviceControlProps) => {
  const { spin, repeatBet, doubleBet, clearBets, replenishFn } = controls
  const { spinning, lastBets, selectedBets, hasPlacedBet, credits } = state

  return (
    <div className='fixed bottom-5 left-0 right-0 z-50'>
      <div className='flex items-center space-y-4 flex-col justify-between'>
        <div className='shrink-0 flex items-center ps-4'>
          <ChipList chipValue={chipValue} onChangeFn={onChangeChipValue} />
        </div>

        <div className='flex w-full px-4 items-center justify-between'>
          <CreditBalance credits={credits} replenishFn={replenishFn} />
          <div className='grid grid-cols-3 gap-2'>
            <button
              onClick={spin}
              disabled={spinning || (!hasPlacedBet && !hasBets(lastBets))}
              className='py-6 btn rounded-full bg-minty overflow-hidden text-slate-700 w-16 text-lg flex items-center gap-2'>
              {spinning ? <Icon name='spinners-scale-rotate' className='shrink-0 size-7 text-lime-300' /> : <Icon name='play' />}
            </button>

            <button
              onClick={doubleBet}
              disabled={spinning || !hasPlacedBet}
              className={cn('py-6 w-16 btn btn-outline text-lg border-slate-300/50 text-slate-300 rounded-full', {
                hidden: !hasPlacedBet
              })}>
              2x
            </button>

            <button
              onClick={repeatBet}
              disabled={spinning}
              className={cn(
                'py-6 btn rounded-full tracking-tighter w-16 btn-outline border-stone-500/60 text-stone-300 font-medium flex items-center gap-2',
                {
                  hidden: !hasBets(lastBets) || hasPlacedBet
                }
              )}>
              <Icon name='repeat' />
            </button>

            <button
              onClick={clearBets}
              disabled={spinning || !hasBets(selectedBets)}
              className='py-6 w-16 btn btn-outline border-stone-500/60 overflow-hidden rounded-full font-medium'>
              <Icon name='eraser' className='size-7 shrink-0' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

async function requestRouletteAction(action: RouletteApiAction): Promise<RouletteApiSuccess> {
  const response = await fetch('/api/roulette', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action)
  })

  const payload = (await response.json()) as RouletteApiResponse

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Unable to complete roulette request.' : payload.error)
  }

  return payload
}

function toDisplayResult(result: RouletteSpinResult): RouletteDisplayResult {
  return {
    kind: result.kind,
    message: result.message,
    amount: result.amount
  }
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
