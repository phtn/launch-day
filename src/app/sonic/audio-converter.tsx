import { AnimatedNumber } from '@/components/animated-number'
import { ModernInput } from '@/components/input'
import {
  ConversionProgress,
  useAudioConverter,
  type AudioOutputFormat,
  type ConversionDirection,
  type ConversionResult
} from '@/hooks/use-audio-converter'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ProgressBar } from './progress-card'

type ConversionStats = {
  originalSize: number
  newSize: number
  bitrate: string
  format: AudioOutputFormat
  fileName: string
  previewType: 'audio' | 'video'
}

const mediaInputAccept = 'audio/*,video/mp4,.mp3,.wav,.m4a,.mp4'
const mediaFormats: AudioOutputFormat[] = ['wav', 'mp3', 'mp4', 'm4a']
const bitrates = ['128', '192', '320']

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

const timeToSeconds = (time: string): number => {
  const parts = time.split(':').map((part) => parseInt(part, 10) || 0)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return 0
}

const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const validateTimeFormat = (time: string): boolean => /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/.test(time)

const getFileFormat = (file: File): AudioOutputFormat | null => {
  const name = file.name.toLowerCase()

  if (name.endsWith('.wav') || file.type === 'audio/wav' || file.type === 'audio/x-wav') return 'wav'
  if (name.endsWith('.mp3') || file.type === 'audio/mpeg') return 'mp3'
  if (name.endsWith('.m4a') || file.type === 'audio/mp4' || file.type === 'audio/x-m4a') return 'm4a'
  if (name.endsWith('.mp4') || file.type === 'video/mp4') return 'mp4'

  return null
}

const getDirectionForConversion = (
  sourceFormat: AudioOutputFormat,
  outputFormat: AudioOutputFormat | null
): ConversionDirection => {
  if (sourceFormat === 'mp4' && outputFormat === 'mp4') return 'video-to-video'
  return sourceFormat === 'mp4' ? 'video-to-audio' : 'audio-to-audio'
}

const getOutputOptionsForFormat = (format: AudioOutputFormat): AudioOutputFormat[] => {
  if (format === 'mp4') return ['mp4', 'wav', 'mp3', 'm4a']
  return mediaFormats.filter((option) => option !== format)
}

const getPhaseLabel = (phase: string): string => {
  const labels: Record<string, string> = {
    loading: 'Loading FFmpeg...',
    extracting: 'Preparing media...',
    encoding: 'Encoding...',
    complete: 'Complete!'
  }

  return labels[phase] || phase
}

