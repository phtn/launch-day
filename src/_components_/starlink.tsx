'use client'

import { StarlinkData } from '@/app/types'
import { Icon } from '@/lib/icons'
import { GAP, HEX_HEIGHT, HEX_WIDTH } from '@/lib/constants'
import { HyperList } from '@/lib/ui/hyperlist'
import Link from 'next/link'
import { memo } from 'react'
import { backends } from './backends'
import { HyperHex } from './hyperhex'

type StarlinkTile = StarlinkData & {
  tileId: string
  posX: number
  posY: number
}

const HEX_ROW_STEP = (HEX_HEIGHT + GAP) / 2
const HEX_X_GAP = 18
const HEX_COL_STEP = HEX_WIDTH + HEX_X_GAP
const HEX_STAGGER_OFFSET = HEX_COL_STEP / 2

const makeHexTiles = (
  prefix: string,
  items: StarlinkData[],
  rows: number[][],
  origin: { x: number; y: number },
  offsetRows: 'even' | 'odd'
): StarlinkTile[] => {
  const itemById = new Map(items.map((item) => [item.id, item]))

  return rows.flatMap((row, rowIndex) => {
    const isOffsetRow =
      offsetRows === 'even' ? rowIndex % 2 === 0 : rowIndex % 2 === 1

    return row.map((id, colIndex) => {
      const item = itemById.get(id)

      if (!item) {
        throw new Error(`Missing ${prefix} tile with id ${id}`)
      }

      return {
        ...item,
        tileId: `${prefix}-${item.id}`,
        posX: origin.x + colIndex * HEX_COL_STEP + (isOffsetRow ? HEX_STAGGER_OFFSET : 0),
        posY: origin.y + rowIndex * HEX_ROW_STEP
      }
    })
  })
}

export const Starlink = () => {
  return (
    <div className='md:col-span-7 col-span-8 size-full flex items-center justify-center'>
      <div className='relative w-full h-full overflow-x-scroll'>
        <div className='md:h-4 w-full'></div>
        <HyperList
          keyId='tileId'
          delay={1.15}
          direction='up'
          component={HeatTile}
          data={tiles}
          max={tiles.length}
          container='relative h-full min-w-[560px] overflow-visible'
          itemStyle='absolute left-0 top-0 size-0 overflow-visible'
        />
      </div>
    </div>
  )
}

const HeatTile = memo((item: StarlinkTile) => {
  return (
    <Link
      className='group/tile absolute'
      href={item.href}
      target='_blank'
      title={item.label}
      style={{
        left: `${item.posX}px`,
        top: `${item.posY}px`
      }}>
      <HyperHex posX={0} posY={0}>
        <Icon name={item.icon} className='size-7 text-zinc-800' solid />
      </HyperHex>
    </Link>
  )
})

HeatTile.displayName = 'HeatTile'

const socmeds: StarlinkData[] = [
  {
    id: 0,
    label: 'x.com',
    description: 'Social media platform for real-time updates and discussions',
    href: 'https://x.com',
    icon: 'twitter-x',
    posX: 101,
    posY: 98
  },
  {
    id: 1,
    label: 'youtube',
    description: 'Video sharing and streaming platform',
    href: 'https://youtube.com',
    icon: 'youtube',
    posX: 180,
    posY: 98
  },
  {
    id: 2,
    label: 'github',
    description: 'Code hosting and version control platform',
    href: 'https://github.com',
    icon: 'github',
    posX: 259,
    posY: 98
  },
  {
    id: 3,
    label: 'coderabbit',
    description: 'AI-powered code review assistant',
    href: 'https://coderabbit.ai',
    icon: 'coderabbit',
    posX: 151,
    posY: 124
  },
  {
    id: 4,
    label: 'c.ai',
    description: 'Character-based AI chat platform',
    href: 'https://character.ai/',
    icon: 'catgirl',
    posX: 230,
    posY: 124
  },
  {
    id: 5,
    label: 'box',
    description: 'Cloud storage and file sharing service',
    href: 'https://app.box.com/folder/0',
    icon: 'box-dot-com',
    posX: 309,
    posY: 124
  },
  {
    id: 6,
    label: 'claude',
    description: 'AI assistant by Anthropic for helpful conversations',
    href: 'https://claude.ai',
    icon: 'claude',
    posX: 101,
    posY: 150
  },
  {
    id: 7,
    label: 'chatgpt',
    description: "OpenAI's conversational AI assistant",
    href: 'https://chatgpt.com',
    icon: 'openai',
    posX: 180,
    posY: 150
  },
  {
    id: 8,
    label: 'grok',
    description: "X's AI assistant with real-time information",
    href: 'https://grok.com',
    icon: 'grok',
    posX: 259,
    posY: 150
  },
  {
    id: 9,
    label: 't3',
    description: 'Type-safe full-stack web development stack',
    href: 'https://t3.chat',
    icon: 't3',
    posX: 151,
    posY: 176
  },
  {
    id: 10,
    label: 'phind',
    description: 'AI-powered search engine for developers',
    href: 'https://www.phind.com/',
    icon: 'sparkle',
    posX: 230,
    posY: 176
  },
  {
    id: 11,
    label: 'perplexity',
    description: 'AI-powered research and answer engine',
    href: 'https://www.perplexity.ai/',
    icon: 'perplexity',
    posX: 309,
    posY: 176
  },
  {
    id: 12,
    label: 'mdn',
    description: 'Mozilla Developer Network - web development docs',
    href: 'https://developer.mozilla.org/en-US/',
    icon: 'mdn',
    posX: 401,
    posY: 148
  },
  {
    id: 13,
    label: 'News',
    description: 'Hacker News - tech news and discussions',
    href: 'https://news.ycombinator.com/',
    icon: 'ycombinator',
    posX: 429,
    posY: 176
  }
]

