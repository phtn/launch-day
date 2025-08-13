"use client";

import { BlastZone } from "@/_components_/blast-zone";
import { Starlink } from "@/_components_/starlink";
import { StarshipSuperHeavy } from "@/_components_/starship";
import { cn } from "@/lib/utils";

export const Content = () => {
  // const root = useRef<HTMLDivElement>(null);
  // const scope = useRef<Scope>(null);
  // useEffect(() => {
  //   if (!root.current) return;

  //   scope.current = createScope({ root: root.current }).add(() => {
  //     // Main pulsing animation
  //     animate(".sqr", {
  //       scale: [{ from: 0, to: 1.1 }, { to: 0.0 }],
  //       boxShadow: [
  //         { value: "0 0 0px tomato" },
  //         { value: "0 0 20px rgba(156, 163, 175, 0.6)" },
  //         { value: "0 0 0px rgba(156, 163, 175, 0.3)" },
  //       ],
  //       loopDelay: 3000,
  //       delay: stagger(100, {
  //         grid: [8, 4],
  //         from: utils.random(0, 8),
  //       }),
  //       duration: 4000,
  //       loop: true,
  //       autoplay: true,
  //     });
  //   });

  //   return () => scope.current?.revert();
  // }, []);
  return (
    <div className="w-screen h-screen">
      <div
        className={cn(
          "size-full flex items-center justify-center",
          "bg-gradient-to-t from-gray-900 from-5% via-gray-950 to-gray-950",
          "grid grid-cols-12",
        )}
      >
        <div className="col-span-3 size-full flex items-center justify-center"></div>
        <StarshipSuperHeavy />
        <Starlink />
      </div>
      <BlastZone />
    </div>
  );
};
