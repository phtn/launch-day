import Image from "next/image";
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
      <Image
        alt="prime"
        src={"/chicks/prime.png"}
        width={0}
        height={0}
        className="md:h-64 h-24 w-auto relative z-[50]"
        unoptimized
      />
      <div className="md:ps-8 ps-2 -mt-2 md:-mt-3 space-x-4 relative z-10">
        <button
          onClick={handleRouteToGames}
          className="btn px-8 sm btn-solid relative left-4 btn-xs bg-gray-600"
        >
          <span className="md:flex">KEEP</span> OUT{" "}
          <span className="hidden md:flex">AREA</span>
        </button>
        <button
          onClick={handleRouteToPlay}
          className="btn btn-solid text-panel relative px-4 btn-xs hidden md:flex bg-orange-400"
        >
          <span className="">NOT A PLAYGROUND</span>
        </button>
        <div role="tablist" className="tabs">
          <a role="tab" className="tab"></a>
        </div>
      </div>
    </div>
  );
};
