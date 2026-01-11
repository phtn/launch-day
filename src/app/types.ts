import type { IconName } from '@/lib/icons'
import type { HTMLProps } from 'react'

export type ClassName = HTMLProps<HTMLElement>['className']

export interface StarlinkData {
  id: number
  label: string
  description: string
  href: string
  icon: IconName
  row?: 'above' | 'top' | 'middle' | 'bottom' | 'under'
  col?: number
  sector?: number
  posX?: number
  posY?: number
}
