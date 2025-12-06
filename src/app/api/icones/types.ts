import { IconEntry } from '@/hooks/use-icon-meta'

export interface IconSet {
  name: string
  total: number
  version: string
  author: {
    name: string
    url: string
  }
  license: {
    title: string
    spdx: string
    url: string
  }
  samples: Array<IconEntry>
  height: number
  category: string
  tags: string[]
  palette: boolean
  id: string
  icons: string[]
}

export interface IconifyIcon {
  body: string
  width?: number
  height?: number
  hidden?: boolean
  left?: number
  top?: number
  rotate?: number
  vFlip?: boolean
  hFlip?: boolean
}

export interface IconifyIconsResponse {
  prefix: string
  icons: Record<string, IconifyIcon>
  aliases?: Record<string, unknown>
  lastModified?: number
  total?: number
}
