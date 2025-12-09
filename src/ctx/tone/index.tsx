import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as Tone from 'tone'
import {
  Frequency,
  NormalRange,
  PolySynthType,
  SynthInstrumentType,
  Time,
  ToneContextType,
  ToneProviderProps
} from './types'

// Create Context
const ToneContext = createContext<ToneContextType | undefined>(undefined)

// Provider Component
export const ToneProvider: React.FC<ToneProviderProps> = ({ children }) => {
  const [isStarted, setIsStarted] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(-12)
  const [currentInstrument, setCurrentInstrument] = useState<SynthInstrumentType>('synth')
  const [instrument, setInstrumentState] = useState<Tone.PolySynth | Tone.Sampler | null>(null)
  const [loop, setLoop] = useState<Tone.Loop | null>(null)

  // Create instrument based on type
  const createInstrument = useCallback(
    (type: SynthInstrumentType): Tone.PolySynth | Tone.Sampler => {
      let newInstrument: PolySynthType

      switch (type) {
        case 'synth':
          newInstrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
          })
          break

        case 'membrane':
          newInstrument = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.05,
            octaves: 6,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
          })
          break

        case 'metal':
          newInstrument = new Tone.PolySynth(Tone.MetalSynth, {
            envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
          }) as PolySynthType
          break

        case 'am':
          newInstrument = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 3,
            detune: 0,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
            modulation: { type: 'square' },
            modulationEnvelope: {
              attack: 0.2,
              decay: 0,
              sustain: 0.5,
              release: 0.5
            }
          })
          break

        case 'fm':
          newInstrument = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 10,
            detune: 0,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 1 },
            modulation: { type: 'square' },
            modulationEnvelope: {
              attack: 0.5,
              decay: 0,
              sustain: 0.1,
              release: 0.5
            }
          })
          break

        case 'duo':
          // DuoSynth cannot be used with PolySynth, use MonoSynth instead
          newInstrument = new Tone.PolySynth(Tone.MonoSynth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.8 },
            filterEnvelope: {
              attack: 0.02,
              decay: 0.1,
              sustain: 0.8,
              release: 1,
              baseFrequency: 400,
              octaves: 3
            }
          })
          break

        case 'mono':
          newInstrument = new Tone.PolySynth(Tone.MonoSynth, {
            oscillator: { type: 'square' },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1 },
            filterEnvelope: {
              attack: 0.001,
              decay: 0.01,
              sustain: 0.5,
              release: 0.5,
              baseFrequency: 200,
              octaves: 4
            }
          })
          break

        case 'pluck':
          // PluckSynth cannot be used with PolySynth, use a sharp attack synth instead
          newInstrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.5 }
          })
          break

        default:
          newInstrument = new Tone.PolySynth(Tone.Synth)
      }

      newInstrument.toDestination()
      newInstrument.volume.value = volume
      return newInstrument
    },
    [volume]
  )

  // Initialize instrument
  useEffect(() => {
    const newInstrument = createInstrument(currentInstrument)
    setInstrumentState(newInstrument)

    return () => {
      newInstrument.dispose()
    }
  }, [currentInstrument, createInstrument])

  // Update volume when changed
  useEffect(() => {
    if (instrument) {
      instrument.volume.value = volume
    }
  }, [volume, instrument])

  const startAudio = useCallback(async (): Promise<void> => {
    try {
      await Tone.start()
      setIsStarted(true)
      console.log('Audio context started')
    } catch (error) {
      console.error('Failed to start audio context:', error)
    }
  }, [])

  const stopAudio = useCallback((): void => {
    if (loop) {
      loop.stop()
      loop.dispose()
      setLoop(null)
    }
    Tone.getTransport().stop()
    setIsPlaying(false)
  }, [loop])

  const togglePlay = useCallback((): void => {
    if (!instrument) return

    if (isPlaying) {
      stopAudio()
    } else {
      const notes: string[] = ['C4', 'E4', 'G4', 'B4']
      let index = 0

      const newLoop = new Tone.Loop((time: number) => {
        instrument.triggerAttackRelease(notes[index % notes.length], '8n', time)
        index++
      }, '4n')

      newLoop.start(0)
      Tone.getTransport().start()
      setLoop(newLoop)
      setIsPlaying(true)
    }
  }, [isPlaying, instrument, stopAudio])

  const playNote = useCallback(
    (note: Frequency | Array<Frequency>, duration: Time = 0.1, velocity: NormalRange = 0.2): void => {
      if (!instrument || !isStarted) return
      instrument.triggerAttack(note, duration, velocity)
    },
    [instrument, isStarted]
  )
  const playNoteRelease = useCallback(
    (note: Frequency | Array<Frequency>, duration: Time = 0.05): void => {
      console.log(note)
      console.log(!instrument || !isStarted, instrument?.name, isStarted)
      if (!instrument || !isStarted) return
      instrument.triggerAttackRelease(note, duration, Tone.now())
    },
    [instrument, isStarted]
  )
  const playChord = useCallback(
    (notes: Frequency | Frequency[], duration: Time = 0.1): void => {
      if (!instrument || !isStarted) return
      instrument.triggerAttackRelease(notes, duration)
    },
    [instrument, isStarted]
  )

  const playSequence = useCallback(
    (
      notes: Frequency[],
      noteDuration: Time = '8n',
      startTime: number = Tone.now(),
      velocity: NormalRange = 0.8
    ): void => {
      if (!instrument || !isStarted || notes.length === 0) return

      notes.forEach((note, index) => {
        const time = Tone.Time(noteDuration).toSeconds() * index
        instrument.triggerAttackRelease(note, noteDuration, startTime + time, velocity)
      })
    },
    [instrument, isStarted]
  )

  const setInstrument = useCallback(
    (type: SynthInstrumentType): void => {
      if (isPlaying) {
        stopAudio()
      }
      setCurrentInstrument(type)
    },
    [isPlaying, stopAudio]
  )

  const setVolume = useCallback((value: number): void => {
    setVolumeState(value)
  }, [])

  const value: ToneContextType = {
    isStarted,
    isPlaying,
    volume,
    currentInstrument,
    startAudio,
    stopAudio,
    togglePlay,
    setVolume,
    setInstrument,
    playNote,
    playNoteRelease,
    playChord,
    playSequence
  }

  return <ToneContext.Provider value={value}>{children}</ToneContext.Provider>
}

// Custom Hook
export const useTone = (): ToneContextType => {
  const context = useContext(ToneContext)
  if (context === undefined) {
    throw new Error('useTone must be used within a ToneProvider')
  }
  return context
}
