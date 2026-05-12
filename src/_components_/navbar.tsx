'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useCallback } from 'react'
import { Brand } from './brand'

export const Navbar = () => {
  // const pathname = usePathname()
  // const route = pathname.split('/').pop()
  return (
    <nav className='z-200 md:h-16 h-12 border-0 border-base-300 w-full justify-between bg-black/80 backdrop-blur-2xl hover:bg-black hover:backdrop-blur-2xl fixed top-0 flex items-center gap-8 ps-2 md:px-8'>
      <Brand title='Launch Day' />
      <Link href='/playground' className='text-gray-200'>
        <span className='italic font-bold'>webGPU</span>
      </Link>
    </nav>
    // <nav className='z-200 md:h-16 h-12 border-0 border-base-300 w-full justify-between bg-black/80 backdrop-blur-2xl hover:bg-black hover:backdrop-blur-2xl fixed top-0 flex items-center gap-8 ps-2 md:px-8'>
    //   {route === 'sepolia' ? <MadStacks title='Mad Stacks' /> : <Brand title='Launch Day' />}
    //   <WalletComp />
    // </nav>
  )
}

export const ModeSwitch = () => {
  const { setTheme } = useTheme()
  const handleThemeSet = useCallback(
    (theme: string) => async () => {
      setTheme(theme)
    },
    [setTheme]
  )
  return (
    <div className='flex items-center gap-2'>
      <button onClick={handleThemeSet('light')} className='text-gray-200'>
        Light
      </button>
      <button onClick={handleThemeSet('dark')} className='text-gray-200'>
        Dark
      </button>
    </div>
  )
}

// linear-gradient(135deg,var(--coral-bright) 0%,var(--coral-dark) 100%)
