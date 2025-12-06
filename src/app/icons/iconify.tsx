import { type ClassName } from '@/app/types'
import { IconEntry } from '@/hooks/use-icon-meta'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { memo } from 'react'

interface IconifySvgProps {
  icon: IconEntry
  size?: number
  className?: ClassName
}
export const IconifySvg = memo(function IconifySvg({ icon, size = 20, className }: IconifySvgProps) {
  const w = icon.width ?? 24
  const h = icon.height ?? 24
  return (
    <motion.svg
      viewBox={`0 0 ${w} ${h}`}
      initial={{ width: w, height: h }}
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
