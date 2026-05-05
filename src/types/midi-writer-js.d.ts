declare module 'midi-writer-js' {
  export interface NoteEventOptions {
    pitch: string[]
    duration: string
    wait?: string
    velocity?: number
    channel?: number
    repeat?: number
    tick?: number
    grace?: string | string[]
    sequential?: boolean
  }

  export class NoteEvent {
    constructor(fields: NoteEventOptions)
  }

  export class Track {
    constructor()
    addEvent(
      events: NoteEvent | NoteEvent[],
      mapFunction?: (index: number, event: NoteEvent) => object
    ): Track
    setTempo(bpm: number, tick?: number): Track
  }

  export interface WriterOptions {
    middleC?: string
    ticksPerBeat?: number
  }

  export class Writer {
    constructor(tracks: Track | Track[], options?: WriterOptions)
    buildData(): number[]
    buildFile(): Uint8Array
    base64(): string
    dataUri(): string
    setOption(key: string, value: number | string): Writer
    stdout(): boolean
  }

  const MidiWriter: {
    NoteEvent: typeof NoteEvent
    Track: typeof Track
    Writer: typeof Writer
  }

  export default MidiWriter
}