const frontends: StarlinkData[] = [
  {
    id: 0,
    label: 'vercel',
    description: 'Frontend deployment and hosting platform',
    href: 'https://www.vercel.com/',
    icon: 'vercel',
    posX: 151,
    posY: 500
  },
  {
    id: 1,
    label: 'shadcn',
    description: 'React component library with Tailwind CSS',
    href: 'https://ui.shadcn.com/',
    icon: 'shadcn',
    posX: 230,
    posY: 500
  },
  {
    id: 2,
    label: 'nextui',
    description: 'Beautiful React UI library with modern design',
    href: 'https://nextui.org/',
    icon: 'nextui',
    posX: 309,
    posY: 500
  },
  {
    id: 3,
    label: 'origin',
    description: 'Premium UI components and templates',
    href: 'https://originui.com/',
    icon: 'origin',
    posX: 101,
    posY: 525
  },
  {
    id: 4,
    label: 'aceternity',
    description: 'Modern UI components with stunning animations',
    href: 'https://ui.aceternity.com/',
    icon: 'map-arrow-up',
    posX: 180,
    posY: 525
  },
  {
    id: 5,
    label: 'magic',
    description: 'React components with framer-motion animations',
    href: 'https://magicui.design/',
    icon: 'magic-wand',
    posX: 259,
    posY: 525
  },
  {
    id: 6,
    label: 'heroicons',
    description: 'Beautiful hand-crafted SVG icons by Tailwind',
    href: 'https://heroicons.com/',
    icon: 'hero',
    posX: 151,
    posY: 552
  },
  {
    id: 7,
    label: 'lucide',
    description: 'Simple and beautiful open source icon library',
    href: 'https://lucide.dev/',
    icon: 'lucide',
    posX: 230,
    posY: 552
  },
  {
    id: 8,
    label: 'dribbble',
    description: 'Design inspiration and creative community',
    href: 'https://dribbble.com/',
    icon: 'dribbble',
    posX: 309,
    posY: 552
  },
  {
    id: 9,
    label: 'tailwind',
    description: 'Utility-first CSS framework for rapid development',
    href: 'https://tailwindcss.com/',
    icon: 'tailwind',
    posX: 338,
    posY: 525
  },
  {
    id: 10,
    label: 'icones',
    description: 'Icon explorer with over 150,000 open source icons',
    href: 'https://icones.js.org/',
    icon: 'info-outline',
    posX: 101,
    posY: 577
  },
  {
    id: 11,
    label: 'expo',
    description: 'Platform for universal React applications',
    href: 'https://docs.expo.dev/',
    icon: 'expo',
    posX: 180,
    posY: 577
  },
  {
    id: 12,
    label: 'Cult UI',
    description: 'Components for Design Engineers',
    href: 'https://cult-ui.com/',
    icon: 'cult-ui',
    posX: 259,
    posY: 577
  },
  {
    id: 13,
    label: 'Kokonut UI',
    description: 'Collection of stunning components.',
    href: 'https://kokonutui.com/',
    icon: 'kokonut-ui',
    posX: 338,
    posY: 577
  },
  {
    id: 14,
    label: 'Fancy Components*',
    description: 'Collection of fun and weird, ready-to-use components and microinteractions',
    href: 'https://www.fancycomponents.dev/',
    icon: 'fancy-components',
    posX: 151,
    posY: 604
  },
  {
    id: 15,
    label: 'Badtz UI',
    description: 'UI library for React developers.',
    href: 'https://www.badtz-ui.com/',
    icon: 'badtz-ui',
    posX: 230,
    posY: 604
  },
  {
    id: 16,
    label: 'Animate UI',
    description: 'Elevate your UI with fluid, animated components',
    href: 'https://animate-ui.com/',
    icon: 'animate-ui',
    posX: 309,
    posY: 604
  },
  {
    id: 17,
    label: 'React Bits',
    description: 'React components for creative developers',
    href: 'https://reactbits.dev/',
    icon: 'react-bits',
    posX: 388,
    posY: 604
  }
]

const tiles: StarlinkTile[] = [
  ...makeHexTiles(
    'social',
    socmeds,
    [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8, 12],
      [9, 10, 11, 13]
    ],
    { x: 100, y: 98 },
    'odd'
  ),
  ...makeHexTiles(
    'backend',
    backends,
    [
      [0, 1, 2, 3],
      [4, 5, 6, 10, 9],
      [7, 8, 12, 13]
    ],
    { x: 100, y: 302 },
    'even'
  ),
  ...makeHexTiles(
    'frontend',
    frontends,
    [
      [0, 1, 2],
      [3, 4, 5, 9],
      [6, 7, 8],
      [10, 11, 12, 13],
      [14, 15, 16, 17]
    ],
    { x: 100, y: 500 },
    'even'
  )
]
