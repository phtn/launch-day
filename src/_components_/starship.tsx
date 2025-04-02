"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Particles } from "./particles";
import { useEffect, useState } from "react";

export const StarshipSuperHeavy = () => {
  const [launch, setLaunch] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLaunch(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full relative overflow-hidden h-[calc(100vh-80)] col-span-1 flex flex-col items-center">
      <Image
        alt="starship"
        src="/svg/starship.svg"
        width={0}
        height={0}
        className={cn(
          "aspect-auto translate-y-[48rem] w-12 bg-background transition-all duration-[10s] ease-in-out",
          { "translate-y-0": launch },
        )}
      />
      <div
        className={cn(
          cn(
            "h-[50vh] translate-y-[48rem] opacity-0 w-full border-gray-500 transition-all duration-[10s] ease-in-out",
            { "translate-y-0": launch, "opacity-100": launch },
          ),
        )}
      >
        <div className="relative z-[50] col-span-1 flex h-full w-full items-start justify-center border-green-500">
          <Image
            alt="machd"
            src={"/svg/business-end.svg"}
            width={0}
            height={0}
            loading="lazy"
            unoptimized
            className="relative -top-[4px] left-[0.75px] h-[12vh] w-auto"
          />
          <div className="absolute -top-[1.5px] h-full md:w-[34px] w-[25px] rounded-t-lg border-gray-700 bg-gradient-to-b from-blue-300/40 via-pink-200/15 to-transparent">
            <div className="absolute top-0 h-1/2 md:w-[34px] w-[26px] animate-pulse rounded-t-[4px] bg-gradient-to-b from-indigo-300/20 via-pink-300/20 to-transparent" />
            <Particles
              className="absolute inset-0 top-0 h-1/4 select-none"
              quantity={20}
              ease={20}
              refresh
            />
          </div>
        </div>

        <div className="col-span-3 flex h-full w-full items-end"></div>
      </div>
    </div>
  );
};
