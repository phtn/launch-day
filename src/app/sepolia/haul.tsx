'use client'

import { CryptoWidget } from '@/components/txn/widget'

export const Haul = () => {
  return (
    <main className='min-h-screen space-x-12 flex items-start justify-center'>
      <div className='flex items-start md:mt-28 h-full w-full'>
        <CryptoWidget />
        {/*<Content />*/}
      </div>
    </main>
  )
}
