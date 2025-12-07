declare module 'lamejs' {
  class Mp3Encoder {
    constructor(channels: number, samplerate: number, kbps: number)
    encodeBuffer(samples: Int16Array): Int8Array
    flush(): Int8Array
  }
  
  const lamejs: {
    Mp3Encoder: new (channels: number, samplerate: number, kbps: number) => Mp3Encoder
  }
  
  export = lamejs
}
