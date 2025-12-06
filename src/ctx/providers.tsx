'use client'

import { type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'

type Props = {
  children: ReactNode
}

export const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider enableSystem attribute='class' defaultTheme='system' disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
