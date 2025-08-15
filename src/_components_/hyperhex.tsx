import { HEX_HEIGHT, HEX_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";

interface Props {
  posX: number;
  posY: number;
  children?: ReactNode;
}
export const HyperHex = ({ posX, posY, children }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="relative flex items-center justify-center z-100"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "size-full py-1 flex items-center justify-center absolute transition-all duration-1000 ease-linear",
        )}
      >
        <svg
          width={HEX_WIDTH + 4}
          height={HEX_HEIGHT + 6}
          viewBox="0 0 140 120"
          className="absolute z-0 group-hover/tile:opacity-100 opacity-0 transition-all duration-300"
        >
          <path
            d="M 40 0 L 100 0 Q 110 0 115 10 L 135 50 Q 140 60 135 70 L 115 110 Q 110 120 100 120 L 40 120 Q 30 120 25 110 L 5 70 Q 0 60 5 50 L 25 10 Q 30 0 40 0 Z"
            // stroke="#e0e0e01c" // Darker gray stroke for the gap effect
            strokeWidth="0"
            className={cn(" fill-teal-500")}
          />
        </svg>
        <svg
          width={HEX_WIDTH}
          height={HEX_HEIGHT}
          viewBox="0 0 140 120"
          className="absolute [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]"
        >
          <path
            d="M 40 0 L 100 0 Q 110 0 115 10 L 135 50 Q 140 60 135 70 L 115 110 Q 110 120 100 120 L 40 120 Q 30 120 25 110 L 5 70 Q 0 60 5 50 L 25 10 Q 30 0 40 0 Z"
            // stroke="#e0e0e01c" // Darker gray stroke for the gap effect
            strokeWidth="0"
            className={cn("fill-amber-50 group-hover/tile:shadow-xs z-10")}
          />
        </svg>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
