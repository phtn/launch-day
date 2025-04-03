import { Icon } from "@/lib/icons";
import { MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DataListProps } from "./types";
import { ChipBet } from "./chip";

export const StreetBetOptions = () => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-1 mt-2">
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          1st 12
        </div>
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          2nd 12
        </div>
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          3rd 12
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 mt-1">
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          1-18
        </div>
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          EVEN
        </div>
        <div className="bg-[#ff00ff]/60 h-10 border border-[#ff00ff]/50 rounded-sm shadow-[0_0_10px_rgba(255,0,255,0.2)]"></div>
        <div className="bg-cyan-900/60 h-10 border border-cyan-700/50 rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]"></div>
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          ODD
        </div>
        <div className="bg-cyan-900/60 text-cyan-200 text-center py-2 border border-cyan-700/50 text-sm rounded-sm shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          19-36
        </div>
      </div>
    </div>
  );
};

interface HisstoryListProps {
  onChangeHistoryFn: (e: MouseEvent<HTMLButtonElement>) => void;
  data: DataListProps;
}
export const HistoryList = (props: HisstoryListProps) => {
  return (
    <div className="md:w-80 bg-panel relative rounded-xl p-3">
      <div className="flex justify-between absolute right-0 items-center mb-4">
        <h2 className="text-xl font-bold text-white/80"></h2>
        <button
          onClick={props.onChangeHistoryFn}
          className="btn btn-ghost btn-sm"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>

      <DataList {...props.data} />
    </div>
  );
};

