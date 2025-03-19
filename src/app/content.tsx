import { BlastZone } from "@/_components_/blast-zone";
import { Starlink } from "@/_components_/starlink";
import { StarshipSuperHeavy } from "@/_components_/starship";
import { cn } from "@/lib/utils";

export const Content = ({ theme }: { theme: string }) => {
  return (
    <main className={cn("w-full bg-background md:pt-20 pt-12", theme)}>
      <div className="w-screen grid grid-cols-7 gap-4 h-[calc(100vh-80px)] md:h-[calc(100vh-112px)]">
        <div className="col-span-1"></div>
        <StarshipSuperHeavy />
        <Starlink />
      </div>
      <BlastZone />
    </main>
  );
};
