'use client'
import { Icon } from '@/lib/icons'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'

export const Dock = () => {
  const { setTheme, theme } = useTheme()
  const toggleTheme = useCallback(() => {
    console.log('clicked')
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  return (
    <div className='hover:z-300 dock dock-xs hover:bg-black/30 bg-transparent hover:backdrop-blur-2xl text-transparent hover:text-neutral-content transition-all duration-300'>
      <button>
        <span className='dock-label'>Home</span>
      </button>

      <button className=''>
        <span className='dock-label'>Inbox</span>
      </button>

      <div className='flex items-center justify-center space-x-2'>
        <button className='' onClick={toggleTheme}>
          <Icon name='dark-theme' className='size-5' />
        </button>
      </div>
    </div>
  )
}
