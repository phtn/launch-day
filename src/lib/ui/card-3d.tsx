"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

const MouseEnterContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
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
  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center", containerClassName)}
        style={{
          perspective: "360px",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center relative transition-all duration-300 ease-[cubic-bezier(0,0.55,0.45,1)]",
            className,
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

interface Props {
  children: ReactNode;
  className?: string;
}
export const CardBody = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        "size-40 shrink-0 flex [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
    </div>
  );
};

type CardItemProps = {
  as?: "div" | "span" | "section" | "a" | "button" | "p";
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  href?: string;
  children?: ReactNode;
} & Omit<
  HTMLAttributes<
    | HTMLDivElement
    | HTMLAnchorElement
    | HTMLParagraphElement
    | HTMLButtonElement
    | HTMLSpanElement
  >,
  "className"
>;

export const CardItem = forwardRef<HTMLDivElement, CardItemProps>(
  (
    {
      as: Element,
      children,
      className,
      translateX = 3,
      translateY = 3,
      translateZ = 0,
      rotateX = 0,
      rotateY = 0,
      rotateZ = 0,
      ...rest
    },
    ref,
  ) => {
    const [isMouseEntered] = useMouseEnter();

    useEffect(() => {
      const handleAnimations = () => {
        if (!ref || !("current" in ref)) return;
        const element = ref.current;
        if (!element) return;

        if (isMouseEntered) {
          element.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        } else {
          element.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
        }
      };
      handleAnimations();
    }, [
      ref,
      isMouseEntered,
      rotateX,
      rotateY,
      translateX,
      rotateZ,
      translateY,
      translateZ,
    ]);
    if (!Element) return;

    return (
      <Element
        className={cn(
          "w-fit transition-all duration-1000 ease-linear",
          className,
        )}
        {...rest}
      >
        {children}
      </Element>
    );
  },
);

CardItem.displayName = "CardItem";

// Create a hook to use the context
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
