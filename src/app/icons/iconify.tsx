import { type ClassName } from '@/app/types'
import { IconEntry } from '@/hooks/use-icon-meta'
import { getIconifyViewBox } from '@/lib/iconify'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { memo } from 'react'

interface IconifySvgProps {
  icon: IconEntry
  size?: number
  className?: ClassName
}
export const IconifySvg = memo(function IconifySvg({ icon, size = 32, className }: IconifySvgProps) {
  const w = icon.width ?? 32
  const h = icon.height ?? 32

  return (
    <motion.svg
      viewBox={getIconifyViewBox(icon, Math.max(w, h))}
      initial={{ width: w > 100 ? 64 : w, height: h > 100 ? 64 : h }}
      animate={{ width: size, height: size }}
      width={size}
      height={size}
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      focusable='false'
      dangerouslySetInnerHTML={{ __html: icon.body }}
      className={cn('aspect-square shrink-0 transition-all duration-300 ease-in-out', className)}
    />
  )
})

/*
"apple": {
  "symbol": "<path fill=\"currentColor\" d=\"M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8c-18.8-26.9-47.2-41.7-84.7-44.6c-35.5-2.8-74.3 20.7-88.5 20.7c-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2c25.2-.6 43-17.9 75.8-17.9c31.8 0 48.3 17.9 76.4 17.9c48.6-.7 90.4-82.5 102.6-119.3c-65.2-30.7-61.7-90-61.7-91.9m-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5c-24.1 1.4-52 16.4-67.9 34.9c-17.5 19.8-27.8 44.3-25.6 71.9c26.1 2 49.9-11.4 69.5-34.3\"/>",
  "viewBox": "0 0 32 32",
  "set": "fa-brands"
}
"amazon": {
  "symbol": "<path fill=\"currentColor\" d=\"M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5c0 109.5 138.3 114 183.5 43.2c6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32C140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5c40.7-.1 35.5 29.8 35.5 69.1m0 86.8c0 80-84.2 68-84.2 17.2c0-47.2 50.5-56.7 84.2-57.8zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12m39.8 2.2c-6.5 15.8-16 26.8-21.2 31c-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2c-10.8 1-13 2-14-.3c-2.3-5.7 21.7-15.5 37.5-17.5c15.7-1.8 41-.8 46 5.7c3.7 5.1 0 27.1-6.5 43.1\"/>",
  "viewBox": "0 0 448 512",
  "set": "fa-brands"
}
*/
