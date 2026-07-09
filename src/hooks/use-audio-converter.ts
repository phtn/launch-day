import { useCallback, useRef } from 'react'

export type ConversionDirection = 'video-to-audio' | 'video-to-video' | 'audio-to-audio'
export type AudioOutputFormat = 'mp3' | 'wav' | 'm4a' | 'mp4'

export interface ConversionProgress {
  phase: 'loading' | 'extracting' | 'encoding' | 'complete'
  percentage: number
}

export interface ConversionResult {
  blob: Blob
  duration: number
  size: number
  bitrate: string
  format: AudioOutputFormat
  fileName: string
  previewType: 'audio' | 'video'
}

export interface AudioConversionOptions {
  bitrate: string
  direction: ConversionDirection
  outputFormat: AudioOutputFormat
  trimStart?: string
  trimEnd?: string
  thumbnail?: File | null
}

type FFmpegInstance = import('@ffmpeg/ffmpeg').FFmpeg
type FetchFile = typeof import('@ffmpeg/util').fetchFile
type ToBlobURL = typeof import('@ffmpeg/util').toBlobURL

const FFMPEG_CORE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'

const mimeTypeByFormat: Record<AudioOutputFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  mp4: 'video/mp4'
}

const extensionPattern = /\.[^/.]+$/

const getExtension = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension && extension !== file.name ? extension : 'input'
}

const getOutputFileName = (file: File, format: AudioOutputFormat) =>
  `${file.name.replace(extensionPattern, '')}.${format}`

const timeToSeconds = (time?: string): number => {
  if (!time) return 0

  const parts = time.split(':').map((part) => parseInt(part, 10) || 0)
  if (parts.length !== 3) return 0

  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

const getTrimArgs = (trimStart?: string, trimEnd?: string) => {
  const startSeconds = timeToSeconds(trimStart)
  const endSeconds = timeToSeconds(trimEnd)

  if (startSeconds <= 0 && endSeconds <= 0) return []
  if (endSeconds > startSeconds) return ['-ss', trimStart ?? '00:00:00', '-to', trimEnd ?? '']
  if (startSeconds > 0) return ['-ss', trimStart ?? '00:00:00']

  return []
}

const getTrimStartArgs = (trimStart?: string) => {
  return timeToSeconds(trimStart) > 0 ? ['-ss', trimStart ?? '00:00:00'] : []
}

const getTrimDurationArgs = (trimStart?: string, trimEnd?: string) => {
  const startSeconds = timeToSeconds(trimStart)
  const endSeconds = timeToSeconds(trimEnd)

  return endSeconds > startSeconds ? ['-t', String(endSeconds - startSeconds)] : []
}

const toUint8Array = (data: Awaited<ReturnType<FFmpegInstance['readFile']>>) => {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data)
  }

  return data
}

const deleteIfExists = async (ffmpeg: FFmpegInstance, path: string) => {
  try {
    await ffmpeg.deleteFile(path)
  } catch {
    // The in-memory filesystem throws if the file is absent.
  }
}

