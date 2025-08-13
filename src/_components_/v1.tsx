import { StarlinkData } from "@/app/types";
import Link from "next/link";
import { Pentagram } from "./pentagon";
import { Icon } from "@/lib/icons";
import { HEX_WIDTH, GAP, HEX_HEIGHT } from "@/lib/constants";
import { motion } from "motion/react";
import { HexagonCard } from "./hexagon";

export const ListItem = (item: StarlinkData) => (
  <Link className="" href={item.href} target="_blank">
    <div className="h-24 group/link w-28 flex items-center justify-center relative">
      <Pentagram>
        <p className="absolute tracking-wide text-xs uppercase group-hover/link:-translate-y-5 translate-y-0 transition-all duration-300 ease-out delay-75 opacity-0 group-hover/link:opacity-100">
          {item.label}
        </p>
        <Icon
          name={item.icon}
          className="stroke-0 text-zinc-400 group-hover/link:translate-y-0.5 translate-y-0 group-hover/link:text-orange-200 transition-all duration-300 group-hover/link:scale-80 ease-out"
        />
      </Pentagram>
    </div>
  </Link>
);
export const HeatTiles = (item: StarlinkData) => {
  // Calculate positions for a 2x2 staggered hexagonal grid
  // For flat-top hexagons:
  // Horizontal step (x-offset for next column): HEX_WIDTH + GAP
  // Vertical step (y-offset for next row): HEX_HEIGHT * 0.75 + GAP
  // Horizontal stagger for odd/even rows: (HEX_WIDTH + GAP) / 2
  const positions = {
    hex1: { x: 0, y: 0, delay: 0.1 }, // Top-left
    hex2: { x: HEX_WIDTH + GAP, y: 0, delay: 0.3 }, // Top-right
    hex3: { x: (HEX_WIDTH + GAP) / 2, y: HEX_HEIGHT * 0.75 + GAP, delay: 0.5 }, // Bottom-left (staggered)
    hex4: {
      x: (HEX_WIDTH + GAP) / 2 + HEX_WIDTH + GAP,
      y: HEX_HEIGHT * 0.75 + GAP,
      delay: 0.7,
    }, // Bottom-right (staggered)
  };

  // Calculate container size based on the maximum extent of the hexagons
  const containerWidth = Math.max(
    positions.hex1.x + HEX_WIDTH,
    positions.hex2.x + HEX_WIDTH,
    positions.hex3.x + HEX_WIDTH,
    positions.hex4.x + HEX_WIDTH,
  );
  const containerHeight = Math.max(
    positions.hex1.y + HEX_HEIGHT,
    positions.hex2.y + HEX_HEIGHT,
    positions.hex3.y + HEX_HEIGHT,
    positions.hex4.y + HEX_HEIGHT,
  );
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-12">
      <div
        className="relative"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
        }}
      >
        <HexagonCard
          x={positions.hex1.x}
          y={positions.hex1.y}
          delay={positions.hex1.delay}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Icon name={item.icon} />
          </motion.div>
        </HexagonCard>
      </div>
    </div>
  );
};
