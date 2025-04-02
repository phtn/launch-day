import { ClassName } from "@/app/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface BrandProps {
  className?: ClassName;
  title?: string;
}

export const Brand = ({ className, title }: BrandProps) => {
  const [a, b] = title?.split(" ") || ["", ""];
  return (
    <Link
      href={"/"}
      className={cn("flex items-center gap-2 md:gap-6", className)}
    >
      <Image
        alt="launch-day"
        src={"/svg/logomark.svg"}
        width={0}
        height={0}
        className="size-4 md:size-8"
      />
      <h1 className="text-lg md:text-2xl lg:text-3xl font-exo uppercase">
        <span className="font-bold tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-tr from-indigo-300 via-orange-200 to-orange-300/40">
          {a}
        </span>
        <span className="not-italic font-black tracking-tight drop-shadow-lg text-gray-400">
          {b}
        </span>
      </h1>
    </Link>
  );
};
