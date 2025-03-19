import Image from "next/image";

export const BlastZone = () => {
  return (
    <div className="absolute flex w-full pointer-events-none left-0 bottom-0 items-end overflow-clip">
      <div className="grid h-full w-full grid-cols-12">
        <div className="col-span-3 flex h-full w-full items-end justify-start">
          <Image
            alt="left-outer-blast"
            src="/svg/left_outer_blast.svg"
            width={0}
            height={0}
            loading="lazy"
            className="relative -bottom-0 -left-0 h-56 w-auto select-none"
          />
        </div>
        <div className="col-span-5 flex h-full w-full items-end overflow-x-visible">
          <Image
            alt="center-outer-blast"
            src="/svg/center_outer_blast.svg"
            width={800}
            height={400}
            loading="lazy"
            className="relative -bottom-8 -left-14 h-40 w-auto select-none antialiased"
          />
        </div>
        <div className="col-span-4 flex h-full w-full items-end overflow-auto">
          <Image
            alt="right-outer-blast"
            src="/svg/right_outer_blast.svg"
            width={0}
            height={0}
            loading="lazy"
            className="relative -bottom-0 right-0 h-auto w-full select-none"
          />
        </div>
      </div>
    </div>
  );
};
