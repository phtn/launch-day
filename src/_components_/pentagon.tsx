import { Icon, type IconName } from "@/lib/icons";
import type { PropsWithChildren, ReactNode } from "react";

interface PentagonProps {
  icon: IconName;
  href: string;
}

const TagContent = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-center size-full">{children}</div>
);

export const Pentagon = ({ icon }: PentagonProps) => {
  return (
    <button className="pentagox group relative flex w-24 cursor-pointer items-center justify-center overflow-hidden rounded-sm bg-transparent p-px transition-all duration-1000 ease-in hover:bg-[#f9c97c]">
      <div className="scale-80 absolute h-px w-full rotate-[18deg] bg-[#d9be94]/40 opacity-60 blur transition-all duration-[3s] ease-out group-hover:h-14 group-hover:rotate-[275deg] group-hover:scale-150" />
      <div className="absolute h-1 w-full rotate-[155deg] scale-125 bg-teal-200/60 opacity-0 blur-xl transition-all delay-500 duration-[3.5s] ease-out group-hover:h-4 group-hover:rotate-[450deg] group-hover:scale-[300%] group-hover:opacity-40" />
      <div className="pentagox h-[calc(100%-0.5px)] group-active:opacity-20 group-active:scale-80 w-24 rounded-sm bg-transparent px-2.5 py-2 transition-all duration-[1s] ease-in">
        <TagContent>
          <Icon
            name={icon}
            strokeWidth={0}
            className="group-hover:text-black transition-all duration-[1.5s] group-hover:scale-80"
          />
        </TagContent>
      </div>
    </button>
  );
};

// interface TagProps {
//   icon: IconName;
// }

// const TagContent = ({ children }: { children: ReactNode }) => (
//   <div className="flex items-center justify-center size-full">
//     {children}
//   </div>
// );

export const Pentagram = ({ children }: PropsWithChildren) => {
  return (
    <div className="pentagon group relative flex w-24 cursor-pointer items-center justify-center overflow-hidden bg-transparent p-px transition-all duration-1000 ease-in hover:bg-orange-200/40">
      <div className="scale-80 absolute h-px w-full rotate-[18deg] bg-orange-200/60 opacity-10 blur transition-all duration-[3s] ease-out group-hover:h-14 group-hover:rotate-[450deg] group-hover:scale-150" />
      <div className="absolute h-1 w-full rotate-[155deg] scale-125 bg-orange-100 opacity-0 blur transition-all delay-500 duration-[3.5s] ease-in group-hover:h-4 group-hover:rotate-[450deg] group-hover:scale-150 group-hover:opacity-20" />
      <div className="pentagon h-[calc(100%-0.5px)] w-24 px-2.5 pt-6 transition-all duration-[2s] ease-in group-hover:bg-black/40">
        {children}
      </div>
    </div>
  );
};

// const Pentagox = ({ icon }: TagProps) => {
//   return (
//     <button className="pentagox group relative flex w-16 cursor-pointer items-center justify-center overflow-hidden rounded-sm bg-transparent p-px transition-all duration-1000 ease-in hover:bg-[#f9c97c]">
//       <div className="scale-80 absolute h-px w-full rotate-[18deg] bg-[#d9be94] opacity-100 blur transition-all duration-[3s] ease-out group-hover:h-14 group-hover:rotate-[275deg] group-hover:scale-150" />
//       <div className="absolute h-1 w-full rotate-[155deg] scale-125 bg-teal-100 opacity-0 blur-xl transition-all delay-500 duration-[3.5s] ease-out group-hover:h-4 group-hover:rotate-[450deg] group-hover:scale-[300%] group-hover:opacity-100" />
//       <div className="pentagox h-[calc(100%-0.5px)] group-active:opacity-60 group-active:scale-80 w-24 rounded-sm bg-transparent px-2.5 py-2 transition-all duration-[0.3s] ease-in">
//         <TagContent>
//           <Icon
//             name={icon}
//             className="group-hover:text-black transition-colors duration-[1.5s] group-hover:scale-90"
//           />
//         </TagContent>
//       </div>
//     </button>
//   );
// };

// export const Rows = () => (
//   <div className="flex flex-col gap-8">
//     <div className="size-96 grid grid-rows-3">
//       <div className="bg-slate-800 size-full grid grid-cols-2">
//         <div className="size-full flex items-center justify-center">
//           <Pentagon icon="calendar-outline" />
//         </div>
//       </div>
//       <div className="bg-gray-500 size-full grid grid-cols-2">
//         <div className="size-full flex items-center justify-center">
//           <Pentagon icon="share" />
//         </div>
//       </div>
//       <div className="bg-black size-full grid grid-cols-2">
//         <div className="size-full flex items-center justify-center">
//           <Pentagox icon="energy" />
//         </div>
//       </div>
//     </div>
//   </div>
// );
