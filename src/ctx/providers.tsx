'use client'

import { type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { ThemeToggleHotkey } from './theme-toggle-hotkey'

type Props = {
  children: ReactNode
}

export const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider enableSystem attribute='class' defaultTheme='system' disableTransitionOnChange>
      <ThemeToggleHotkey />
      {children}
    </ThemeProvider>
  )
}
