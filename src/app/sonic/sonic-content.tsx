'use client'

import { AudioConverter } from './audio-converter'
import { MidiConverter } from './midi-converter'

export const Content = () => {
  return (
    <main className='pt-16'>
      <AudioConverter />
      <MidiConverter />
    </main>
  )
}