export const AudioConverter = () => {
  const [direction, setDirection] = useState<ConversionDirection>('video-to-audio')
  const [outputFormat, setOutputFormat] = useState<AudioOutputFormat | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState<ConversionProgress | null>(null)
  const [convertedUrl, setConvertedUrl] = useState<string>('')
  const [stats, setStats] = useState<ConversionStats | null>(null)
  const [error, setError] = useState<string>('')
  const [trimStart, setTrimStart] = useState<string>('00:00:00')
  const [trimEnd, setTrimEnd] = useState<string>('00:00:00')
  const [mediaDuration, setMediaDuration] = useState<number>(0)

  const { convert } = useAudioConverter()
  const inputFileRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const selectedFileFormat = selectedFile ? getFileFormat(selectedFile) : null
  const targetFormat = outputFormat
  const outputFormatOptions = selectedFileFormat ? getOutputOptionsForFormat(selectedFileFormat) : []
  const sourceLabel = direction === 'audio-to-audio' ? 'audio' : 'video'
  const titleSource = selectedFileFormat ?? 'media'
  const isVideoTrim = direction === 'video-to-video'
  const qualityDisabled = targetFormat === 'wav'

  useEffect(() => {
    return () => {
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl)
      }

      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl)
      }
    }
  }, [convertedUrl, thumbnailPreviewUrl])

  const resetConversion = () => {
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl)
    }

    setSelectedFile(null)
    setThumbnailFile(null)
    setThumbnailPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return ''
    })
    setConvertedUrl('')
    setStats(null)
    setProgress(null)
    setTrimStart('00:00:00')
    setTrimEnd('00:00:00')
    setMediaDuration(0)
    setError('')

    if (inputFileRef.current) {
      inputFileRef.current.value = ''
    }

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  const loadMediaDuration = (file: File, nextDirection: ConversionDirection) => {
    const media = nextDirection === 'audio-to-audio' ? document.createElement('audio') : document.createElement('video')
    media.preload = 'metadata'

    media.onloadedmetadata = () => {
      const duration = Math.floor(media.duration)
      setMediaDuration(duration)
      setTrimEnd(secondsToTime(duration))
      URL.revokeObjectURL(media.src)
    }

    media.onerror = () => {
      setError('Failed to load media metadata')
      URL.revokeObjectURL(media.src)
    }

    media.src = URL.createObjectURL(file)
    media.load()
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileFormat = getFileFormat(file)
    if (!fileFormat) {
      setError('Please select a WAV, MP3, MP4, or M4A file.')
      return
    }

    const nextOutputOptions = getOutputOptionsForFormat(fileFormat)
    const nextOutputFormat = nextOutputOptions[0] ?? null
    const nextDirection = getDirectionForConversion(fileFormat, nextOutputFormat)

    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl)
    }

    setDirection(nextDirection)
    setOutputFormat(nextOutputFormat)
    setSelectedFile(file)
    setThumbnailFile(null)
    setThumbnailPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return ''
    })
    setConvertedUrl('')
    setStats(null)
    setError('')
    setProgress(null)
    setTrimStart('00:00:00')
    setTrimEnd('00:00:00')
    setMediaDuration(0)
    loadMediaDuration(file, nextDirection)
  }

  const handleThumbnailSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image')) {
      setError('Please select an image file for the MP4 thumbnail.')
      return
    }

    setThumbnailPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return URL.createObjectURL(file)
    })
    setThumbnailFile(file)
    setError('')
  }

  const validateTrimTimes = () => {
    if (!validateTimeFormat(trimStart) || !validateTimeFormat(trimEnd)) {
      setError('Invalid time format. Use HH:MM:SS, for example 00:01:30.')
      return false
    }

    const startSeconds = timeToSeconds(trimStart)
    const endSeconds = timeToSeconds(trimEnd)

    if (startSeconds >= endSeconds) {
      setError('Start time must be before end time.')
      return false
    }

    if (mediaDuration > 0 && endSeconds > mediaDuration) {
      setError('End time cannot exceed media duration.')
      return false
    }

    return true
  }

  const handleConvert = async (bitrate: string) => {
    if (!selectedFile) return
    if (!validateTrimTimes()) return

    setIsConverting(true)
    setError('')
    setProgress({ phase: 'loading', percentage: 0 })

    try {
      if (!targetFormat) return
      const selectedThumbnail =
        direction === 'audio-to-audio' && targetFormat === 'mp4'
          ? (thumbnailFile ?? thumbnailInputRef.current?.files?.[0] ?? null)
          : null

      const { result, onProgress } = await convert(selectedFile, {
        bitrate,
        direction,
        outputFormat: targetFormat,
        trimStart,
        trimEnd,
        thumbnail: selectedThumbnail
      })

      onProgress(setProgress)

      const conversionResult = await (result as Promise<ConversionResult>)
      const url = URL.createObjectURL(conversionResult.blob)

      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl)
      }

      setConvertedUrl(url)
      setStats({
        originalSize: selectedFile.size,
        newSize: conversionResult.size,
        bitrate: conversionResult.bitrate,
        format: conversionResult.format,
        fileName: conversionResult.fileName,
        previewType: conversionResult.previewType
      })
    } catch (err) {
      console.error('Conversion error:', err)
      setError(err instanceof Error ? err.message : 'Failed to convert media')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedUrl || !stats) return

    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = stats.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleSelectFile = () => {
    inputFileRef.current?.click()
  }

  const handleSelectThumbnail = () => {
    thumbnailInputRef.current?.click()
  }

  return (
    <div className='h-fit bg-linear-to-br from-emerald-50/10 to-cyan-50/5 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='border border-dark-origin rounded-3xl shadow-xl p-8'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tighter'>
                {selectedFile ? titleSource : 'media'}
                {!selectedFile ?  <span className='font-thin px-5'>&middot;</span>:
                  <span className='font-thin px-5'>&rarr;</span>}
                {!selectedFile  ? 'converter' : targetFormat}
              </h1>
            </div>
            <button onClick={handleSelectFile} className='font-mono'>{selectedFile ? `select ${sourceLabel}` : 'browse files'}</button>
          </div>

          <div className='mb-4 tracking-widest flex items-center space-x-4 font-mono font-thin opacity-70'>
            <span>WAV</span>
            <span>MP3</span>
            <span>MP4</span>
            <span>M4A</span>
          </div>

          <div className='mb-6 hidden'>
            <input ref={inputFileRef} type='file' accept={mediaInputAccept} onChange={handleFileSelect} />
            <input ref={thumbnailInputRef} type='file' accept='image/*' onChange={handleThumbnailSelect} />
          </div>

          {selectedFile && !isConverting && !convertedUrl && (
            <div className='p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='flex-1'>
                  <p className='font-semibold tracking-tight text-base'>{selectedFile.name}</p>
                  <div className='flex items-center space-x-4 font-space'>
                    <div className='text-sm flex items-center'>
                      <Icon name='floppy-disk' className='size-4 mr-1 opacity-80' />
                      <span>{formatBytes(selectedFile.size)}</span>
                    </div>
                    <div className='text-sm flex items-center'>
                      <Icon name='clock' className='size-4 mr-1 opacity-80' />
                      <span>{secondsToTime(mediaDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedFile && !isConverting && !convertedUrl && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <label className='block text-base font-semibold tracking-tight'>Output Format</label>
                <p className='text-xs opacity-80 tracking-tight'>
                  {direction === 'video-to-video'
                    ? 'Trim MP4 without re-encoding.'
                    : direction === 'video-to-audio'
                      ? 'Extract audio from MP4.'
                      : 'MP4 can include a still thumbnail.'}
                </p>
              </div>

              <div className={cn('grid gap-3', selectedFileFormat === 'mp4' ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4')}>
                {outputFormatOptions.map((format) => (
                  <button
                    key={format}
                    onClick={() => {
                      setOutputFormat(format)
                      if (selectedFileFormat) {
                        setDirection(getDirectionForConversion(selectedFileFormat, format))
                      }
                    }}
                    className={cn(
                      'h-12 rounded-xl border text-lg uppercase tracking-tight transition-colors font-semibold',
                      {
                        'bg-cyan-500/30 border-cyan-500/50': outputFormat === format
                      }
                    )}>
                    {format}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedFile && direction === 'audio-to-audio' && outputFormat === 'mp4' && !isConverting && !convertedUrl && (
            <div className='mb-6 p-4 border rounded-xl'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-4 min-w-0'>
                  {thumbnailPreviewUrl && (
                    <Image
                      src={thumbnailPreviewUrl}
                      alt=''
                      width={64}
                      height={64}
                      unoptimized
                      className='size-16 shrink-0 rounded-lg border object-cover'
                    />
                  )}
                  <div className='min-w-0'>
                    <p className='text-base font-semibold tracking-tight'>Thumbnail</p>
                    <p className='text-xs opacity-80 tracking-tight truncate'>
                      {thumbnailFile ? thumbnailFile.name : 'Optional image for the MP4 video frame'}
                    </p>
                  </div>
                </div>
                <button onClick={handleSelectThumbnail} className='px-4 py-2 rounded-xl bg-cyan-500/30'>
                  Select Image
                </button>
              </div>
            </div>
          )}

          {selectedFile && !isConverting && !convertedUrl && (
            <div className='mb-6 p-4'>
              <label className='block mb-3 text-base font-semibold tracking-tight'>
                Trim Media <span className='px-2 opacity-60 font-light'>Optional</span>
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs mb-1'>Start Time</label>
                  <ModernInput
                    type='text'
                    value={trimStart}
                    onChange={(e) => setTrimStart(e.target.value)}
                    placeholder='00:00:00'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-3xl'
                  />
                </div>
                <div>
                  <label className='block text-xs mb-1'>End Time</label>
                  <ModernInput
                    type='text'
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(e.target.value)}
                    placeholder='00:00:00'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>
              <div className='flex items-center space-x-4 py-2'>
                <p className='text-xs mt-2 font-medium tracking-tight'>
                  Format: <span className='font-normal opacity-80'>HH:MM:SS</span>
                </p>
                {trimStart && trimEnd && validateTimeFormat(trimStart) && validateTimeFormat(trimEnd) && (
                  <p className='text-xs mt-2 font-medium tracking-tight'>
                    Trimmed Duration:{' '}
                    <span className='font-normal opacity-80'>
                      {secondsToTime(timeToSeconds(trimEnd) - timeToSeconds(trimStart))}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedFile && !isConverting && !convertedUrl && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <label className='block text-base font-semibold tracking-tight'>
                  {isVideoTrim ? 'Trim MP4' : qualityDisabled ? 'Convert Audio' : 'Select Audio Quality'}
                </label>
                <p className='text-xs opacity-80 tracking-tight'>
                  {isVideoTrim
                    ? 'Keeps the original video and audio streams.'
                    : qualityDisabled
                      ? 'WAV uses uncompressed PCM audio.'
                      : 'Higher bitrate means a larger file.'}
                </p>
              </div>

              {isVideoTrim ? (
                <button
                  onClick={() => handleConvert('copy')}
                  className='w-full text-lg tracking-tight h-14 bg-cyan-500/30 rounded-xl hover:bg-cyan-700 transition-colors font-semibold shadow-sm hover:shadow-md'>
                  Trim MP4
                </button>
              ) : qualityDisabled ? (
                <button
                  onClick={() => handleConvert('pcm')}
                  className='w-full text-lg tracking-tight h-14 bg-cyan-500/30 rounded-xl hover:bg-cyan-700 transition-colors font-semibold shadow-sm hover:shadow-md'>
                  Convert WAV
                </button>
              ) : (
                <div className='grid grid-cols-3 gap-3'>
                  {bitrates.map((bitrate) => (
                    <button
                      key={bitrate}
                      onClick={() => handleConvert(`${bitrate}k`)}
                      className='text-lg tracking-tight flex flex-col justify-center h-14 bg-cyan-500/30 rounded-xl hover:bg-cyan-700 transition-colors font-semibold shadow-sm hover:shadow-md'>
                      <p className='leading-3 opacity-80'>
                        <span className='font-extrabold'>{bitrate}</span>
                        kbps
                      </p>
                      <span className='text-xs uppercase font-normal tracking-normal'>
                        {bitrate === '128' ? 'Low' : bitrate === '192' ? 'Med' : 'High'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isConverting && progress && (
            <div className='mb-6'>
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-3'>
                  <Icon name='spinners-ring' />
                  <span className='font-medium tracking-tighter text-base'>{getPhaseLabel(progress.phase)}</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <ProgressBar progress={progress.percentage} />
                </div>
                <div className='text-sm font-space mt-2 flex items-end'>
                  <div className='w-5 h-5 aspect-square font-medium'>
                    <AnimatedNumber value={progress.percentage} precision={0} />
                  </div>
                  <div
                    className={cn('h-5 text-sm transition-transform duration-200 ease-in-out -translate-x-2', {
                      'translate-x-0': progress.percentage > 9
                    })}>
                    %
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <Icon name='alert-02' className='w-5 h-5 text-red-600 mt-0.5' />
                <div>
                  <p className='font-medium text-red-800'>Conversion Failed</p>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              </div>
            </div>
          )}

          {convertedUrl && stats && (
            <div className='flex items-start justify-between gap-6'>
              <div className='space-y-4'>
                <div className='p-4'>
                  <div className='flex items-start gap-3'>
                    <Icon name='check-ring' className='w-5 h-5 text-emerald-500 mt-0.5' />
                    <div className='flex-1'>
                      <p className='font-medium tracking-tighter'>Conversion Complete!</p>
                      <div className='mt-2 space-y-1 text-sm tracking-tight'>
                        <p>Original Size: {formatBytes(stats.originalSize)}</p>
                        <p>
                          {stats.format.toUpperCase()} Size: {formatBytes(stats.newSize)}
                        </p>
                        <p>Bitrate: {stats.bitrate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className='w-full py-2'>
                  <p className='text-sm font-medium tracking-tighter mb-2'>Preview your {stats.format}</p>
                  {stats.previewType === 'video' ? (
                    <video controls src={convertedUrl} className='w-full h-32 border rounded-lg' />
                  ) : (
                    <audio controls src={convertedUrl} className='w-full h-10 border rounded-lg'>
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
                <button
                  onClick={handleDownload}
                  className='w-full flex items-center justify-center tracking-tighter gap-2 px-6 py-3 bg-linear-to-r from-cyan-600 to-cyan-500 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-700 transition-all font-medium shadow-lg hover:shadow-xl'>
                  <Icon name='download' className='w-5 h-5' />
                  Download {stats.format.toUpperCase()}
                </button>

                <button onClick={resetConversion} className='w-full px-6 py-3 rounded-lg transition-colors font-medium tracking-tighter'>
                  Convert Another File
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
