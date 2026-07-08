import { mp3ToMidi } from '@/lib/midi'
import { Icon } from '@/lib/icons'
import { Midi } from '@tonejs/midi'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import * as Tone from 'tone'

type MidiResult = {
  name: string
  url: string
  blob: Blob
}

const isSupportedMidiSource = (file: File) => {
  const name = file.name.toLowerCase()
  return file.type.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav')
}

export const MidiConverter = () => {
  const [loading, setLoading] = useState(false)
  const [midi, setMidi] = useState<MidiResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  useEffect(() => {
    return () => {
      if (midi) {
        URL.revokeObjectURL(midi.url)
      }

      Tone.getTransport().stop()
      Tone.getTransport().cancel()
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [midi])

  async function handleFile(file: File) {
    if (!isSupportedMidiSource(file)) {
      setError('Please select an MP3 or WAV file.')
      return
    }

    setLoading(true)
    setError('')
    stopMidi()

    if (midi) {
      URL.revokeObjectURL(midi.url)
    }

    try {
      const midiBlob = await mp3ToMidi(file)
      const url = URL.createObjectURL(midiBlob)

      setMidi({
        url,
        blob: midiBlob,
        name: file.name.replace(/\.[^.]+$/, '.mid')
      })
    } catch (err) {
      console.error('MIDI conversion error:', err)
      setError(err instanceof Error ? err.message : 'Failed to convert audio to MIDI.')
    } finally {
      setLoading(false)
    }
  }

  async function playMidi() {
    if (!midi || isPlaying) return

    await Tone.start()

    const arrayBuffer = await midi.blob.arrayBuffer()
    const midiData = new Midi(arrayBuffer)
    const transport = Tone.getTransport()

    transport.stop()
    transport.cancel()
    synthRef.current?.dispose()

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.5 }
    }).toDestination()

    synthRef.current = synth

    midiData.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        transport.schedule((time) => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
        }, note.time)
      })
    })

    transport.scheduleOnce(() => {
      setIsPlaying(false)
    }, midiData.duration)

    transport.start()
    setIsPlaying(true)
  }

  function stopMidi() {
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    synthRef.current?.dispose()
    synthRef.current = null
    setIsPlaying(false)
  }

  function downloadMidi() {
    if (!midi) return

    const a = document.createElement('a')
    a.href = midi.url
    a.download = midi.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  return (
    <section className='bg-linear-to-br from-emerald-50/10 to-cyan-50/5 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='border border-dark-origin rounded-3xl shadow-xl p-8'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold tracking-tighter'>
                audio <span className='font-thin px-2'>&rarr;</span> midi
              </h1>
              <p className='tracking-tighter'>Pitch-tracked MIDI sketch</p>
            </div>
            <button onClick={() => inputRef.current?.click()}>{midi ? 'Replace File' : 'Select Audio'}</button>
          </div>

          <input ref={inputRef} type='file' accept='audio/*,.mp3,.wav' onChange={handleFileSelect} className='hidden' />

          <label className='mt-6 block cursor-pointer rounded-xl border border-dashed p-8 text-center hover:bg-cyan-500/10'>
            <input type='file' accept='audio/*,.mp3,.wav' className='hidden' onChange={handleFileSelect} />
            {loading ? 'Converting...' : midi ? midi.name : 'Choose MP3 or WAV'}
          </label>

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mt-6'>
              <div className='flex items-start gap-3'>
                <Icon name='alert-02' className='w-5 h-5 text-red-600 mt-0.5' />
                <div>
                  <p className='font-medium text-red-800'>MIDI Conversion Failed</p>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              </div>
            </div>
          )}

          {midi && (
            <div className='mt-6 space-y-3 rounded-xl border p-4'>
              <p className='text-sm opacity-80'>{midi.name}</p>

              <div className='grid grid-cols-2 gap-2'>
                <button
                  onClick={playMidi}
                  disabled={isPlaying}
                  className='rounded-xl bg-cyan-500/30 px-4 py-3 font-semibold hover:bg-cyan-700 disabled:opacity-60'>
                  {isPlaying ? 'Playing' : 'Play'}
                </button>

                <button onClick={stopMidi} className='rounded-xl border px-4 py-3 font-semibold hover:bg-cyan-500/10'>
                  Stop
                </button>
              </div>

              <button
                onClick={downloadMidi}
                className='w-full rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 hover:bg-zinc-200'>
                Download MIDI
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
