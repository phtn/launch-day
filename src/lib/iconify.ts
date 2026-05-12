import type { IconifyIcon } from '@/app/api/icones/types'

type IconifyBounds = Pick<IconifyIcon, 'left' | 'top' | 'width' | 'height'>

export function normalizeIconifyIcon(
  icon: IconifyIcon,
  defaults: IconifyBounds = {},
  fallbackSize = 24
): IconifyIcon & Required<IconifyBounds> {
  return {
    ...icon,
    left: icon.left ?? defaults.left ?? 0,
    top: icon.top ?? defaults.top ?? 0,
    width: icon.width ?? defaults.width ?? fallbackSize,
    height: icon.height ?? defaults.height ?? fallbackSize
  }
}

export function getIconifyViewBox(icon: IconifyBounds, fallbackSize = 24): string {
  const left = icon.left ?? 0
  const top = icon.top ?? 0
  const width = icon.width ?? fallbackSize
  const height = icon.height ?? fallbackSize

  return `${left} ${top} ${width} ${height}`
}

/*

*/
