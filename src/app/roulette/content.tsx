"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type MouseEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/lib/hooks/use-mobile";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { DeviceControlProps, INumberCell, ResultHistory } from "./types";
import { useSFX } from "./sfx";
import { ChipList } from "./chip";
import {
  CreditBalance,
  Header,
  HistoryList,
  OptionsDrawer,
  ResultsSection,
  ZeroNumberCell,
} from "./components";
import { HyperList } from "@/lib/ui/hyperlist";

export default function RouletteGame() {
  const isMobile = useMobile();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedBets, setSelectedBets] = useState<{ [key: number]: number }>(
    {},
  );
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [credits, setCredits] = useState(1000);
  const [lastBets, setLastBets] = useState<{ [key: number]: number }>({});
  const [totalBet, setTotalBet] = useState(0);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [loseAmount, setLoseAmount] = useState<number | null>(null);
  const [chipValue, setChipValue] = useState(5);
  const [muted, setMuted] = useState(false);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<ResultHistory[]>([]);
  const [showHistory, setShowHistory] = useState(!isMobile);

  // Auto play settings
  // const [autoPlayCount, setAutoPlayCount] = useState(5);
  const [autoPlayRemaining, setAutoPlayRemaining] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Refs for intervals and timeouts
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  } = useSFX();

  // Define colors for numbers in cyberpunk theme with new bright colors
  const getNumberColor = useCallback(
    (num: number) => {
      if (num === 0) return "bg-avocado hover:bg-avocado/90";

      return redNumbers.includes(num)
        ? "bg-blood hover:bg-blood/90"
        : "bg-mossad hover:bg-mossad/90";
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
        }
      }, 100);
    }

    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
    };
  }, [spinning, selectedBets, loseSFX, winSFX, redNumbers]);

  // Internal spin function without auto play logic
  const spinRouletteInternal = useCallback(() => {
    if (Object.keys(selectedBets).length === 0) {
      errorSFX();
      return;
    }

    setSpinning(true);
    setResult(null);
    setWinAmount(null);
    setLoseAmount(null);
    setLastBets({ ...selectedBets });
    setHasPlacedBet(false);
    startSFX();
  }, [startSFX, errorSFX, selectedBets]);

  // Handle auto play
  useEffect(() => {
    // Clean up any existing timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }

    if (isAutoPlaying && autoPlayRemaining > 0 && !spinning) {
      autoPlayTimeoutRef.current = setTimeout(() => {
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
              setAutoPlayRemaining((prev) => prev - 1);
            }, 500);
          } else {
            // Not enough credits, stop auto play
            setIsAutoPlaying(false);
            setAutoPlayRemaining(0);
          }
        } else if (Object.keys(selectedBets).length > 0) {
          // We have current bets, just spin
          spinRouletteInternal();
          setAutoPlayRemaining((prev) => prev - 1);
        } else {
          // No bets at all, stop auto play
          setIsAutoPlaying(false);
          setAutoPlayRemaining(0);
        }
      }, 2000); // 2 second delay between auto spins
    } else if (autoPlayRemaining <= 0 && isAutoPlaying) {
      setIsAutoPlaying(false);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
    };
  }, [
    isAutoPlaying,
    autoPlayRemaining,
    spinning,
    selectedBets,
    lastBets,
    credits,
    spinRouletteInternal,
  ]);

  // Toggle controls visibility on mobile when orientation changes
  useEffect(() => {
    if (isMobile) {
      setShowHistory(false);
    } else {
      setShowHistory(true);
    }
  }, [isMobile]);

  const placeBet = useCallback(
    (num: number) => {
      if (credits >= chipValue) {
        const currentBet = selectedBets[num] || 0;
        const newBet = currentBet + chipValue;

        setSelectedBets((prev) => ({ ...prev, [num]: newBet }));
        setCredits((prev) => prev - chipValue);
        setHasPlacedBet(true);
        placeBetSFX();
      } else {
        errorSFX();
      }
    },
    [chipValue, credits, selectedBets, placeBetSFX, errorSFX],
  );

  const removeBet = useCallback(
    (num: number) => {
      const currentBet = selectedBets[num] || 0;
      if (currentBet >= chipValue) {
        const newBet = currentBet - chipValue;
        const newBets = { ...selectedBets };

        if (newBet === 0) {
          delete newBets[num];
        } else {
          newBets[num] = newBet;
        }

        setSelectedBets(newBets);
        setCredits((prev) => prev + chipValue);
        removeBetSFX();
      }
    },
    [chipValue, removeBetSFX, selectedBets],
  );

  const clearBets = useCallback(() => {
    const refundAmount = Object.values(selectedBets).reduce(
      (sum, bet) => sum + bet,
      0,
    );
    setCredits((prev) => prev + refundAmount);
    setSelectedBets({});
    setHasPlacedBet(false);
    clearBetsSFX();
  }, [selectedBets, clearBetsSFX]);

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

  // Main spin function with auto play handling
  const spinRoulette = useCallback(() => {
    if (isAutoPlaying) {
      // Stop auto play if it's running
      setIsAutoPlaying(false);
      setAutoPlayRemaining(0);
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
      return;
    }

    spinRouletteInternal();
  }, [isAutoPlaying, spinRouletteInternal]);

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

  const controls = useMemo(
    () => ({
      repeatBet,
      doubleBet,
      clearBets,
      spin: spinRoulette,
    }),
    [repeatBet, doubleBet, clearBets, spinRoulette],
  );

  const gameState = useMemo(
    () => ({
      spinning,
      isAutoPlaying,
      lastBets,
      selectedBets,
    }),
    [spinning, isAutoPlaying, lastBets, selectedBets],
  );

  const controlProps = useMemo(
    () => ({
      chipValue,
      onChangeChipValue: handleChipValueChange,
      onChangeHistory: handleChangeHistory,
      controls,
      state: gameState,
    }),
    [
      chipValue,
      handleChipValueChange,
      handleChangeHistory,
      controls,
      gameState,
    ],
  );

  const handlePlaceBet = useCallback(
    (v: number) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      placeBet(v);
    },
    [placeBet],
  );

  const handleRemoveBet = useCallback(
    (v: number) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      removeBet(v);
    },
    [removeBet],
  );

  const NumberCell = useCallback(
    ({ v, id }: INumberCell) => {
      return (
        <div
          key={`num-${id}`}
          className={cn("relative flex select-none size-full overflow-hidden", {
            "border-4 rounded-2xl border-avocado": selectedNumber === v,
          })}
        >
          <div
            className={cn(
              `w-full aspect-square flex items-center justify-center text-base font-bold text-white cursor-pointer ${getNumberColor(v)}`,
              {
                "rounded-tl-lg": [3, 9, 15, 21, 27, 33].includes(v),
                "rounded-bl-lg": [1, 7, 13, 19, 25, 31].includes(v),
                "rounded-tr-lg": [6, 12, 18, 24, 30, 36].includes(v),
                "rounded-br-lg": [4, 10, 16, 22, 28, 34].includes(v),
              },
            )}
            onClick={handlePlaceBet(v)}
            onContextMenu={handleRemoveBet(v)}
          >
            <span className="text-xl md:text-3xl">{v}</span>
          </div>
          {selectedBets[v] && (
            <div className="absolute top-1 left-1 bg-white p-[0.5px] drop-shadow-lg border border-panel/60 rounded-full flex items-center size-5 md:size-10 justify-center">
              <div
                className={cn(
                  "pointer-events-none tracking-tighter md:size-full",
                  "flex items-center justify-center md:border-2",
                  "text-panel font-bold",
                  "border-dashed border-panel/70 rounded-full",
                  {
                    "border-orange-500": selectedBets[v] > 50,
                    "border-black": selectedBets[v] > 100,
                  },
                )}
              >
                {selectedBets[v]}
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      getNumberColor,
      handlePlaceBet,
      handleRemoveBet,
      selectedBets,
      selectedNumber,
    ],
  );

  const handleReplenish = useCallback(() => {
    setCredits((prev) => prev + 420);
  }, []);

  return (
    <div
      ref={gameContainerRef}
      className="h-screen overflow-hidden text-white bg-black flex flex-col"
    >
      {/* Header */}
      <Header
        isMobile={isMobile}
        isAutoPlaying={isAutoPlaying}
        autoPlays={autoPlayRemaining}
        muted={muted}
        toggleMute={toggleMute}
      />

      {/* Main content - flex-grow to take available space */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Game area - scrollable if needed */}
          <div className="flex-grow overflow-hidden md:px-4 md:py-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                {/* Results */}
                <ResultsSection
                  getNumberColor={getNumberColor}
                  loseAmount={loseAmount}
                  result={result}
                  selectedNumber={selectedNumber}
                  spinning={spinning}
                  totalBet={totalBet}
                  winAmount={winAmount}
                />

                {/* Roulette table */}
                <div className="h-96 rounded-lg md:mb-4 shadow-dark-panel">
                  <div className="md:flex">
                    {/* ZERO */}
                    <ZeroNumberCell
                      rightClickFn={handleRemoveBet}
                      leftClickFn={handlePlaceBet}
                      getNumberColor={getNumberColor}
                      selectedBets={selectedBets}
                    />

                    {/* Main grid - larger cells */}
                    <div className="grid grid-rows-3 gap-0.5 h-full flex-grow overflow-hidden">
                      {rouletteGrid.map((row, rowIndex) => {
                        const data = row.map((v, id) => ({ v, id }));
                        return (
                          <HyperList
                            key={`row-${rowIndex}`}
                            container={cn(
                              "grid grid-cols-12 w-full size-full gap-1 md:overflow-hidden",
                            )}
                            data={data}
                            itemStyle={cn("md:even:mr-1 overflow-hidden")}
                            component={NumberCell}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom betting options - styled for cyberpunk */}
                  {/* <StreetBetOptions /> */}
                </div>
                {/* Desktop controls */}
                {!isMobile && (
                  <>
                    {/* Chip value selector */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2 text-cyan-300 border-b border-cyan-800/50 pb-1"></h3>
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
                            {isAutoPlaying ? (
                              <>Stop Auto Play</>
                            ) : spinning ? (
                              <Icon
                                name="spinners-scale-rotate"
                                className="shrink-0 size-7 text-lime-300"
                              />
                            ) : (
                              <>Spin</>
                            )}
                          </button>

                          <button
                            onClick={doubleBet}
                            disabled={spinning || !hasPlacedBet}
                            className={cn(
                              "py-6 w-[130px] btn btn-outline border-slate-300/50 text-slate-300 rounded-full",
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
                              "py-6 btn rounded-full tracking-tighter w-[130px] btn-outline border-stone-500/60 text-stone-300 font-medium flex items-center gap-2",
                              {
                                hidden:
                                  Object.keys(lastBets).length === 0 ||
                                  hasPlacedBet,
                              },
                            )}
                          >
                            <Icon name="refresh-linear" />
                            Repeat Bet
                          </button>

                          <button
                            onClick={clearBets}
                            disabled={
                              spinning || Object.keys(selectedBets).length === 0
                            }
                            className={cn(
                              "py-6 w-32 btn btn-outline overflow-hidden text-stone-300 rounded-full font-medium border-error/60",
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

      <div className="text-center text-xs text-cyan-400/70 py-1 px-4">
        Left-click to add chips ({chipValue} credits). Right-click to remove
        chips.
      </div>
    </div>
  );
}

const MobileControls = (props: DeviceControlProps) => {
  const { chipValue, onChangeChipValue, onChangeHistory, controls, state } =
    props;
  const { spin, repeatBet, doubleBet } = controls;
  const { spinning, lastBets, selectedBets, isAutoPlaying } = state;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-[#ff00ff]/30 p-2 z-50">
      <div className="flex items-center justify-between">
        {/* Chip selector */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {[5, 25, 100].map((value) => (
            <Button
              key={`mobile-chip-${value}`}
              variant={chipValue === value ? "default" : "outline"}
              size="sm"
              className={`rounded-full w-10 h-10 p-0 ${
                chipValue === value
                  ? "bg-[#ff00ff] hover:bg-[#ff33ff] text-white border border-lime-400 shadow-[0_0_10px_rgba(255,0,255,0.7)]"
                  : "border-[#ff00ff] text-[#ff77ff]"
              }`}
              onClick={onChangeChipValue(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        {/* Main actions */}
        <div className="flex items-center gap-1">
          <Button
            onClick={repeatBet}
            variant="outline"
            size="sm"
            disabled={spinning} //
            className={cn(
              "h-10 w-10 p-0 rounded-full border-cyan-500 text-cyan-300",
              { hidden: Object.keys(lastBets).length === 0 },
            )}
          >
            <Icon name="arrow-turn-up" className="h-4 w-4" />
          </Button>

          <Button
            onClick={doubleBet}
            variant="outline"
            size="sm"
            disabled={spinning || Object.keys(selectedBets).length === 0}
            className="h-10 w-10 p-0 rounded-full border-lime-500 text-lime-300"
          >
            2x
          </Button>

          <Button
            onClick={spin}
            disabled={
              spinning ||
              (Object.keys(selectedBets).length === 0 &&
                Object.keys(lastBets).length === 0)
            }
            size="sm"
            className="h-14 w-14 p-0 rounded-full bg-[#ff00ff] hover:bg-[#ff33ff] shadow-[0_0_15px_rgba(255,0,255,0.7)]"
          >
            {isAutoPlaying ? (
              <Icon name="close" className="h-6 w-6" />
            ) : spinning ? (
              <Icon name="play" className="h-6 w-6 animate-spin" />
            ) : (
              <Icon name="energy" className="h-6 w-6" />
            )}
          </Button>

          <Button
            onClick={onChangeHistory}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 rounded-full border-[#ff00ff] text-[#ff77ff]"
          >
            <Icon name="close" className="h-4 w-4" />
          </Button>

          <OptionsDrawer />
        </div>
      </div>
    </div>
  );
};
