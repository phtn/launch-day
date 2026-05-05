import MidiWriter from 'midi-writer-js'
import { PitchDetector } from 'pitchy'

type DetectedNote = {
  midi: number
  startSec: number
  durationSec: number
}

const A4 = 440
const A4_MIDI = 69

function freqToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / A4) + A4_MIDI)
}

function midiToName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  return `${names[midi % 12]}${octave}`
}

function secondsToTicks(seconds: number, bpm = 120, ticksPerBeat = 128): number {
  const beats = seconds / (60 / bpm)
  return Math.max(1, Math.round(beats * ticksPerBeat))
}

export async function mp3ToMidi(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()

  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const channel = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate

  const frameSize = 2048
  const hopSize = 512
  const clarityThreshold = 0.88

  const detector = PitchDetector.forFloat32Array(frameSize)
  const pitches: Array<{ time: number; midi: number | null }> = []

  for (let i = 0; i + frameSize < channel.length; i += hopSize) {
    const frame = channel.slice(i, i + frameSize)
    const [pitch, clarity] = detector.findPitch(frame, sampleRate)

    const time = i / sampleRate

    if (clarity >= clarityThreshold && pitch > 40 && pitch < 2000) {
      pitches.push({ time, midi: freqToMidi(pitch) })
    } else {
      pitches.push({ time, midi: null })
    }
  }

  const notes: DetectedNote[] = []
  let currentMidi: number | null = null
  let startSec = 0

  for (const point of pitches) {
    if (point.midi !== currentMidi) {
      if (currentMidi !== null) {
        notes.push({
          midi: currentMidi,
          startSec,
          durationSec: point.time - startSec
        })
      }

      currentMidi = point.midi
      startSec = point.time
    }
  }

  const track = new MidiWriter.Track()
  // track.setTempo(120)
  const bpm = 120
  const ticksPerBeat = 128

  let lastEndTick = 0

  for (const note of notes) {
    if (note.durationSec < 0.05) continue

    const startTick = secondsToTicks(note.startSec, bpm, ticksPerBeat)
    const durationTick = secondsToTicks(note.durationSec, bpm, ticksPerBeat)

    const waitTick = Math.max(0, startTick - lastEndTick)

    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: [midiToName(note.midi)],
        duration: `T${durationTick}`,
        wait: `T${waitTick}`
      })
    )

    lastEndTick = startTick + durationTick
  }

  const writer = new MidiWriter.Writer([track])
  const bytes = writer.buildFile()

  return new Blob([new Uint8Array(bytes)], {
    type: 'audio/midi'
  })
}
