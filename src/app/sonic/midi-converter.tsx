import { mp3ToMidi } from '@/lib/midi'
import { Midi } from '@tonejs/midi'
import { useState } from 'react'
import * as Tone from 'tone'

export const MidiConverter = () => {
  return (
    <div className='h-fit bg-linear-to-br from-emerald-50/10 to-cyan-50/5 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='border border-dark-origin rounded-3xl shadow-xl p-8 '>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tighter'>
                mp3 <span className='font-thin px-2'>&rarr;</span> midi
              </h1>
            </div>
            <button onClick={undefined}>Select File</button>
          </div>
        </div>
        <Converter />
      </div>
    </div>
  )
}

type MidiResult = {
  name: string
  url: string
  blob: Blob
}

export const Converter = () => {
  const [loading, setLoading] = useState(false)
  const [midi, setMidi] = useState<MidiResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)

    if (midi) URL.revokeObjectURL(midi.url)

    const midiBlob = await mp3ToMidi(file)
    const url = URL.createObjectURL(midiBlob)

    setMidi({
      url,
      blob: midiBlob,
      name: file.name.replace(/\.[^.]+$/, '.mid')
    })

    setLoading(false)
  }

  async function playMidi() {
    if (!midi) return

    await Tone.start() // required (user gesture unlock)

    const arrayBuffer = await midi.blob.arrayBuffer()
    const midiData = new Midi(arrayBuffer)

    // simple synth (you can swap this later)
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.5 }
    }).toDestination()

    // clear any previous schedule
    Tone.getTransport().cancel()
    Tone.getTransport().stop()

    midiData.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        Tone.getTransport().schedule((time) => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
        }, note.time)
      })
    })

    Tone.getTransport().start()
    setIsPlaying(true)
  }

  function stopMidi() {
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    setIsPlaying(false)
  }

  function downloadMidi() {
    if (!midi) return

    const a = document.createElement('a')
    a.href = midi.url
    a.download = midi.name
    a.click()
  }

  return (
    <main className='min-h-64 grid place-items-center bg-zinc-950 text-white p-6'>
      <section className='w-full max-w-xl rounded-2xl bg-zinc-900 p-6 shadow-xl'>
        <h1 className='text-2xl font-bold'>MP3 → MIDI</h1>

        <label className='mt-6 block cursor-pointer rounded-xl border border-dashed border-zinc-700 p-8 text-center hover:bg-zinc-800'>
          <input
            type='file'
            accept='audio/mp3,audio/mpeg'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />

          {loading ? 'Converting...' : 'Choose MP3'}
        </label>

        {midi && (
          <div className='mt-6 space-y-3 rounded-xl bg-zinc-950 p-4'>
            <p className='text-sm text-zinc-300'>{midi.name}</p>

            <div className='flex gap-2'>
              <button
                onClick={playMidi}
                className='flex-1 rounded-xl bg-green-500 px-4 py-3 font-semibold text-black hover:bg-green-400'>
                {isPlaying ? 'Playing' : 'Play'}
              </button>

              <button
                onClick={stopMidi}
                className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-black hover:bg-red-400'>
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
      </section>
    </main>
  )
}
