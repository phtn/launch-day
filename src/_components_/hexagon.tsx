import { HEX_HEIGHT, HEX_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

interface Props {
  x: number;
  y: number;
  delay?: number;
  children?: ReactNode;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
}
export const HexagonCard = ({
  children,
  delay = 0,
  translateX = 3,
  translateY = 3,
  translateZ = 2,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  x,
  y,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsMouseEntered(true);
    if (!containerRef.current) return;
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  useEffect(() => {
    const handleAnimations = () => {
      if (!containerRef || !("current" in containerRef)) return;
      const element = containerRef.current;
      if (!element) return;

      if (isMouseEntered) {
        element.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
      } else {
        element.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
      }
    };
    handleAnimations();
  }, [
    containerRef,
    isMouseEntered,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
  ]);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0, y: 30 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -2, 0], // Floating animation
      }}
      transition={{
        scale: { duration: 0.6, delay: delay + 0.2, ease: "easeOut" },
        opacity: { duration: 0.6, delay: delay + 0.2, ease: "easeOut" },
        y: {
          duration: 8,
          // repeat: Number.POSITIVE_INFINITY,
          // ease: "easeInOut",
          delay: delay + 0.8,
        },
      }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      style={{
        filter:
          "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.08)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.05))",
        left: `${x}px`,
        top: `${y}px`,
        perspective: "360px",
      }}
    >
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "size-full flex items-center justify-center absolute transition-all duration-1000 ease-linear",
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
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
            className={cn("group-hover/tile:opacity-90 fill-amber-100")}
          />
        </svg>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
};