const DataList = ({
  history,
  resultsHistory,
  getNumberColor,
}: DataListProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="tabs">
        <label className="tab bg-transparent">
          <input type="radio" name="history" defaultChecked />
          Numbers
        </label>
        <div className="tab-content h-[600px] p-4 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-gray-400 text-center">No spins yet</div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {history.map((num, index) => (
                <div
                  key={`history-${index}`}
                  className={`size-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-gray-800 ${getNumberColor(num)}`}
                >
                  {num}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="tab">
          <input type="radio" name="history" />
          Win/Loss
        </label>
        <div className="tab-content max-h-[600px] overflow-y-auto">
          {resultsHistory.length === 0 ? (
            <div className="text-gray-400 text-center">No results yet</div>
          ) : (
            <div className="space-y-2">
              {resultsHistory.map((result, index) => (
                <div
                  key={`result-${index}`}
                  className={`p-2 rounded-md ${
                    result.win ? "bg-minty/40" : "bg-error/40"
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${getNumberColor(result.number)}`}
                    >
                      {result.number}
                    </div>
                    <div className="text-white font-bold">
                      {result.win ? "Win" : "Loss"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={`font-bold ${result.win ? "text-minty" : "text-white"}`}
                    >
                      {result.win ? `+${result.amount}` : result.amount}
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatTime(result.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const OptionsDrawer = () => (
  <div>
    {/* <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/80 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.5)]"
            >
              <Menu className="h-5 w-5 text-[#ff00ff]" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-gray-900/95 border-t border-[#ff00ff] rounded-t-xl pt-6 pb-8 px-4 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">More Options</h3>
                <Button variant="ghost" size="icon" onClick={toggleMute} className="h-10 w-10 text-[#ff00ff]">
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={addChipToAllSelected}
                  variant="outline"
                  disabled={spinning || Object.keys(selectedBets).length === 0}
                  className="py-6 border-purple-500 text-purple-300"
                >
                  Add to Selected
                </Button>

                <Button
                  onClick={addChipToAllNumbers}
                  variant="outline"
                  disabled={spinning || credits < chipValue * allNumbers.length}
                  className="py-6 border-blue-500 text-blue-300"
                >
                  Add to All
                </Button>

                <Button
                  onClick={clearBets}
                  variant="outline"
                  disabled={spinning || Object.keys(selectedBets).length === 0}
                  className="py-6 border-cyan-500 text-cyan-300"
                >
                  Clear All Bets
                </Button>

                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  className="py-6 border-[#ff00ff] text-[#ff00ff] flex items-center justify-center gap-2"
                >
                  <Icon name="clock" className="text-primary" />
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
              </div>

              <div className="bg-gray-800/80 p-4 rounded-lg border border-cyan-800">
                <h3 className="text-lg font-medium mb-2 text-cyan-300">Auto Play</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                      Number of Games: {autoPlayCount}
                    <Slider
                      id="auto-play-count"
                      defaultValue={[5]}
                      max={50}
                      min={1}
                      step={1}
                      onValueChange={(value) => setAutoPlayCount(value[0])}
                      disabled={isAutoPlaying}
                      className="my-2"
                    />
                  </div>
                  <Button
                    onClick={startAutoPlay}
                    disabled={
                      spinning ||
                      isAutoPlaying ||
                      (Object.keys(selectedBets).length === 0 && Object.keys(lastBets).length === 0)
                    }
                    className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.7)]"
                  >
                    <Icon name="play" className="text-primary" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
          */}
  </div>
);

interface HeaderProps {
  isAutoPlaying: boolean;
  isMobile: boolean;
  muted: boolean;
  toggleMute: VoidFunction;
}
export const Header = ({ isMobile, muted, toggleMute }: HeaderProps) => (
  <div className="flex justify-between items-center px-4 h-14 md:h-[80px] py-1.5 md:py-3 border-b border-slate-800/20">
    <div className="flex items-center gap-2">
      {/* {isAutoPlaying && (
        <div className="bg-oklch(0.7 0.3225 328.36)/30 text-[#ff00ff] px-3 py-1 rounded-md text-sm font-medium animate-pulse border border-[#ff00ff]/50">
          Auto: {autoPlays}
        </div>
      )} */}

      {!isMobile && (
        <button onClick={toggleMute} className="h-10 btn w-10 text-cyan-300">
          {muted ? (
            <Icon name="abacus" className="h-5 w-5" />
          ) : (
            <Icon name="abacus" className="text-secondary" />
          )}
        </button>
      )}
    </div>
  </div>
);

interface CreditBalanceProps {
  credits: number;
  replenishFn: VoidFunction;
}
export const CreditBalance = ({ credits, replenishFn }: CreditBalanceProps) => (
  <div className="flex items-center space-x-4">
    <div className="w-36">
      <motion.div
        className="bg-panel-dark/60 space-y-1 py-1 backdrop-blur-sm space-x-2 border border-minty/50 px-2 rounded-lg text-xl font-semibold shadow-minty justify-between items-center"
        animate={{
          boxShadow:
            credits > 1000
              ? [
                  "0 0 15px rgba(132,204,22,0.3)",
                  "0 0 25px rgba(132,204,22,0.5)",
                  "0 0 15px rgba(132,204,22,0.3)",
                ]
              : undefined,
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <div className="text-xs leading-none font-medium">Balance:</div>
        <div className="flex items-center justify-between">
          <span className="text-minty font-light">$</span>
          <span className="text-gray-300 text-right">{credits}</span>
        </div>
      </motion.div>
    </div>
    <button className="btn rounded-full size-8" onClick={replenishFn}>
      <Icon name="energy" className="text-mossad shrink-0" />
    </button>
  </div>
);

interface ZeroNumberCellProps {
  leftClickFn: (v: number) => (e: MouseEvent<HTMLDivElement>) => void;
  rightClickFn: (v: number) => (e: MouseEvent<HTMLDivElement>) => void;
  getNumberColor: (v: number) => string;
  selectedBets: Record<number, number>;
}
export const ZeroNumberCell = ({
  rightClickFn,
  leftClickFn,
  getNumberColor,
  selectedBets,
}: ZeroNumberCellProps) => (
  <div className="relative md:mr-2">
    <div
      className={cn(
        "w-full md:w-16 h-full text-dark-panel md:rounded-sm md:rounded-s-xl flex items-center justify-center text-xl md:text-3xl font-bold cursor-pointer transition-all",
        getNumberColor(0),
      )}
      onClick={leftClickFn(0)}
      onContextMenu={rightClickFn(0)}
    >
      0
    </div>
    {selectedBets[0] && (
      <div className="absolute pointer-events-none top-1 left-1 bg-white p-[0.5px] drop-shadow-lg border border-panel/60 rounded-full flex items-center size-5 md:size-10 justify-center">
        <ChipBet value={selectedBets[0]} />
      </div>
    )}
  </div>
);

interface ResultsProps {
  getNumberColor: (v: number) => string;
  loseAmount: number | null;
  result: string | null;
  selectedNumber: number | null;
  selectedBets: Record<number, number>;
  spinning: boolean;
  totalBet: number;
  winAmount: number | null;
}
export const ResultsSection = ({
  getNumberColor,
  loseAmount,
  result,
  selectedNumber,
  selectedBets,
  spinning,
  totalBet,
  winAmount,
}: ResultsProps) => (
  <div className="flex justify-between rounded-xl bg-panel h-24 items-center mb-4">
    <div>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-lg font-medium text-center mb-4 p-3 rounded-lg ${
              result.includes("WIN") ? "text-avocado-light" : "text-error"
            }`}
          >
            <span
              className={cn("font-bold", {
                "text-mossad": result.includes("BLACK"),
              })}
            >
              {result}
            </span>
            {loseAmount !== null && (
              <div className="text-white font-bold mt-1 flex items-center justify-center gap-1">
                <span className="font-semibold text-white">-${loseAmount}</span>
              </div>
            )}
            {winAmount !== null && (
              <div className="text-white font-bold mt-1 flex items-center justify-center gap-1">
                <span className="font-semibold text-white">${winAmount}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <motion.div
      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white ${
        selectedNumber !== null
          ? getNumberColor(selectedNumber)
          : "bg-panel-dark"
      }`}
      animate={{
        scale: spinning ? [1, 1.1, 1] : 1,
        rotate: spinning ? [0, 10, -10, 0] : 0,
      }}
      transition={{
        duration: 0.3,
        repeat: spinning ? Number.POSITIVE_INFINITY : 0,
        repeatType: "reverse",
      }}
    >
      {selectedNumber !== null ? selectedNumber : "0"}
    </motion.div>
    <div className="pe-4 flex items-center space-x-4">
      <div>
        {totalBet > 0 && (
          <div className="w-32 text-right mb-4 text-avocado-light">
            <div className="text-2xl text-white font-bold">
              {((Object.keys(selectedBets).length / 37) * 100).toFixed(2)}
              <span className="text-[18px] opacity-60"> %</span>
            </div>
            <div className="tracking-tight">Coverage</div>
          </div>
        )}
      </div>
      <div>
        {totalBet > 0 && (
          <div className="w-32 text-right mb-4 text-avocado-light">
            <div className="text-2xl text-white font-bold">
              <span className="text-[20px] opacity-60">$</span> {totalBet}
            </div>
            <div className="tracking-tight">Total Bet</div>
          </div>
        )}
      </div>
    </div>
  </div>
);
