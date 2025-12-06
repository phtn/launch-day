'use client'

import { CryptoContent } from './crypto'

export const Content = () => {
  // const { isPending, lastUpdated } = useCrypto()
  return (
    <main className='h-screen'>
      <div className='pt-10 md:pt-16 md:px-12 size-full'>
        <CryptoContent />
      </div>
    </main>
  )
}
