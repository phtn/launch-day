"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Particles } from "./particles";
import { useEffect, useState } from "react";

export const StarshipSuperHeavy = () => {
  const [launch, setLaunch] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Timeout triggered");
      setLaunch(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full relative overflow-hidden h-[calc(100vh-80)] col-span-2 flex flex-col items-center">
      <Image
        alt="starship"
        src="/svg/starship.svg"
        width={0}
        height={0}
        className={cn(
          "aspect-auto translate-y-40 w-12 bg-background transition-all duration-[10s] ease-in-out",
          { "translate-y-0": launch },
        )}
      />
      <div
        className={cn(
          cn(
            "h-[50vh] translate-y-40 w-full border-gray-500 transition-all duration-[10s] ease-in-out",
            { "translate-y-0": launch },
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
            className="relative -top-1 h-[9vh] w-auto"
          />
          <div className="absolute -top-0.5 h-full w-[34px] rounded-t-[6px] border-gray-700 bg-gradient-to-b from-indigo-300/40 via-pink-200/20 to-transparent">
            <div className="absolute top-0 ml-0.5 h-1/2 w-[34px] animate-pulse rounded-t-[8px] bg-gradient-to-b from-indigo-200/20 via-amber-100/20 to-transparent" />
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
