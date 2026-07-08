'use client'

import { AudioConverter } from './audio-converter'
import { MidiConverter } from './midi-converter'

export const Content = () => {
  return (
    <main className='h-screen overflow-y-auto pt-16 pb-24'>
      <div className='space-y-6'>
        <AudioConverter />
        <MidiConverter />
      </div>
    </main>
  )
}
