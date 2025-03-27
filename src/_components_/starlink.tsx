"use client";

import { StarlinkData } from "@/app/types";
import { Icon } from "@/lib/icons";
import Link from "next/link";
import { Pentagram } from "./pentagon";
import { HyperList } from "@/lib/ui/hyperlist";
import { useCallback } from "react";

export const Starlink = () => {
  return (
    <div className="col-span-5 w-full">
      <div className="md:flex w-fit grid grid-cols-4 md:grid-cols-6 md:space-y-8 md:gap-8 h-[calc(100vh-80px)] pt-10 overflow-y-scroll md:overflow-hidden">
        <ListColumn title="socmed" data={socmeds} />
        <ListColumn title="frontend" delay={0.2} data={frontends} />
        <ListColumn title="backend" delay={0.6} data={backends} />
        {/* <div className="md:flex col-span-4 grid grid-cols-3 items-center w-full flex-wrap h-fit">
          {frontends.map(renderItem)}
        </div>
        <div className="md:flex col-span-4 grid grid-cols-3 items-center w-full flex-wrap h-fit">
          {backends.map(renderItem)}
        </div> */}
      </div>
    </div>
  );
};

interface ListColumnProps {
  data: StarlinkData[];
  title?: string;
  delay?: number;
}

const ListColumn = ({ data, title = "", delay = 0 }: ListColumnProps) => {
  const titleList = title.split("").map((t, index) => ({ t, id: index }));
  const Component = useCallback(
    (el: { t: string; id: number }) => (
      <span className="tracking-widest" key={el.id}>
        {el.t}
      </span>
    ),
    [],
  );
  return (
    <div className="relative group/column col-span-5 pb-28 md:pb-40 pt-4">
      <HyperList
        direction="left"
        data={titleList}
        component={Component}
        delay={delay}
        container="text-[10px] flex items-center shadow-md px-1 py-0.5 group-hover/column:border-[0.33px] group-hover/column:text-orange-100 group-hover/column:bg-zinc-600 border-zinc-400 uppercase tracking-widest opacity-30 absolute rounded-sm top-1 left-3 group-hover/column:opacity-100"
      />
      <HyperList
        data={data}
        component={ListItem}
        delay={delay}
        keyId="id"
        container="md:flex w-fit overflow-y-scroll pb-28 h-[calc(100vh-80px)] hover:bg-gradient-to-b from-zinc-400/10 via-zinc-400/5 group-hover/column:border-t-[0.33px] border-zinc-500 to-transparent rounded-t-xl h-[calc(100vh-80px)] overflow-y-scroll col-span-4 grid grid-cols-3 items-center flex-wrap"
      />
    </div>
  );
};

const ListItem = (item: StarlinkData) => (
  <Link className="" href={item.href} target="_blank">
    <div className="h-24 group/link w-28 flex items-center justify-center relative">
      <Pentagram>
        <p className="absolute tracking-wide text-xs uppercase group-hover/link:-translate-y-5 translate-y-0 transition-all duration-300 ease-out delay-75 opacity-0 group-hover/link:opacity-100">
          {item.label}
        </p>
        <Icon
          name={item.icon}
          className="stroke-0 text-zinc-400 group-hover/link:translate-y-0.5 translate-y-0 group-hover/link:text-orange-200 transition-all duration-300 group-hover/link:scale-80 ease-out"
        />
      </Pentagram>
    </div>
  </Link>
);
const socmeds: StarlinkData[] = [
  {
    id: 0,
    label: "x.com",
    description: "x",
    href: "https://x.com",
    icon: "twitter-x",
  },
  {
    id: 1,
    label: "youtube",
    description: "youtube",
    href: "https://youtube.com",
    icon: "youtube",
  },
  {
    id: 2,
    label: "github",
    description: "github",
    href: "https://github.com",
    icon: "github",
  },
  {
    id: 3,
    label: "coderabbit",
    description: "coderabbit",
    href: "https://coderabbit.ai",
    icon: "coderabbit",
  },
  {
    id: 4,
    label: "News",
    description: "Hacker News Ycombinator",
    href: "https://news.ycombinator.com/",
    icon: "ycombinator",
  },
  {
    id: 5,
    label: "mdn",
    description: "mdn",
    href: "https://developer.mozilla.org/en-US/",
    icon: "mdn",
  },
  {
    id: 6,
    label: "claude",
    description: "claude",
    href: "https://claude.ai",
    icon: "claude",
  },

  {
    id: 7,
    label: "chatgpt",
    description: "chatgpt",
    href: "https://chatgpt.com",
    icon: "openai",
  },
  {
    id: 8,
    label: "grok",
    description: "grok",
    href: "https://grok.com",
    icon: "grok",
  },
  {
    id: 9,
    label: "t3",
    description: "t3",
    href: "https://t3.chat",
    icon: "t3",
  },
  {
    id: 10,
    label: "phind",
    description: "phind",
    href: "https://www.phind.com/",
    icon: "sparkle",
  },
  {
    id: 11,
    label: "perplexity",
    description: "perplexity",
    href: "https://www.perplexity.ai/",
    icon: "perplexity",
  },
];

