import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const Recreation = () => {
  const router = useRouter();

  const handleRouteToGames = useCallback(() => {
    router.push("/roulette");
  }, [router]);

  const handleRouteToPlay = useCallback(() => {
    router.push("/playground");
  }, [router]);
  return (
    <div className="col-span-2 relative py-8">
      <div className="md:ps-8 ps-2 -mt-2 md:-mt-3 space-x-4 relative z-10">
        <button
          onClick={handleRouteToGames}
          className="btn btn-solid md:w-56 w-12 relative md:left-4 left-2 bg-gray-600"
        >
          <span className="md:hidden leading-none text-2xl">⛒</span>
          <span className="hidden md:flex">KEEP OUT AREA</span>
        </button>
        <button
          onClick={handleRouteToPlay}
          className="btn btn-solid text-panel md:w-56 w-12 relative bg-orange-300 left-2 md:left-4"
        >
          <span className="md:hidden leading-none text-2xl">◙</span>
          <span className="hidden md:flex">NOT A PLAYGROUND</span>
        </button>
        <div role="tablist" className="tabs">
          <a role="tab" className="tab"></a>
        </div>
      </div>
    </div>
  );
};
