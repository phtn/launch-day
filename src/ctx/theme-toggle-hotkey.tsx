'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect } from 'react'

export function ThemeToggleHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }
    },
    [resolvedTheme, setTheme]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}
