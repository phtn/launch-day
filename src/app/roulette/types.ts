import { MouseEvent } from "react";

interface Controls {
  repeatBet: VoidFunction;
  doubleBet: VoidFunction;
  clearBets: VoidFunction;
  spin: VoidFunction;
}
interface ControlState {
  lastBets: Record<number, number>;
  selectedBets: Record<number, number>;
  isAutoPlaying: boolean;
  spinning: boolean;
}
export interface DeviceControlProps {
  chipValue: number;
  onChangeChipValue: (
    value: number,
  ) => (e: MouseEvent<HTMLButtonElement>) => void;
  onChangeHistory: (e: MouseEvent<HTMLButtonElement>) => void;
  controls: Controls;
  state: ControlState;
}

export interface INumberCell {
  id: number;
  v: number;
}

export interface ResultHistory {
  number: number;
  win: boolean;
  amount: number;
  timestamp: Date;
}

export interface DataListProps {
  history: number[];
  resultsHistory: ResultHistory[];
  getNumberColor: (v: number) => string;
}
