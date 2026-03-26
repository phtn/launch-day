import { AnimatedNumber } from '@/components/animated-number'
import { ModernInput } from '@/components/input'
import type { ConversionResult } from '@/hooks/use-audio-converter'
import { ConversionProgress, useAudioConverter } from '@/hooks/use-audio-converter'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { ProgressBar } from './progress-card'

export const AudioConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState<ConversionProgress | null>(null)
  const [convertedUrl, setConvertedUrl] = useState<string>('')
  const [stats, setStats] = useState<{
    originalSize: number
    newSize: number
    bitrate: string
  } | null>(null)
  const [error, setError] = useState<string>('')
  const [trimStart, setTrimStart] = useState<string>('00:00:05')
  const [trimEnd, setTrimEnd] = useState<string>('00:00:15')
  const [videoDuration, setVideoDuration] = useState<number>(0)

  const { convert } = useAudioConverter()

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map((p) => parseInt(p, 10) || 0)
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

  const validateTimeFormat = (time: string): boolean => {
    const regex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/
    return regex.test(time)
  }

  const getPhaseLabel = (phase: string): string => {
    const labels: Record<string, string> = {
      loading: 'Loading file...',
      extracting: 'Extracting audio...',
      encoding: 'Encoding to MP3...',
      complete: 'Complete!'
    }
    return labels[phase] || phase
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.includes('video')) {
        setError('Please select a video file (MP4, MOV, AVI, etc.)')
        return
      }

      setSelectedFile(file)
      setConvertedUrl('')
      setStats(null)
      setError('')
      setProgress(null)
      setTrimStart('00:00:00')
      setVideoDuration(0)

      // Get video duration
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration)
        setVideoDuration(duration)
        setTrimEnd(secondsToTime(duration))
        URL.revokeObjectURL(video.src)
      }

      video.onerror = () => {
        setError('Failed to load video metadata')
        URL.revokeObjectURL(video.src)
      }

      const url = URL.createObjectURL(file)
      video.src = url

      // Force load metadata
      video.load()
    }
  }

  const handleConvert = async (bitrate: string) => {
    if (!selectedFile) return

    // Validate trim times
    if (!validateTimeFormat(trimStart) || !validateTimeFormat(trimEnd)) {
      setError('Invalid time format. Use HH:MM:SS (e.g., 00:01:30)')
      return
    }

    const startSeconds = timeToSeconds(trimStart)
    const endSeconds = timeToSeconds(trimEnd)

    if (startSeconds >= endSeconds) {
      setError('Start time must be before end time')
      return
    }

    if (endSeconds > videoDuration) {
      setError('End time cannot exceed video duration')
      return
    }

    setIsConverting(true)
    setError('')
    setProgress({ phase: 'loading', percentage: 0 })

    try {
      const { result, onProgress } = await convert(selectedFile, {
        bitrate,
        trimStart,
        trimEnd
      })

      onProgress((prog) => {
        setProgress(prog)
      })

      // result is a promise that resolves when conversion completes
      const conversionResult = await (result as unknown as Promise<ConversionResult>)
      const url = URL.createObjectURL(conversionResult.blob)
      setConvertedUrl(url)
      setStats({
        originalSize: selectedFile.size,
        newSize: conversionResult.size,
        bitrate: conversionResult.bitrate
      })
    } catch (err) {
      console.error('Conversion error:', err)
      setError(err instanceof Error ? err.message : 'Failed to convert video')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedUrl || !selectedFile) return

    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = selectedFile.name.replace(/\.[^/.]+$/, '') + '.mp3'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const inputFileRef = useRef<HTMLInputElement>(null)

  const handleSelectFile = () => {
    inputFileRef.current?.click()
  }

  return (
    <div className='h-fit bg-linear-to-br from-emerald-50/10 to-cyan-50/5 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='border border-dark-origin rounded-3xl shadow-xl p-8 '>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tighter'>
                mp4 <span className='font-thin px-2'>&rarr;</span> mp3
              </h1>
            </div>
            <button onClick={handleSelectFile}>Select File</button>
          </div>

          <p className='mb-4 tracking-tighter'>In-browser File Conversion</p>

          {/* File Upload */}
          <div className='mb-6 hidden'>
            <input
              ref={inputFileRef}
              type='file'
              accept='video/*'
              onChange={handleFileSelect}
              className='w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer'
            />
          </div>

          {/* Selected File Info */}
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
                      <span>{secondsToTime(videoDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trim Controls */}
          {selectedFile && !isConverting && !convertedUrl && (
            <div className='mb-6 p-4'>
              <label className='block mb-3 text-base font-semibold tracking-tight'>
                Trim Audio <span className='px-2 opacity-60 font-light'>Optional</span>
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

          {/* Bitrate Selection */}
          {selectedFile && !isConverting && !convertedUrl && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4 '>
                <label className='block text-base font-semibold tracking-tight'>Select Audio Quality</label>
                <p className='text-xs opacity-80 tracking-tight'>
                  Higher bitrate = better quality but larger file size
                </p>
              </div>

              <div className='grid grid-cols-3 gap-3'>
                {['128', '192', '320'].map((bitrate) => (
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
            </div>
          )}

          {/*<div className='py-2'>
            <ProgressBar progress={56} />
          </div>*/}

          {/* Progress */}
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

          {/* Error */}
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

          {/* Success & Download */}

          {convertedUrl && stats && (
            <div className='flex items-start justify-between'>
              <div className='space-y-4'>
                <div className='p-4'>
                  <div className='flex items-start gap-3'>
                    <Icon name='check-ring' className='w-5 h-5 text-emerald-500 mt-0.5' />
                    <div className='flex-1'>
                      <p className='font-medium tracking-tighter'>Conversion Complete!</p>
                      <div className='mt-2 space-y-1 text-sm tracking-tight'>
                        <p>Original Size: {formatBytes(stats.originalSize)}</p>
                        <p>MP3 Size: {formatBytes(stats.newSize)}</p>
                        <p>Bitrate: {stats.bitrate}bps</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Audio Preview */}
                <div className='w-full py-2'>
                  <p className='text-sm font-medium tracking-tighter mb-2'>Play your mp3</p>
                  <audio controls src={convertedUrl} className='w-full h-10 border rounded-lg'>
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <button
                  onClick={handleDownload}
                  className='w-full flex items-center justify-center tracking-tighter gap-2 px-6 py-3 bg-linear-to-r from-cyan-600 to-cyan-500 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-700 transition-all font-medium shadow-lg hover:shadow-xl'>
                  <Icon name='download' className='w-5 h-5' />
                  Download MP3
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setConvertedUrl('')
                    setStats(null)
                    setProgress(null)
                    setTrimStart('00:00:00')
                    setTrimEnd('')
                    setVideoDuration(0)
                    setError('')
                    if (inputFileRef.current) {
                      inputFileRef.current.value = ''
                    }
                  }}
                  className='w-full px-6 py-3 rounded-lg transition-colors font-medium tracking-tighter'>
                  Convert Another File
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className='mt-8 p-4 border-t'>
            <h3 className='font-semibold mb-2 tracking-tight font-base'>How it works:</h3>
            <ul className='text-sm space-y-1 opacity-80'>
              <li>• All conversion happens in your browser using Web Workers</li>
              <li>• Your files never leave your device</li>
              <li>• Supports MP4, MOV, AVI, and other video formats</li>
              <li>• Choose your preferred audio quality (bitrate)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
