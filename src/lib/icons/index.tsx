import type { FC } from 'react'
import { cn } from '../utils'
import { IconNameType, icons } from './icons'
import type { IconData, IconProps } from './types'

export type IconName = IconNameType

export const Icon: FC<IconProps> = ({ name, className, size = 24, color = 'currentColor', solid = true, ...props }) => {
  const icon = icons[name] as IconData

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox={icon?.viewBox ?? '0 0 24 24'}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      fill={solid ? color : 'none'}
      stroke={color}
      strokeWidth={solid ? 0 : 1}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
      dangerouslySetInnerHTML={{ __html: icon?.symbol }}
    />
  )
}
