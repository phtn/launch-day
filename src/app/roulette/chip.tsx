import { Icon } from "@/lib/icons";
import { HyperList } from "@/lib/ui/hyperlist";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { MouseEvent, useCallback, useMemo } from "react";

export interface CustomChipProps {
  size?: number;
  inlayCount?: number;
  className?: string;
  mainColor?: string;
  edgeColor?: string;
  edgeSize?: number;
  centerSymbol?: "spade" | "heart" | "club" | "diamond" | "custom";
  customSymbol?: React.ReactNode;
  id?: string;
}

export function Chip({
  size = 45,
  inlayCount = 12,
  className = "",
  mainColor = "#1e3a5f",
  edgeColor = "#0d2b4b",
  edgeSize = 0.15,
  centerSymbol = "diamond",
  customSymbol,
  id = "default",
}: CustomChipProps) {
  // Generate a unique ID for this chip to avoid SVG ID conflicts
  const uniqueId = useMemo(
    () => `chip-${id}-${Math.floor(Math.random() * 10000)}`,
    [id],
  );

  const radius = size / 2;
  const edgeWidth = size * edgeSize;
  const innerRadius = radius - edgeWidth;

  // Card suit paths - using consistent paths for server/client rendering
  const suits = useMemo(
    () => ({
      spade:
        "M10,2 C10,2 0,9 0,17 C0,23 5,25 10,30 C15,25 20,23 20,17 C20,9 10,2 10,2 Z",
      heart:
        "M10,6 C8,0 0,0 0,8 C0,12 5,16 10,20 C15,16 20,12 20,8 C20,0 12,0 10,6 Z",
      club: "M10,0 C7,0 5,3 5,6 C5,9 7,11 7,11 C7,11 3,10 1,13 C-1,16 1,20 5,20 C7,20 9,19 10,18 C11,19 13,20 15,20 C19,20 21,16 19,13 C17,10 13,11 13,11 C13,11 15,9 15,6 C15,3 13,0 10,0 Z",
      diamond: "M10,0 L20,10 L10,20 L0,10 Z",
    }),
    [],
  );

  // Calculate positions for edge inlays with card suits - using useMemo for consistency
  const inlays = useMemo(() => {
    const inlayArray = [];

    for (let i = 0; i < inlayCount; i++) {
      const angle = (i / inlayCount) * Math.PI * 2;
      const x = radius + (radius - edgeWidth / 2) * Math.cos(angle);
      const y = radius + (radius - edgeWidth / 2) * Math.sin(angle);

      // Alternate between suits in a deterministic way
      const suitIndex = i % 4;
      const suitKey = Object.keys(suits)[suitIndex];

      inlayArray.push({
        x,
        y,
        suit: suitKey,
        rotation: (angle * 180) / Math.PI + 90, // Adjust rotation to point outward
      });
    }

    return inlayArray;
  }, [radius, edgeWidth, suits, inlayCount]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-xl"
      >
        <defs>
          {/* Define card suit symbols with unique IDs */}
          {Object.entries(suits).map(([name, path]) => (
            <symbol
              key={`${uniqueId}-suit-${name}`}
              id={`${uniqueId}-suit-${name}`}
              viewBox="0 0 20 20"
              width="20"
              height="20"
            >
              <path d={path} fill="currentColor" />
            </symbol>
          ))}
        </defs>

        {/* Main chip body with shadow */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill={mainColor}
          filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))"
        />

        {/* Edge with pattern */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="none"
          stroke={edgeColor}
          strokeWidth={edgeWidth}
        />

        {/* Edge inlays with card suits */}
        {inlays.map((inlay, i) => (
          <g
            key={`${uniqueId}-inlay-${i}`}
            transform={`translate(${inlay.x}, ${inlay.y}) rotate(${inlay.rotation})`}
          >
            <circle
              cx="5"
              cy="0"
              r={edgeWidth * 0.4}
              fill="white"
              stroke={edgeColor}
              strokeWidth="2"
            />
            <use
              href={`#${uniqueId}-suit-${"diamond"}`}
              x={-edgeWidth * 0.2}
              y={-edgeWidth * 0.2}
              width={edgeWidth * 0.4}
              height={edgeWidth * 0.4}
              color={edgeColor}
            />
          </g>
        ))}

        {/* Inner circle with gradient */}
        <circle cx={radius} cy={radius} r={innerRadius} fill={mainColor} />

        {/* Decorative rings */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius * 0.9}
          fill="none"
          stroke="white"
          strokeWidth={innerRadius * 0.02}
          opacity="0.3"
        />

        <circle
          cx={radius}
          cy={radius}
          r={innerRadius * 0.8}
          fill="none"
          stroke="white"
          strokeWidth={innerRadius * 0.01}
          opacity="0.2"
        />

        {/* Center emblem */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius * 0.6}
          fill="white"
          stroke={edgeColor}
          strokeWidth={innerRadius * 0.02}
        />

        {/* Center suit symbol */}
        {centerSymbol !== "custom" ? (
          // <use
          //   href={`#${uniqueId}-suit-${centerSymbol}`}
          //   x={radius - innerRadius * 0.4}
          //   y={radius - innerRadius * 0.4}
          //   width={innerRadius * 0.8}
          //   height={innerRadius * 0.8}
          //   color={mainColor}
          // />
          <div className="h-2 border border-pink-500 relative z-50 flex items-center justify-center">
            <Icon name="energy" className="text-black" />
          </div>
        ) : (
          customSymbol
        )}
      </svg>
    </div>
  );
}

