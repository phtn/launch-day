'use client'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DockProps {
  children?: ReactNode
  autoHide?: boolean
}

export const Dock = ({ children, autoHide = false }: DockProps) => {
  return (
    <div
      className={cn(
        'dock dock-xs bg-base-300/40 backdrop-blur-2xl hover:text-neutral-content transition-all duration-300 z-300',
        {
          'z-0 hover:z-300 hover:bg-black/30 hover:backdrop-blur-2xl bg-transparent': autoHide
        }
      )}>
      {children}
    </div>
  )
}