export const useAudioConverter = () => {
  const ffmpegRef = useRef<FFmpegInstance | null>(null)
  const loadPromiseRef = useRef<Promise<FFmpegInstance> | null>(null)

  const loadFFmpeg = useCallback(
    async (onProgress?: (progress: ConversionProgress) => void): Promise<FFmpegInstance> => {
      if (ffmpegRef.current) {
        return ffmpegRef.current
      }

      if (loadPromiseRef.current) {
        return loadPromiseRef.current
      }

      loadPromiseRef.current = (async () => {
        onProgress?.({ phase: 'loading', percentage: 1 })

        const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
          import('@ffmpeg/ffmpeg'),
          import('@ffmpeg/util')
        ])

        const ffmpeg = new FFmpeg()
        ffmpegRef.current = ffmpeg

        await ffmpeg.load({
          coreURL: await (toBlobURL as ToBlobURL)(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await (toBlobURL as ToBlobURL)(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm')
        })

        onProgress?.({ phase: 'loading', percentage: 10 })

        return ffmpeg
      })()

      return loadPromiseRef.current
    },
    []
  )

  const convert = useCallback(
    async (
      file: File,
      options: AudioConversionOptions
    ): Promise<{
      result: Promise<ConversionResult>
      onProgress: (callback: (progress: ConversionProgress) => void) => void
    }> => {
      let progressCallback: ((progress: ConversionProgress) => void) | null = null

      const emitProgress = (progress: ConversionProgress) => {
        progressCallback?.(progress)
      }

      const result = (async (): Promise<ConversionResult> => {
        emitProgress({ phase: 'loading', percentage: 0 })

        const ffmpeg = await loadFFmpeg(emitProgress)
        const { fetchFile } = await import('@ffmpeg/util')

        const outputFileName = getOutputFileName(file, options.outputFormat)
        const inputPath = `input.${getExtension(file)}`
        const outputPath = outputFileName === inputPath ? `output.${options.outputFormat}` : outputFileName
        const thumbnailPath = options.thumbnail ? `thumbnail.${getExtension(options.thumbnail)}` : null

        await Promise.all([deleteIfExists(ffmpeg, inputPath), deleteIfExists(ffmpeg, outputPath)])
        if (thumbnailPath) {
          await deleteIfExists(ffmpeg, thumbnailPath)
        }

        emitProgress({ phase: 'extracting', percentage: 12 })
        await ffmpeg.writeFile(inputPath, await (fetchFile as FetchFile)(file))

        if (thumbnailPath && options.thumbnail) {
          await ffmpeg.writeFile(thumbnailPath, await (fetchFile as FetchFile)(options.thumbnail))
        }

        const handleProgress = ({ progress }: { progress: number }) => {
          const percentage = Math.min(96, Math.max(15, Math.round(15 + progress * 80)))
          emitProgress({ phase: 'encoding', percentage })
        }

        const trimArgs = getTrimArgs(options.trimStart, options.trimEnd)
        const execArgs = getAudioConversionArgs(inputPath, outputPath, options, thumbnailPath, trimArgs)

        emitProgress({ phase: 'encoding', percentage: 15 })
        ffmpeg.on('progress', handleProgress)

        try {
          await ffmpeg.exec(execArgs)
        } finally {
          ffmpeg.off('progress', handleProgress)
        }

        const outputData = toUint8Array(await ffmpeg.readFile(outputPath))
        const blobBytes = new Uint8Array(outputData)
        const blob = new Blob([blobBytes], { type: mimeTypeByFormat[options.outputFormat] })

        if (blob.size === 0) {
          throw new Error('FFmpeg produced an empty output file.')
        }

        emitProgress({ phase: 'complete', percentage: 100 })

        return {
          blob,
          duration: Math.max(0, timeToSeconds(options.trimEnd) - timeToSeconds(options.trimStart)),
          size: blob.size,
          bitrate: options.bitrate,
          format: options.outputFormat,
          fileName: outputFileName,
          previewType: getPreviewType(options)
        }
      })()

      return {
        result,
        onProgress: (callback) => {
          progressCallback = callback
          progressCallback({ phase: 'loading', percentage: 0 })
        }
      }
    },
    [loadFFmpeg]
  )

  const terminate = useCallback(() => {
    ffmpegRef.current?.terminate()
    ffmpegRef.current = null
    loadPromiseRef.current = null
  }, [])

  return { convert, terminate }
}

const getPreviewType = (options: AudioConversionOptions): 'audio' | 'video' => {
  if (options.direction === 'video-to-video') return 'video'
  if (options.outputFormat === 'mp4' && options.thumbnail) return 'video'

  return 'audio'
}

const getAudioCodecArgs = (format: AudioOutputFormat, bitrate: string) => {
  switch (format) {
    case 'mp3':
      return ['-c:a', 'libmp3lame', '-b:a', bitrate]
    case 'wav':
      return ['-c:a', 'pcm_s16le']
    case 'm4a':
    case 'mp4':
      return ['-c:a', 'aac', '-b:a', bitrate]
  }
}

const getAudioConversionArgs = (
  inputPath: string,
  outputPath: string,
  options: AudioConversionOptions,
  thumbnailPath: string | null,
  trimArgs: string[]
) => {
  if (options.direction === 'video-to-video' && options.outputFormat === 'mp4') {
    return [...trimArgs, '-i', inputPath, '-map', '0', '-c', 'copy', '-movflags', '+faststart', outputPath]
  }

  const audioArgs = ['-map', '0:a:0', ...getAudioCodecArgs(options.outputFormat, options.bitrate)]

  if (options.outputFormat === 'mp3' || options.outputFormat === 'wav') {
    return [...trimArgs, '-i', inputPath, '-vn', ...audioArgs, outputPath]
  }

  if (options.outputFormat === 'm4a') {
    return [...trimArgs, '-i', inputPath, '-vn', ...audioArgs, '-movflags', '+faststart', outputPath]
  }

  if (!thumbnailPath) {
    return [...trimArgs, '-i', inputPath, '-vn', ...audioArgs, '-movflags', '+faststart', outputPath]
  }

  return [
    ...getTrimStartArgs(options.trimStart),
    '-i',
    inputPath,
    '-loop',
    '1',
    '-framerate',
    '1',
    '-i',
    thumbnailPath,
    '-map',
    '0:a:0',
    '-map',
    '1:v:0',
    ...getAudioCodecArgs(options.outputFormat, options.bitrate),
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-tune',
    'stillimage',
    '-pix_fmt',
    'yuv420p',
    ...getTrimDurationArgs(options.trimStart, options.trimEnd),
    '-shortest',
    '-movflags',
    '+faststart',
    outputPath
  ]
}
