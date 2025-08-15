"use client";

import { StarlinkData } from "@/app/types";
import { Icon } from "@/lib/icons";
import { HyperList } from "@/lib/ui/hyperlist";
import Link from "next/link";
import { memo } from "react";
import { HyperHex } from "./hyperhex";

export const Starlink = () => {
  return (
    <div className="md:col-span-7 col-span-8 size-full flex items-center justify-center">
      <div className="relative w-full h-full overflow-x-scroll">
        <div className="md:h-20 w-full"></div>
        <HyperList
          keyId="id"
          delay={1.15}
          direction="up"
          component={HeatTile}
          data={socmeds.slice(0, 3)}
          container="h-px overflow-visible  flex"
        />
        <HyperList
          delay={0.6}
          keyId="id"
          direction="up"
          component={HeatTile}
          data={socmeds.slice(3, 6)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          delay={0.8}
          keyId="id"
          direction="up"
          component={HeatTile}
          data={socmeds.slice(6, 9)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          delay={1.3}
          keyId="id"
          direction="up"
          component={HeatTile}
          data={socmeds.slice(9, 12)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          delay={0.25}
          keyId="id"
          direction="up"
          component={HeatTile}
          data={socmeds.slice(12)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={2.15}
          direction="up"
          component={HeatTile}
          data={backends.slice(0, 3)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={2.45}
          direction="up"
          component={HeatTile}
          data={backends.slice(3, 6)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={2.25}
          direction="up"
          component={HeatTile}
          data={backends.slice(6)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={3.35}
          direction="up"
          component={HeatTile}
          data={frontends.slice(0, 3)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={3.15}
          direction="up"
          component={HeatTile}
          data={frontends.slice(3, 6)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={3.55}
          direction="up"
          component={HeatTile}
          data={frontends.slice(6, 10)}
          container="h-px overflow-visible flex"
        />
        <HyperList
          keyId="id"
          delay={3.25}
          direction="up"
          component={HeatTile}
          data={frontends.slice(10)}
          container="h-px overflow-visible flex"
        />
      </div>
    </div>
  );
};

const HeatTile = memo((item: StarlinkData) => {
  return (
    <Link
      className="group/tile"
      href={item.href}
      target="_blank"
      title={item.description}
    >
      <HyperHex posX={item.posX} posY={item.posY}>
        <Icon name={item.icon} className="size-7 text-zinc-800" solid />
      </HyperHex>
    </Link>
  );
});

HeatTile.displayName = "HeatTile";

const socmeds: StarlinkData[] = [
  {
    id: 0,
    label: "x.com",
    description: "Social media platform for real-time updates and discussions",
    href: "https://x.com",
    icon: "twitter-x",
    posX: 101,
    posY: 98,
  },
  {
    id: 1,
    label: "youtube",
    description: "Video sharing and streaming platform",
    href: "https://youtube.com",
    icon: "youtube",
    posX: 180,
    posY: 98,
  },
  {
    id: 2,
    label: "github",
    description: "Code hosting and version control platform",
    href: "https://github.com",
    icon: "github",
    posX: 259,
    posY: 98,
  },
  {
    id: 3,
    label: "coderabbit",
    description: "AI-powered code review assistant",
    href: "https://coderabbit.ai",
    icon: "coderabbit",
    posX: 151,
    posY: 124,
  },
  {
    id: 4,
    label: "c.ai",
    description: "Character-based AI chat platform",
    href: "https://character.ai/",
    icon: "catgirl",
    posX: 230,
    posY: 124,
  },
  {
    id: 5,
    label: "box",
    description: "Cloud storage and file sharing service",
    href: "https://app.box.com/folder/0",
    icon: "box-dot-com",
    posX: 309,
    posY: 124,
  },
  {
    id: 6,
    label: "claude",
    description: "AI assistant by Anthropic for helpful conversations",
    href: "https://claude.ai",
    icon: "claude",
    posX: 101,
    posY: 150,
  },
  {
    id: 7,
    label: "chatgpt",
    description: "OpenAI's conversational AI assistant",
    href: "https://chatgpt.com",
    icon: "openai",
    posX: 180,
    posY: 150,
  },
  {
    id: 8,
    label: "grok",
    description: "X's AI assistant with real-time information",
    href: "https://grok.com",
    icon: "grok",
    posX: 259,
    posY: 150,
  },
  {
    id: 9,
    label: "t3",
    description: "Type-safe full-stack web development stack",
    href: "https://t3.chat",
    icon: "t3",
    posX: 151,
    posY: 176,
  },
  {
    id: 10,
    label: "phind",
    description: "AI-powered search engine for developers",
    href: "https://www.phind.com/",
    icon: "sparkle",
    posX: 230,
    posY: 176,
  },
  {
    id: 11,
    label: "perplexity",
    description: "AI-powered research and answer engine",
    href: "https://www.perplexity.ai/",
    icon: "perplexity",
    posX: 309,
    posY: 176,
  },
  {
    id: 12,
    label: "mdn",
    description: "Mozilla Developer Network - web development docs",
    href: "https://developer.mozilla.org/en-US/",
    icon: "mdn",
    posX: 401,
    posY: 148,
  },
  {
    id: 13,
    label: "News",
    description: "Hacker News - tech news and discussions",
    href: "https://news.ycombinator.com/",
    icon: "ycombinator",
    posX: 429,
    posY: 176,
  },
];

const backends: StarlinkData[] = [
  {
    id: 0,
    label: "firebase",
    description: "Google's backend-as-a-service platform",
    href: "https://console.firebase.google.com/u/0/",
    icon: "firebase",
    posX: 151,
    posY: 300,
  },
  {
    id: 1,
    label: "convex",
    description: "Real-time backend for modern applications",
    href: "https://dashboard.convex.dev",
    icon: "cloud-lightning",
    posX: 230,
    posY: 300,
  },
  {
    id: 2,
    label: "doctl",
    description: "DigitalOcean cloud infrastructure platform",
    href: "https://cloud.digitalocean.com/",
    icon: "doctl",
    posX: 309,
    posY: 300,
  },
  {
    id: 3,
    label: "redis",
    description: "In-memory data structure store and cache",
    href: "https://cloud.redis.io/",
    icon: "redis",
    posX: 101,
    posY: 326,
  },
  {
    id: 4,
    label: "gcp",
    description: "Google Cloud Platform services",
    href: "https://console.cloud.google.com/",
    icon: "gcp",
    posX: 180,
    posY: 326,
  },
  {
    id: 5,
    label: "supabase",
    description: "Open source Firebase alternative with PostgreSQL",
    href: "https://supabase.com/dashboard/projects",
    icon: "supabase",
    posX: 259,
    posY: 326,
  },
  {
    id: 6,
    label: "v0",
    description: "AI-powered UI component generator by Vercel",
    href: "http://v0.dev",
    icon: "v0",
    posX: 151,
    posY: 352,
  },
  {
    id: 7,
    label: "3000",
    description: "Local development server (HTTP)",
    href: "http://localhost:3000",
    icon: "localhost",
    posX: 230,
    posY: 352,
  },
  {
    id: 8,
    label: "3000",
    description: "Local development server (HTTPS)",
    href: "https://localhost:3000",
    icon: "secured-server",
    posX: 309,
    posY: 352,
  },
  {
    id: 9,
    label: "3001",
    description: "Alternative local development server (HTTP)",
    href: "http://localhost:3001",
    icon: "localhost2",
    posX: 338,
    posY: 326,
  },
  {
    id: 10,
    label: "3001",
    description: "Alternative local development server (HTTPS)",
    href: "https://localhost:3001",
    icon: "secured-server",
    posX: 409,
    posY: 326,
  },
];

const frontends: StarlinkData[] = [
  {
    id: 0,
    label: "vercel",
    description: "Frontend deployment and hosting platform",
    href: "https://www.vercel.com/",
    icon: "vercel",
    posX: 151,
    posY: 500,
  },
  {
    id: 1,
    label: "shadcn",
    description: "React component library with Tailwind CSS",
    href: "https://ui.shadcn.com/",
    icon: "shadcn",
    posX: 230,
    posY: 500,
  },
  {
    id: 2,
    label: "nextui",
    description: "Beautiful React UI library with modern design",
    href: "https://nextui.org/",
    icon: "nextui",
    posX: 309,
    posY: 500,
  },
  {
    id: 3,
    label: "origin",
    description: "Premium UI components and templates",
    href: "https://originui.com/",
    icon: "origin",
    posX: 101,
    posY: 525,
  },
  {
    id: 4,
    label: "aceternity",
    description: "Modern UI components with stunning animations",
    href: "https://ui.aceternity.com/",
    icon: "map-arrow-up",
    posX: 180,
    posY: 525,
  },
  {
    id: 5,
    label: "magic",
    description: "React components with framer-motion animations",
    href: "https://magicui.design/",
    icon: "magic-wand",
    posX: 259,
    posY: 525,
  },
  {
    id: 6,
    label: "heroicons",
    description: "Beautiful hand-crafted SVG icons by Tailwind",
    href: "https://heroicons.com/",
    icon: "hero",
    posX: 151,
    posY: 552,
  },
  {
    id: 7,
    label: "lucide",
    description: "Simple and beautiful open source icon library",
    href: "https://lucide.dev/",
    icon: "lucide",
    posX: 230,
    posY: 552,
  },
  {
    id: 8,
    label: "dribbble",
    description: "Design inspiration and creative community",
    href: "https://dribbble.com/",
    icon: "dribbble",
    posX: 309,
    posY: 552,
  },
  {
    id: 9,
    label: "tailwind",
    description: "Utility-first CSS framework for rapid development",
    href: "https://tailwindcss.com/",
    icon: "tailwind",
    posX: 338,
    posY: 525,
  },
  {
    id: 10,
    label: "icones",
    description: "Icon explorer with over 150,000 open source icons",
    href: "https://icones.js.org/",
    icon: "info-outline",
    posX: 101,
    posY: 577,
  },
  {
    id: 11,
    label: "expo",
    description: "Platform for universal React applications",
    href: "https://docs.expo.dev/",
    icon: "expo",
    posX: 180,
    posY: 577,
  },
  {
    id: 12,
    label: "expo-icons",
    description: "Vector icon directory for Expo apps",
    href: "https://icons.expo.fyi/Index",
    icon: "expo-icons",
    posX: 259,
    posY: 577,
  },
];
