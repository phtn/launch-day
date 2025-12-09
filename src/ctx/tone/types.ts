import type { IconName } from '@/lib/icons'
import type { ReactNode } from 'react'
import * as Tone from 'tone'

export type Frequency = Tone.Unit.Frequency
export type Time = Tone.Unit.Time
export type NormalRange = Tone.Unit.NormalRange

export type SynthInstrumentType = 'synth' | 'membrane' | 'metal' | 'am' | 'fm' | 'duo' | 'mono' | 'pluck'
export type SynthInstrument = {
  type: SynthInstrumentType
  label: string
  icon: IconName
}
export type PolySynthType = Tone.PolySynth<
  Tone.Synth | Tone.MetalSynth | Tone.MembraneSynth | Tone.AMSynth | Tone.FMSynth | Tone.MonoSynth
>
export interface ToneContextType {
  isStarted: boolean
  isPlaying: boolean
  volume: number
  currentInstrument: SynthInstrumentType
  startAudio: () => Promise<void>
  stopAudio: () => void
  togglePlay: () => void
  setVolume: (value: number) => void
  setInstrument: (instrument: SynthInstrumentType) => void
  playNote: (note: Frequency | Array<Frequency>, duration?: Time, velocity?: NormalRange) => void
  playNoteRelease: (notes: Frequency | Array<Frequency>, duration?: Time) => void
  playChord: (notes: Frequency | Array<Frequency>, duration: Time) => void
  playSequence: (notes: Array<Frequency>, noteDuration?: Time, startTime?: number, velocity?: NormalRange) => void
}

export interface ToneProviderProps {
  children: ReactNode
}
