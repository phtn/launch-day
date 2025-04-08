"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type MouseEvent,
  ChangeEvent,
} from "react";
import { useMobile } from "@/lib/hooks/use-mobile";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { DeviceControlProps, INumberCell, ResultHistory } from "./types";
import { useSFX } from "./sfx";
import { ChipBet, ChipList } from "./chip";
import {
  CreditBalance,
  Header,
  HistoryList,
  ResultsSection,
  StreetBetOptions,
  ZeroNumberCell,
} from "./components";
import { HyperList } from "@/lib/ui/hyperlist";

export default function RouletteGame() {
  const isMobile = useMobile();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedBets, setSelectedBets] = useState<Record<number, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [credits, setCredits] = useState(4110);
  const [lastBets, setLastBets] = useState<Record<number, number>>({});
  const [totalBet, setTotalBet] = useState(0);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [loseAmount, setLoseAmount] = useState<number | null>(null);
  const [chipValue, setChipValue] = useState(5);
  const [muted, setMuted] = useState(false);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<ResultHistory[]>([]);
  const [showHistory, setShowHistory] = useState(!isMobile);

  // const [autoPlayCount, setAutoPlayCount] = useState(5);
  const [autoBetPlayRemaining, setAutoBetPlayRemaining] = useState(0);
  const [autoPlayTimeRemaining, setAutoPlayTimeRemaining] = useState(0);
  const [isAutoBetPlaying, setIsAutoBetPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Refs for intervals and timeouts
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoBetPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Roulette numbers in correct order from the image
  const ff = [3, 6, 9, 12];
  const fs = [15, 18, 21, 24];
  const ft = [27, 30, 33, 36];
  const sf = [2, 5, 8, 11];
  const ss = [14, 17, 20, 23];
  const st = [26, 29, 32, 35];
  const tf = [1, 4, 7, 10];
  const ts = [13, 16, 19, 22];
  const tt = [25, 28, 31, 34];
  const rouletteGrid = [
    [...ff, ...fs, ...ft],
    [...sf, ...ss, ...st],
    [...tf, ...ts, ...tt],
  ];

  // All numbers in a flat array
  // const allNumbers = [0, ...rouletteGrid.flat()];
  // Red numbers in European roulette become hot fuchsia
  const redNumbers = useMemo(
    () => [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    [],
  );

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
    stopRouletteSpinSFX,
  } = useSFX();

  // Define colors for numbers in cyberpunk theme with new bright colors
  const getNumberColor = useCallback(
    (num: number) => {
      if (num === 0) return "bg-card-table hover:bg-avocado/90";

      return redNumbers.includes(num)
        ? "bg-brood hover:bg-brood/90"
        : "bg-panel-dark hover:bg-panel-dark/90";
    },
    [redNumbers],
  );

  // Calculate total bet amount
  useEffect(() => {
    const total = Object.values(selectedBets).reduce(
      (sum, bet) => sum + bet,
      0,
    );
    setTotalBet(total);
  }, [selectedBets]);

  // Clean up all intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      if (autoBetPlayTimeoutRef.current) {
        clearTimeout(autoBetPlayTimeoutRef.current);
        autoBetPlayTimeoutRef.current = null;
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle spinning animation and result calculation
  useEffect(() => {
    if (spinning) {
      let spins = 0;
      const maxSpins = 20;

      // Clear any existing interval first
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }

      spinIntervalRef.current = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 37);
        setSelectedNumber(randomNum);
        spins++;

        if (spins >= maxSpins) {
          if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
            spinIntervalRef.current = null;
          }

          // Final selection
          const finalNumber = Math.floor(Math.random() * 37);
          setSelectedNumber(finalNumber);
          setHistory((prev) => [finalNumber, ...prev]);

          // Check if any selected numbers match the result
          const totalBetAmount = Object.values(selectedBets).reduce(
            (sum, bet) => sum + bet,
            0,
          );

          if (Object.keys(selectedBets).length > 0) {
            if (selectedBets[finalNumber]) {
              const winnings = selectedBets[finalNumber] * 35;
              setCredits((prev) => prev + winnings + selectedBets[finalNumber]);
              setResult(
                winnings > 5000
                  ? `Holy shit!`
                  : winnings > 1000
                    ? `Babaaammm!`
                    : `YOU WIN`,
              );
              setWinAmount(winnings);
              winSFX();

              // Add to results history
              setResultsHistory((prev) => [
                {
                  number: finalNumber,
                  win: true,
                  amount: winnings,
                  timestamp: new Date(),
                },
                ...prev,
              ]);
            } else {
              setResult(
                `${redNumbers.includes(finalNumber) ? "RED" : finalNumber === 0 ? "ZERO" : "BLACK"} ${finalNumber}`,
              );
              setLoseAmount(totalBetAmount);
              loseSFX();

              // Add to results history
              setResultsHistory((prev) => [
                {
                  number: finalNumber,
                  win: false,
                  amount: -totalBetAmount,
                  timestamp: new Date(),
                },
                ...prev,
              ]);
            }
          }

          // Clear bets after spin
          setSelectedBets({});
          setSpinning(false);
          stopRouletteSpinSFX();
        }
      }, 100);
    }

    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
    };
  }, [
    spinning,
    selectedBets,
    loseSFX,
    winSFX,
    redNumbers,
    stopRouletteSpinSFX,
  ]);

  // Internal spin function without auto play logic
  const spinRouletteInternal = useCallback(() => {
    // if (Object.keys(selectedBets).length === 0) {
    //   errorSFX();
    //   return;
    // }

    setSpinning(true);
    setResult(null);
    setWinAmount(null);
    setLoseAmount(null);
    if (Object.keys(selectedBets).length !== 0) {
      setLastBets({ ...selectedBets });
    }
    setHasPlacedBet(false);
    startSFX();
    rouletteSpinSFX();
  }, [startSFX, selectedBets, rouletteSpinSFX]);

  // Handle auto bet play
  useEffect(() => {
    // Clean up any existing timeout
    if (autoBetPlayTimeoutRef.current) {
      clearTimeout(autoBetPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }

    if (isAutoBetPlaying && autoBetPlayRemaining > 0 && !spinning) {
      autoBetPlayTimeoutRef.current = setTimeout(() => {
        if (
          Object.keys(selectedBets).length === 0 &&
          Object.keys(lastBets).length > 0
        ) {
          // If no current bets but we have last bets, repeat them
          const repeatAmount = Object.values(lastBets).reduce(
            (sum, bet) => sum + bet,
            0,
          );
          if (credits >= repeatAmount) {
            setSelectedBets({ ...lastBets });
            setCredits((prev) => prev - repeatAmount);

            // Then spin after a short delay
            setTimeout(() => {
              spinRouletteInternal();
              setAutoBetPlayRemaining((prev) => prev - 1);
            }, 500);
          } else {
            // Not enough credits, stop auto play
            setIsAutoBetPlaying(false);
            setAutoBetPlayRemaining(0);
          }
        } else if (Object.keys(selectedBets).length > 0) {
          // We have current bets, just spin
          spinRouletteInternal();
          setAutoBetPlayRemaining((prev) => prev - 1);
        } else {
          // No bets at all, stop auto play
          setIsAutoBetPlaying(false);
          setAutoBetPlayRemaining(0);
        }
      }, 2000); // 2 second delay between auto spins
    } else if (autoBetPlayRemaining <= 0 && isAutoBetPlaying) {
      setIsAutoBetPlaying(false);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
    };
  }, [
    isAutoBetPlaying,
    autoBetPlayRemaining,
    spinning,
    selectedBets,
    lastBets,
    credits,
    spinRouletteInternal,
  ]);

  useEffect(() => {
    // Clean up any existing timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }

    if (isAutoPlaying) {
      autoPlayTimeoutRef.current = setTimeout(() => {
        setTimeout(() => {
          spinRouletteInternal();
        }, 500);
      }, 30000); // 2 second delay between auto spins
      setAutoPlayTimeRemaining(30);
    } else if (!isAutoPlaying) {
      setIsAutoPlaying(false);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
    };
  }, [isAutoPlaying, spinRouletteInternal]);

  useEffect(() => {
    if (isAutoPlaying && !spinning) {
      const intervalId = setInterval(() => {
        setAutoPlayTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isAutoPlaying, spinning]);

  // Toggle controls visibility on mobile when orientation changes
  useEffect(() => {
    if (isMobile) {
      setShowHistory(false);
    } else {
      setShowHistory(true);
    }
  }, [isMobile]);

  const clearBets = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentTimeout = autoPlayTimeoutRef.current;
      const currentTime = autoPlayTimeRemaining;

      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }

      const refundAmount = Object.values(selectedBets).reduce(
        (sum, bet) => sum + bet,
        0,
      );
      setCredits((prev) => prev + refundAmount);
      setSelectedBets({});
      setHasPlacedBet(false);
      clearBetsSFX();

      if (isAutoPlaying) {
        autoPlayTimeoutRef.current = setTimeout(() => {
          spinRouletteInternal();
        }, currentTime * 1000);
      }
    },
    [
      selectedBets,
      clearBetsSFX,
      autoPlayTimeRemaining,
      isAutoPlaying,
      spinRouletteInternal,
    ],
  );

  const repeatBet = useCallback(() => {
    if (Object.keys(lastBets).length === 0) return;

    const repeatAmount = Object.values(lastBets).reduce(
      (sum, bet) => sum + bet,
      0,
    );
    if (credits >= repeatAmount) {
      setSelectedBets({ ...lastBets });
      setCredits((prev) => prev - repeatAmount);
      setHasPlacedBet(true);
      repeatBetSFX();
    } else {
      notAllowedSFX();
    }
  }, [lastBets, credits, repeatBetSFX, notAllowedSFX]);

  const doubleBet = useCallback(() => {
    if (Object.keys(selectedBets).length === 0) return;

    const doubleAmount = Object.values(selectedBets).reduce(
      (sum, bet) => sum + bet,
      0,
    );
    if (credits >= doubleAmount) {
      const doubledBets = { ...selectedBets };
      Object.keys(doubledBets).forEach((key) => {
        doubledBets[Number(key)] *= 2;
      });

      setSelectedBets(doubledBets);
      setCredits((prev) => prev - doubleAmount);
      betBigSFX();
    } else {
      notAllowedSFX();
    }
  }, [selectedBets, credits, betBigSFX, notAllowedSFX]);

  // Main spin function with auto play handling
  const spinRoulette = useCallback(() => {
    if (isAutoBetPlaying) {
      // Stop auto play if it's running
      setIsAutoBetPlaying(false);
      setAutoBetPlayRemaining(0);
      if (autoBetPlayTimeoutRef.current) {
        clearTimeout(autoBetPlayTimeoutRef.current);
        autoBetPlayTimeoutRef.current = null;
      }
      return;
    }

    spinRouletteInternal();
  }, [isAutoBetPlaying, spinRouletteInternal]);

  // Start auto play
  // const startAutoPlay = () => {
  //   if (autoPlayCount <= 0 || isAutoPlaying) return

  //   setAutoPlayRemaining(autoPlayCount)
  //   setIsAutoPlaying(true)
  // }

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleChipValueChange = useCallback(
    (value: number) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setChipValue(value);
      chipSelectSFX();
    },
    [chipSelectSFX],
  );

  const handleChangeHistory = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowHistory(!showHistory);
    },
    [showHistory],
  );

  const handleReplenish = useCallback(() => {
    setCredits((prev) => prev + 420);
  }, []);

  const controls = useMemo(
    () => ({
      repeatBet,
      doubleBet,
      clearBets,
      spin: spinRoulette,
      replenishFn: handleReplenish,
    }),
    [repeatBet, doubleBet, clearBets, spinRoulette, handleReplenish],
  );

  const gameState = useMemo(
    () => ({
      spinning,
      lastBets,
      isAutoBetPlaying,
      selectedBets,
      hasPlacedBet,
      credits,
    }),
    [credits, hasPlacedBet, spinning, isAutoBetPlaying, lastBets, selectedBets],
  );

  const controlProps = useMemo(
    () => ({
      chipValue,
      onChangeChipValue: handleChipValueChange,
      onChangeHistory: handleChangeHistory,
      controls,
      state: gameState,
      replenishFn: handleReplenish,
    }),
    [
      chipValue,
      handleChipValueChange,
      handleChangeHistory,
      handleReplenish,
      controls,
      gameState,
    ],
  );

  const placeBet = useCallback(
    (v: number) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (credits >= chipValue) {
        // Store current timeout
        // const currentTimeout = autoPlayTimeoutRef.current;
        const currentTime = autoPlayTimeRemaining;

        // if (currentTimeout) {
        //   clearTimeout(currentTimeout);
        // }

        setSelectedBets((prev) => ({
          ...prev,
          [v]: prev[v] ? prev[v] + chipValue : chipValue,
        }));
        setCredits((prev) => prev - chipValue);
        setHasPlacedBet(true);
        placeBetSFX();

        // Restore the auto-play timer with remaining time
        if (isAutoPlaying) {
          console.log(currentTime);
          autoPlayTimeoutRef.current = setTimeout(() => {
            spinRouletteInternal();
          }, currentTime * 1000);
        }
      } else {
        errorSFX();
      }
    },
    [
      autoPlayTimeRemaining,
      spinRouletteInternal,
      chipValue,
      credits,
      errorSFX,
      placeBetSFX,
      isAutoPlaying,
    ],
  );

  const removeBet = useCallback(
    (v: number) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const currentBet = selectedBets[v] || 0;
      if (currentBet >= chipValue) {
        const newBet = currentBet - chipValue;
        const newBets = { ...selectedBets };

        if (newBet === 0) {
          delete newBets[v];
        } else {
          newBets[v] = newBet;
        }

        setSelectedBets(newBets);
        setCredits((prev) => prev + chipValue);
        removeBetSFX();
      }
    },
    [chipValue, removeBetSFX, selectedBets],
  );

  const handleAutoPlay = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setIsAutoPlaying(e.target.checked);
    },
    [setIsAutoPlaying],
  );

  const NumberCell = useCallback(
    ({ v, id }: INumberCell) => {
      return (
        <div
          key={`num-${id}`}
          className={cn(
            "relative rounded-[2px] flex select-none size-full overflow-hidden",
            {
              "rounded-2xl border-warning": selectedNumber === v && !spinning,
            },
          )}
        >
          <div
            className={cn(
              `w-full aspect-square flex items-center justify-center text-base font-bold text-white cursor-pointer ${getNumberColor(v)}`,
              // {
              //   "rounded-tl-xl": [3, 9, 15, 21, 27, 33].includes(v),
              //   "rounded-bl-xl": [1, 7, 13, 19, 25, 31].includes(v),
              //   "rounded-tr-xl": [6, 12, 18, 24, 30, 36].includes(v),
              //   "rounded-br-xl": [4, 10, 16, 22, 28, 34].includes(v),
              // },
            )}
            onClick={placeBet(v)}
            onContextMenu={removeBet(v)}
          >
            <span
              className={cn("text-xl md:text-3xl", {
                "text-minty": selectedNumber === v,
              })}
            >
              {v}
            </span>
          </div>
          {selectedBets[v] && (
            <div className="absolute pointer-events-none top-4 left-4 md:top-1 md:left-1 bg-white p-[0.5px] drop-shadow-lg border border-panel/60 rounded-full flex items-center size-5 md:size-10 justify-center">
              <ChipBet value={selectedBets[v]} />
            </div>
          )}
        </div>
      );
    },
    [
      getNumberColor,
      placeBet,
      removeBet,
      selectedBets,
      selectedNumber,
      spinning,
    ],
  );

  return (
    <div
      ref={gameContainerRef}
      className="h-screen px-4 md:px-0 overflow-hidden text-white bg-black flex flex-col"
    >
      {/* Header */}
      <Header
        isMobile={isMobile}
        isAutoPlaying={isAutoPlaying}
        muted={muted}
        toggleMute={toggleMute}
      />

      {/* Main content - flex-grow to take available space */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Game area - scrollable if needed */}
          <div className="flex-grow overflow-hidden md:px-4 md:py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                {/* Results */}
                <ResultsSection
                  getNumberColor={getNumberColor}
                  loseAmount={loseAmount}
                  result={result}
                  selectedNumber={selectedNumber}
                  selectedBets={selectedBets}
                  spinning={spinning}
                  totalBet={totalBet}
                  winAmount={winAmount}
                />

                {/* Roulette table */}
                <div className="h-96 rounded-lg md:mb-4 bg-card-table/80 shadow-dark-panel p-3">
                  <div className="md:flex">
                    {/* ZERO */}
                    <ZeroNumberCell
                      rightClickFn={removeBet}
                      leftClickFn={placeBet}
                      getNumberColor={getNumberColor}
                      selectedBets={selectedBets}
                    />

                    {/* Main grid - larger cells */}
                    <div className="grid grid-rows-3 border border-b-0 backdrop-blur-lg gap-px bg-white/60 h-full flex-grow overflow-hidden">
                      {rouletteGrid.map((row, rowIndex) => {
                        const data = row.map((v, id) => ({ v, id }));
                        return (
                          <HyperList
                            key={`row-${rowIndex}`}
                            container={cn(
                              "grid grid-cols-6 gap-px md:grid-cols-12 size-full md:overflow-hidden",
                            )}
                            data={data}
                            itemStyle={cn("overflow-hidden")}
                            component={NumberCell}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom betting options - styled for cyberpunk */}
                  <div className="flex">
                    <div className="w-[86px]"></div>
                    <StreetBetOptions />
                  </div>
                </div>
                {/* Desktop controls */}
                {!isMobile && (
                  <>
                    {/* Chip value selector */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2 text-cyan-300 border-cyan-800/50 pb-1"></h3>
                      <div className="flex items-center w-full justify-between">
                        <CreditBalance
                          replenishFn={handleReplenish}
                          credits={credits}
                        />
                        <ChipList
                          chipValue={chipValue}
                          onChangeFn={handleChipValueChange}
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={spinRoulette}
                            disabled={
                              spinning ||
                              (Object.keys(selectedBets).length === 0 &&
                                Object.keys(lastBets).length === 0)
                            }
                            className="py-6 btn rounded-full bg-minty overflow-hidden text-slate-700 w-32 text-lg flex items-center gap-2"
                          >
                            {isAutoBetPlaying ? (
                              <>Stop</>
                            ) : spinning ? (
                              <Icon
                                name="spinners-scale-rotate"
                                className="shrink-0 size-7 text-lime-300"
                              />
                            ) : (
                              <>
                                {isAutoPlaying
                                  ? `Auto ${autoPlayTimeRemaining}s`
                                  : "Spin"}
                              </>
                            )}
                          </button>

                          <button
                            onClick={doubleBet}
                            disabled={spinning || !hasPlacedBet}
                            className={cn(
                              "py-6 w-16 btn btn-outline text-lg border-slate-300/50 text-slate-300 rounded-full",
                              {
                                hidden: !hasPlacedBet,
                              },
                            )}
                          >
                            2x
                          </button>

                          <button
                            onClick={repeatBet}
                            disabled={spinning}
                            className={cn(
                              "py-6 btn rounded-full tracking-tighter w-16 btn-outline border-stone-500/60 text-stone-300 font-medium flex items-center gap-2",
                              {
                                hidden:
                                  Object.keys(lastBets).length === 0 ||
                                  hasPlacedBet,
                              },
                            )}
                          >
                            <Icon name="repeat" />
                          </button>

                          <button
                            onClick={clearBets}
                            disabled={
                              spinning || Object.keys(selectedBets).length === 0
                            }
                            className={cn(
                              "py-6 w-16 btn btn-outline overflow-hidden text-stone-300 rounded-full font-medium border-error/60",
                            )}
                          >
                            <Icon name="eraser" className="size-7 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* History panel */}
              {showHistory && (
                <HistoryList
                  data={{
                    history,
                    resultsHistory,
                    getNumberColor,
                  }}
                  onChangeHistoryFn={handleChangeHistory}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom bar for mobile */}
      {isMobile && <MobileControls {...controlProps} />}

      <div className="md:flex md:p-4 py-4 hidden space-x-2 items-center">
        <input
          type="checkbox"
          className="toggle toggle-sm toggle-accent"
          checked={isAutoPlaying}
          onChange={handleAutoPlay}
        />
        <span className="text-sm font-bold text-accent">Auto Play</span>
      </div>
      <div className="text-center hidden md:flex text-xs text-cyan-400/70 py-1 px-4">
        Left-click to add chips ({chipValue} credits). Right-click to remove
        chips.
      </div>
    </div>
  );
}

const MobileControls = (props: DeviceControlProps) => {
  const { chipValue, onChangeChipValue, controls, state } = props;
  const { spin, repeatBet, doubleBet, clearBets, replenishFn } = controls;
  const {
    spinning,
    lastBets,
    selectedBets,
    isAutoBetPlaying,
    hasPlacedBet,
    credits,
  } = state;
  return (
    <div className="fixed bottom-5 left-0 right-0 z-50">
      <div className="flex items-center space-y-4 flex-col justify-between">
        {/* Chip selector */}
        <div className="flex-shrink-0 flex items-center ps-4">
          <ChipList chipValue={chipValue} onChangeFn={onChangeChipValue} />
        </div>

        {/* Main actions */}
        <div className="flex w-full px-4 items-center justify-between">
          <CreditBalance credits={credits} replenishFn={replenishFn} />
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={spin}
              disabled={
                spinning ||
                (Object.keys(selectedBets).length === 0 &&
                  Object.keys(lastBets).length === 0)
              }
              className="py-6 btn rounded-full bg-minty overflow-hidden text-slate-700 w-16 text-lg flex items-center gap-2"
            >
              {isAutoBetPlaying ? (
                <>Stop</>
              ) : spinning ? (
                <Icon
                  name="spinners-scale-rotate"
                  className="shrink-0 size-7 text-lime-300"
                />
              ) : (
                <Icon name="play" />
              )}
            </button>

            <button
              onClick={doubleBet}
              disabled={spinning || !hasPlacedBet}
              className={cn(
                "py-6 w-16 btn btn-outline text-lg border-slate-300/50 text-slate-300 rounded-full",
                {
                  hidden: !hasPlacedBet,
                },
              )}
            >
              2x
            </button>

            <button
              onClick={repeatBet}
              disabled={spinning}
              className={cn(
                "py-6 btn rounded-full tracking-tighter w-16 btn-outline border-stone-500/60 text-stone-300 font-medium flex items-center gap-2",
                {
                  hidden: Object.keys(lastBets).length === 0 || hasPlacedBet,
                },
              )}
            >
              <Icon name="repeat" />
            </button>

            <button
              onClick={clearBets}
              disabled={spinning || Object.keys(selectedBets).length === 0}
              className={cn(
                "py-6 w-16 btn btn-outline border-stone-500/60 overflow-hidden rounded-full font-medium",
              )}
            >
              <Icon name="eraser" className="size-7 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// chipSelectSFX

// Add chip to all selected numbers
// const addChipToAllSelected = () => {
//   const selectedNumbers = Object.keys(selectedBets).map(Number)
//   if (selectedNumbers.length === 0) return

//   const totalCost = selectedNumbers.length * chipValue
//   if (credits >= totalCost) {
//     const newBets = { ...selectedBets }
//     selectedNumbers.forEach((num) => {
//       newBets[num] = (newBets[num] || 0) + chipValue
//     })

//     setSelectedBets(newBets)
//     setCredits((prev) => prev - totalCost)
//     playSound(chipSoundRef)
//   }
// }

// Add chip to all numbers
// const addChipToAllNumbers = () => {
//   const totalCost = allNumbers.length * chipValue
//   if (credits >= totalCost) {
//     const newBets = { ...selectedBets }
//     allNumbers.forEach((num) => {
//       newBets[num] = (newBets[num] || 0) + chipValue
//     })

//     setSelectedBets(newBets)
//     setCredits((prev) => prev - totalCost)
//     playSound(chipSoundRef)
//   }
// }
