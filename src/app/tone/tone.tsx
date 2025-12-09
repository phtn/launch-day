import { ToneProvider, useTone } from '@/ctx/tone'
import { Frequency, NormalRange, SynthInstrument, Time } from '@/ctx/tone/types'
import { Icon } from '@/lib/icons'
import { FC, Key, useState } from 'react'

const ToneSynth: FC = () => {
  const {
    isStarted,
    isPlaying,
    volume,
    currentInstrument,
    startAudio,
    togglePlay,
    setVolume,
    setInstrument,
    playNoteRelease,
    playChord,
    playSequence
  } = useTone()

  const notes: Array<Frequency> = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

  const instruments: Array<SynthInstrument> = [
    { type: 'synth', label: 'Synth', icon: 'piano' },
    { type: 'membrane', label: 'Membrane', icon: 'piano' },
    { type: 'metal', label: 'Metal', icon: 'piano' },
    { type: 'am', label: 'AM Synth', icon: 'piano' },
    { type: 'fm', label: 'FM Synth', icon: 'piano' },
    { type: 'duo', label: 'Duo Synth', icon: 'piano' },
    { type: 'mono', label: 'Mono', icon: 'piano' },
    { type: 'pluck', label: 'Pluck', icon: 'piano' }
  ]

  const [selectedNotes, setSelectedNotes] = useState<Array<Frequency>>([])
  const [selectedDuration, setSelectedDuration] = useState<Time>('8n')
  const [velocity, setVelocity] = useState<NormalRange>(0.8)

  const durationOptions: Array<{ value: Time; label: string }> = [
    { value: '1n', label: 'Whole' },
    { value: '2n', label: 'Half' },
    { value: '4n', label: 'Quarter' },
    { value: '8n', label: 'Eighth' },
    { value: '16n', label: 'Sixteenth' },
    { value: '32n', label: '32nd' }
  ]

  const handleAddNote = (note: Frequency) => () => {
    setSelectedNotes([...selectedNotes, note])
  }

  const handleRemoveNote = (index: number) => () => {
    setSelectedNotes(selectedNotes.filter((_, i) => i !== index))
  }

  const handleClearSequence = () => {
    setSelectedNotes([])
  }

  const handlePlaySequence = () => {
    if (selectedNotes.length > 0) {
      playSequence(selectedNotes, selectedDuration, undefined, velocity)
    }
  }

  return (
    <div className='h-[calc(100lvh-124px)] flex items-center justify-center'>
      <div className='h-full w-full'>
        {isStarted ? (
          <div className='space-y-0'>
            <div className='flex h-full items-start justify-between'>
              {/* Instrument Selector */}
              <div className='h-full bg-white/5 rounded-md p-2 border border-white/10'>
                <h2 className='text-lg font-semibold text-white mb-4 tracking-tighter'>Instruments</h2>
                <div className='flex flex-col space-y-1'>
                  {instruments.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => setInstrument(type)}
                      className={`p-2 flex items-center space-x-4 rounded-sm font-semibold transition transform hover:scale-105 ${
                        currentInstrument === type
                          ? 'bg-blue-400/40 text-white shadow-lg'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}>
                      <Icon name={icon} className='size-5' />
                      <div className='text-sm'>{label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/*-------------------------------*/}
              {/* Select Keys */}
              {/*-------------------------------*/}
              <div className='bg-white/5 rounded-xs p-2 min-w-md'>
                <h2 className='text-lg tracking-tighter font-semibold text-white mb-4'>Select Notes</h2>
                <div id='note-selector' className='grid grid-cols-4 gap-1 mb-4'>
                  {notes.map((note) => (
                    <button
                      key={note}
                      onClick={handleAddNote(note)}
                      className='bg-white/10 text-white text-lg font-bone py-1 rounded-sm transform transition active:scale-95'>
                      {note}
                    </button>
                  ))}
                </div>

                {/* Duration Selection */}
                <div className='mb-4'>
                  <h3 className='text-sm font-semibold text-white mb-2'>Note Duration</h3>
                  <div className='grid grid-cols-3 gap-1'>
                    {durationOptions.map(({ value, label }) => (
                      <button
                        key={value as Key}
                        onClick={() => setSelectedDuration(value)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-sm transition ${
                          selectedDuration === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Velocity Control */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-sm font-semibold text-white'>Velocity</h3>
                    <span className='text-xs text-white/60'>{Math.round(velocity * 100)}%</span>
                  </div>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={velocity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setVelocity(Number(e.target.value) as NormalRange)
                    }
                    className='w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer'
                  />
                </div>

                <div id='timeline' className='pt-4 border-t border-white/10'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-sm font-semibold text-white'>Timeline</h3>
                    <div className='flex items-center space-x-2'>
                      {selectedNotes.length > 0 && (
                        <>
                          <button
                            onClick={handlePlaySequence}
                            className='bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-sm transition'>
                            ▶ Play
                          </button>
                          <button
                            onClick={handleClearSequence}
                            className='bg-red-500/60 hover:bg-red-500/80 text-white text-xs font-semibold py-1 px-3 rounded-sm transition'>
                            Clear
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-px flex-wrap gap-1'>
                    {selectedNotes.length === 0 ? (
                      <p className='text-white/40 text-sm'>No notes selected. Click notes above to add them.</p>
                    ) : (
                      selectedNotes.map((note, index) => (
                        <button
                          key={index}
                          onClick={handleRemoveNote(index)}
                          className='bg-pink-400/50 hover:bg-pink-400/70 text-white text-lg font-bone py-1 px-2.5 rounded-sm transform transition active:scale-95 cursor-pointer'>
                          {note}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/*-------------------------------*/}
              {/* Piano Keys */}
              {/*-------------------------------*/}
              <div className='bg-white/5 rounded-xl p-6 border border-white/10 w-full'>
                <h2 className='text-xl font-semibold text-white mb-4'>Play Notes</h2>
                <div className='grid grid-cols-4 gap-3 mb-4'>
                  {notes.map((note) => (
                    <button
                      key={note}
                      onClick={() => playNoteRelease(note)}
                      className='bg-linear-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold py-4 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95'>
                      {note}
                    </button>
                  ))}
                </div>

                <div className='pt-4 border-t border-white/10'>
                  <h3 className='text-sm font-semibold text-white mb-3'>Quick Chords</h3>
                  <div className='grid grid-cols-3 gap-3'>
                    <button
                      onClick={() => playChord(['C4', 'E4', 'G4'], '2n')}
                      className='bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition'>
                      C Major
                    </button>
                    <button
                      onClick={() => playChord(['A4', 'C5', 'E5'], '2n')}
                      className='bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition'>
                      A Minor
                    </button>
                    <button
                      onClick={() => playChord(['G4', 'B4', 'D5'], '2n')}
                      className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition'>
                      G Major
                    </button>
                  </div>
                </div>
              </div>

              <div className='min-w-xs'>
                <h1 className='text-4xl font-bold text-white mb-2 text-center tracking-tight'>Tone JS Synths</h1>
                <p className='text-blue-200 text-center mb-8'>8 Different Synthesizer Types</p>

                {/* Transport Controls */}
                <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
                  <h2 className='text-xl font-semibold text-white mb-4'>Transport Controls</h2>
                  <button
                    onClick={togglePlay}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}>
                    {isPlaying ? '⏸ Stop Loop' : '▶ Play Loop'}
                  </button>
                </div>
                {/* Volume Control */}
                <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
                  <h2 className='text-xl font-semibold text-white mb-4'>Volume: {volume} dB</h2>
                  <input
                    type='range'
                    min='-40'
                    max='0'
                    step='1'
                    value={volume}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value))}
                    className='w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
                {/* Info */}
                <div className='bg-blue-500/10 border border-blue-400/30 rounded-xl p-4'>
                  <p className='text-blue-200 text-sm text-center'>
                    Current: <span className='font-semibold text-white'>{currentInstrument.toUpperCase()}</span> |
                    Status: <span className='font-semibold text-white'>{isPlaying ? 'Playing' : 'Stopped'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <button
              onClick={startAudio}
              className='bg-linear-to-r from-blue-100 to-cyan-100 hover:from-blue-100 text-base-300 text-lg tracking-tighter font-semibold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105'>
              Start Audio Context
            </button>
            <p className='text-blue-200 mt-4 text-sm'>click is required by browsers</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const ToneJS = () => {
  return (
    <ToneProvider>
      <ToneSynth />
    </ToneProvider>
  )
}
