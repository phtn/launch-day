import { StarlinkData } from '@/app/types'
import { Icon } from '@/lib/icons'
import Link from 'next/link'
import { memo, useMemo } from 'react'
import { HyperHex } from './hyperhex'

export const HeatTileV2 = memo((item: StarlinkData) => {
  const pos = useMemo(() => {
    switch (item.row) {
      case 'top':
        return { x: (item.col ?? 1) * 79 + 74, y: getPosY(item.row, item.sector) }
      case 'middle':
        return { x: (item.col ?? 1) * 79 + -60, y: getPosY(item.row, item.sector) }
      case 'bottom':
        return { x: (item.col ?? 1) * 79 + -194, y: getPosY(item.row, item.sector) }
      default:
        return { x: 0, y: 0 }
    }
  }, [item.row, item.sector, item.col])

  return (
    <Link className='group/tile' href={item.href} target='_blank' title={item.label}>
      <HyperHex posX={pos.x} posY={pos.y}>
        <Icon name={item.icon} className='size-7 text-zinc-800' solid />
      </HyperHex>
    </Link>
  )
})
HeatTileV2.displayName = 'HeatTileV2'

const getPosY = (row: 'top' | 'middle' | 'bottom', sector?: number) => {
  const rowMultMap = {
    top: 4.5,
    middle: 32,
    bottom: 59.5
  }
  switch (sector) {
    case 1:
      return rowMultMap[row] + 98
    case 2:
      return rowMultMap[row] + 298
    case 3:
      return rowMultMap[row] + 557
    default:
      return 0
  }
}
