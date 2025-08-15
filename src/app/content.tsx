"use client";

import { BlastZone } from "@/_components_/blast-zone";
import { Starlink } from "@/_components_/starlink";
import { StarshipSuperHeavy } from "@/_components_/starship";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

export const Content = () => {
  return (
    <div className="w-screen h-screen">
      <div
        className={cn(
          "size-full flex items-center justify-center",
          "bg-gradient-to-t from-gray-900 from-5% via-gray-950 to-gray-950",
          "grid grid-cols-12",
        )}
      >
        <Sidebar />
        <StarshipSuperHeavy />
        <Starlink />
      </div>
      <BlastZone />
    </div>
  );
};
