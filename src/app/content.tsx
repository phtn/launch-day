"use client";

import { BlastZone } from "@/_components_/blast-zone";
import { Recreation } from "@/_components_/recreation";
import { Starlink } from "@/_components_/starlink";
import { StarshipSuperHeavy } from "@/_components_/starship";
import { cn } from "@/lib/utils";

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
