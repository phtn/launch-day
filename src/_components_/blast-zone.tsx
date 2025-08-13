import Image from "next/image";

export const BlastZone = () => {
  return (
    <div className="absolute flex w-full pointer-events-none left-0 bottom-0 items-end overflow-clip">
      <div className="grid h-full w-full grid-cols-12">
        <div className="relative col-span-2 flex h-full w-full -left-0 items-end justify-start">
          <Image
            alt="left-outer-blast"
            src="/svg/left_outer_blast.svg"
            width={0}
            height={0}
            loading="lazy"
            className="relative scale-125 bottom-0 h-56 w-auto select-none"
          />
        </div>
        <div className="relative z-10 col-span-5 flex h-full w-full items-end overflow-x-visible">
          <Image
            alt="center-outer-blast"
            src="/svg/center_outer_blast.svg"
            width={800}
            height={400}
            loading="lazy"
            className="relative -bottom-8 -left-12 h-40 w-full select-none antialiased"
          />
        </div>
        <div className="col-span-4 flex h-full w-full relative z-20 items-end overflow-clip">
          <Image
            alt="right-outer-blast"
            src="/svg/right_outer_blast.svg"
            width={0}
            height={0}
            loading="lazy"
            className="relative -bottom-0 right-3 z-40 h-auto w-full select-none"
          />
        </div>
      </div>
    </div>
  );
};