interface TChipProps {
  cover: string;
}
export const TChip = (props: TChipProps) => {
  return (
    <div className="size-16 aspect-auto flex items-center justify-center rounded-full overflow-hidden">
      <Image
        width={80}
        height={80}
        alt={props.cover}
        src={props.cover}
        className="aspect-square h-16 w-auto"
        unoptimized
        priority
      />
    </div>
  );
};

export const T1Chip = () => <TChip cover="/chips/t1.png" />;
export const T2Chip = () => <TChip cover="/chips/t2.png" />;
export const T3Chip = () => <TChip cover="/chips/t3.png" />;
export const T4Chip = () => <TChip cover="/chips/t4.png" />;
export const T5Chip = () => <TChip cover="/chips/t5.png" />;

interface IChipItem {
  value: number;
  cover: string;
}

interface ChipListProps {
  chipValue: number;
  onChangeFn: (v: number) => (e: MouseEvent<HTMLButtonElement>) => void;
}
export const ChipList = ({ chipValue, onChangeFn }: ChipListProps) => {
  const ChipItem = useCallback(
    ({ value, cover }: IChipItem) => (
      <button
        className={cn(
          "relative md:ml-0 bg-transparent flex items-center justify-center rounded-full size-16 md:size-[4.15rem]",
          {
            "border-2 border-lime-100 border-dashed": chipValue === value,
          },
        )}
        onClick={onChangeFn(value)}
      >
        <TChip cover={cover} />
        <span className="absolute text-sm md:text-normal">{value}</span>
      </button>
    ),
    [onChangeFn, chipValue],
  );
  return (
    <HyperList
      keyId="value"
      data={chips}
      component={ChipItem}
      itemStyle=""
      container="flex flex-wrap h-16 overflow-hidden"
    />
  );
};

export const ChipBet = ({ value }: { value: number }) => {
  const cover = useMemo(
    () => getCoverByValue(value) ?? "/chips/c1.png",
    [value],
  );

  return (
    <div
      className={cn(
        "relative bg-transparent flex items-center justify-center rounded-full size-14 p-0",
      )}
    >
      <TChip cover={cover} />
      <span className="absolute font-bold -tracking-widest drop-shadow-sm">
        {value}
      </span>
    </div>
  );
};

function getCoverByValue(maxValue: number): string | null {
  // Find the highest value chip that is less than or equal to maxValue
  const chip = chips
    .filter((chip) => chip.value <= maxValue) // Filter chips that are less than or equal to maxValue
    .sort((a, b) => b.value - a.value) // Sort in descending order by value
    .shift(); // Get the first chip (highest value)

  return chip ? chip.cover : null; // Return the cover or null if not found
}

const chips: IChipItem[] = [
  {
    value: 5,
    cover: "/chips/c1.png",
  },
  {
    value: 10,
    cover: "/chips/c2.png",
  },
  {
    value: 25,
    cover: "/chips/c3.png",
  },
  {
    value: 50,
    cover: "/chips/c4.png",
  },
  {
    value: 100,
    cover: "/chips/c5.png",
  },
  {
    value: 250,
    cover: "/chips/c6.png",
  },
];
