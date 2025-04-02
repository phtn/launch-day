"use client";

import { BlastZone } from "@/_components_/blast-zone";
import { Starlink } from "@/_components_/starlink";
import { StarshipSuperHeavy } from "@/_components_/starship";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const Content = ({ theme }: { theme: string }) => {
  return (
    <main className={cn("w-full md:pt-20 pt-12", theme)}>
      <div className="w-screen grid grid-cols-8 gap-4 bg-gradient-to-t from-gray-900 from-5% via-gray-950 to-gray-950 h-[calc(100vh-80px)]">
        <Recreation />
        <StarshipSuperHeavy />
        <Starlink />
      </div>
      <BlastZone />
    </main>
  );
};

const Recreation = () => {
  const router = useRouter();
  const handleRouteToGames = useCallback(() => {
    router.push("/roulette");
  }, [router]);
  return (
    <div className="col-span-2">
      <div className="p-6">
        <button
          onClick={handleRouteToGames}
          className="btn sm btn-solid btn-xs btn-accent"
        >
          KEEP OUT AREA
        </button>
        <div role="tablist" className="tabs">
          <a role="tab" className="tab"></a>
        </div>
      </div>
    </div>
  );
};
