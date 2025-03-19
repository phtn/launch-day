import { StarlinkData } from "@/app/types";
import { Icon } from "@/lib/icons";
import Link from "next/link";
import { Pentagram } from "./pentagon";

export const Starlink = () => {
  return (
    <div className="col-span-4">
      <div className="space-y-8">
        <div className="flex items-center flex-wrap h-fit">
          {socmeds.map(renderItem)}
        </div>
        <div className="h-px border-b-[0.33px] border-zinc-800/60" />
        <div className="flex items-center flex-wrap h-fit">
          {frontends.map(renderItem)}
        </div>
        <div className="h-px border-b-[0.33px] border-zinc-800/60" />
        <div className="flex items-center flex-wrap h-fit">
          {backends.map(renderItem)}
        </div>
      </div>
    </div>
  );
};

const renderItem = ({ label, icon, href, id }: StarlinkData) => {
  return (
    <Link className="" href={href} target="_blank" key={id}>
      <div className="h-24 group/link w-32 flex items-center justify-center relative">
        <Pentagram>
          <p className="absolute tracking-wide text-xs uppercase group-hover/link:-translate-y-5 translate-y-0 transition-all duration-300 ease-out delay-75 opacity-0 group-hover/link:opacity-100">
            {label}
          </p>
          <Icon
            name={icon}
            className="stroke-0 text-zinc-400 group-hover/link:translate-y-0.5 translate-y-0 group-hover/link:text-orange-200 transition-all duration-300 group-hover/link:scale-80 ease-out"
          />
        </Pentagram>
      </div>
    </Link>
  );
};
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