const backends: StarlinkData[] = [
  {
    id: 0,
    label: "firebase",
    description: "firebase",
    href: "https://console.firebase.google.com/u/0/",
    icon: "firebase",
  },
  {
    id: 1,
    label: "convex",
    description: "convex.dev",
    href: "https://dashboard.convex.dev",
    icon: "cloud-lightning",
  },
  {
    id: 2,
    label: "doctl",
    description: "doctl",
    href: "https://cloud.digitalocean.com/",
    icon: "doctl",
  },
  {
    id: 3,
    label: "redis",
    description: "redis",
    href: "https://cloud.redis.io/",
    icon: "redis",
  },
  {
    id: 4,
    label: "gcp",
    description: "google cloud platform",
    href: "https://console.cloud.google.com/",
    icon: "gcp",
  },
  {
    id: 5,
    label: "supabase",
    description: "supabase",
    href: "https://supabase.com/dashboard/projects",
    icon: "supabase",
  },
  {
    id: 6,
    label: "v0",
    description: "v0.dev",
    href: "http://v0.dev",
    icon: "v0",
  },
  {
    id: 7,
    label: "3000",
    description: "localhost",
    href: "http://localhost:3000",
    icon: "localhost",
  },
  {
    id: 8,
    label: "3001",
    description: "localhost",
    href: "http://localhost:3001",
    icon: "localhost2",
  },
];

const frontends: StarlinkData[] = [
  {
    id: 0,
    label: "vercel",
    description: "vercel",
    href: "https://www.vercel.com/",
    icon: "vercel",
  },
  {
    id: 1,
    label: "shadcn",
    description: "shadcn",
    href: "https://ui.shadcn.com/",
    icon: "shadcn",
  },
  {
    id: 2,
    label: "nextui",
    description: "nextui",
    href: "https://nextui.org/",
    icon: "nextui",
  },
  {
    id: 3,
    label: "origin",
    description: "originui.com",
    href: "https://originui.com/",
    icon: "origin",
  },
  {
    id: 4,
    label: "aceternity",
    description: "ui.aceternity",
    href: "https://ui.aceternity.com/",
    icon: "map-arrow-up",
  },
  {
    id: 5,
    label: "magic",
    description: "magicui.design",
    href: "https://magicui.design/",
    icon: "magic-wand",
  },
  {
    id: 6,
    label: "heroicons",
    description: "heroicons.com",
    href: "https://heroicons.com/",
    icon: "hero",
  },
  {
    id: 7,
    label: "lucide",
    description: "lucide.dev",
    href: "https://lucide.dev/",
    icon: "lucide",
  },
  {
    id: 8,
    label: "dribbble",
    description: "dribbble.com",
    href: "https://dribbble.com/",
    icon: "dribbble",
  },
  {
    id: 9,
    label: "tailwind",
    description: "tailwindcss",
    href: "https://tailwindcss.com/",
    icon: "tailwind",
  },
  {
    id: 10,
    label: "icones",
    description: "icones",
    href: "https://icones.js.org/",
    icon: "info-outline",
  },
];
