'use client'

import { ToneJS } from './tone'

export const Content = () => {
  return (
    <main className='h-screen'>
      <div className='text-white pt-12 md:pt-16 md:px-12 size-full'>
        <div className='px-4 h-12 flex items-end justify-between'></div>
        <ToneJS />
      </div>
    </main>
  )
}
