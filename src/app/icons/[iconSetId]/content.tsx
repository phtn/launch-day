'use client'

import { useIconMeta } from '@/hooks/use-icon-meta'
import { IconSetList } from './icons'

interface ContentProps {
  iconSetId: string
}

export const Content = ({ iconSetId }: ContentProps) => {
  const { icons, hasMore, loadMore, loadAll, scrollAreaRef } = useIconMeta(iconSetId)
  return (
    <main className='size-screen'>
      <div className='text-white pt-12 md:pt-16 md:px-6 lg:px-12 h-fit'></div>
      <div className='size-screen bg-white'>
        <IconSetList
          icons={icons}
          iconSetId={iconSetId}
          hasMore={hasMore}
          loadMore={loadMore}
          loadAll={loadAll}
          scrollAreaRef={scrollAreaRef}
        />
      </div>
    </main>
  )
}
