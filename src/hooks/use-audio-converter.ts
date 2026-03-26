import {useCallback, useRef} from 'react'

export interface ConversionProgress {
  phase: 'loading' | 'extracting' | 'encoding' | 'complete'
  percentage: number
}

export interface ConversionResult {
  blob: Blob
  duration: number
  size: number
  bitrate: string
}

export const useAudioConverter = () => {
  const workerRef = useRef<Worker | null>(null)

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL(
          '../../public/workers/audio-converter.worker.ts',
          import.meta.url,
        ),
      )
    }
    return workerRef.current
  }, [])

  const convert = useCallback(
    async (
      file: File,
      options: {bitrate: string; trimStart?: string; trimEnd?: string},
    ): Promise<{
      result: ConversionResult
      onProgress: (callback: (progress: ConversionProgress) => void) => void
    }> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker()
        let progressCallback: ((progress: ConversionProgress) => void) | null =
          null

        let resultPromise: Promise<ConversionResult> | null = null
        let resultResolve: ((result: ConversionResult) => void) | null = null
        let resultReject: ((error: Error) => void) | null = null

        // Set up progress callback first - this allows setting callback before conversion starts
        const onProgress = (
          callback: (progress: ConversionProgress) => void,
        ) => {
          progressCallback = callback
          // Immediately notify of initial state
          progressCallback({phase: 'loading', percentage: 0})

          // Start conversion if not already started
          if (!resultPromise) {
            resultPromise = new Promise<ConversionResult>((resolve, reject) => {
              resultResolve = resolve
              resultReject = reject
              startConversion()
            })
          }
        }

        // Resolve immediately so onProgress can be set up before conversion starts
        // The result will be a promise that resolves when conversion completes
        resolve({
          result: (async () => {
            // Wait a tiny bit for onProgress to be called
            await new Promise((resolve) => setTimeout(resolve, 10))
            if (!resultPromise) {
              // If onProgress was never called, start conversion anyway
              resultPromise = new Promise<ConversionResult>(
                (resolve, reject) => {
                  resultResolve = resolve
                  resultReject = reject
                  startConversion()
                },
              )
            }
            return await resultPromise
          })() as unknown as ConversionResult, // Type assertion - component will await it
          onProgress,
        })

        const startConversion = () => {
          const reader = new FileReader()
          let audioContext: AudioContext | null = null

          reader.onload = async (e: ProgressEvent<FileReader>) => {
            try {
              progressCallback?.({phase: 'loading', percentage: 0})

              const arrayBuffer = e.target?.result as ArrayBuffer
              if (!arrayBuffer) {
                throw new Error('Failed to read file')
              }

              // Try to decode audio directly first (works for some formats)
              let audioBuffer: AudioBuffer
              audioContext = new (window.AudioContext ||
                (window as unknown as {webkitAudioContext: typeof AudioContext})
                  .webkitAudioContext)()

              try {
                audioBuffer = await audioContext.decodeAudioData(
                  arrayBuffer.slice(0),
                )
                progressCallback?.({phase: 'extracting', percentage: 1})
              } catch (decodeError) {
                // If direct decode fails, use video element to extract audio
                progressCallback?.({phase: 'extracting', percentage: 1})

                const video = document.createElement('video')
                video.preload = 'auto'
                video.muted = false // Don't mute - we need audio!
                video.crossOrigin = 'anonymous'
                video.volume = 0 // Set volume to 0 instead of muting

                const videoUrl = URL.createObjectURL(file)

                // Wait for video to be ready
                await new Promise<void>((resolve, reject) => {
                  video.onloadedmetadata = () => {
                    if (video.readyState >= 2) {
                      resolve()
                    } else {
                      video.oncanplay = () => resolve()
                    }
                  }
                  video.onerror = () =>
                    reject(new Error('Failed to load video'))
                  video.src = videoUrl
                })

                const videoDuration = video.duration
                if (!videoDuration || isNaN(videoDuration)) {
                  URL.revokeObjectURL(videoUrl)
                  throw new Error('Invalid video duration')
                }

                // Ensure audio context is running
                if (audioContext.state === 'suspended') {
                  await audioContext.resume()
                }

                // Use AudioContext with AudioWorkletNode (modern API) to capture audio
                const source = audioContext.createMediaElementSource(video)

                progressCallback?.({phase: 'extracting', percentage: 2})

                // Load the AudioWorklet processor
                try {
                  await audioContext.audioWorklet.addModule(
                    '/workers/audio-capture-processor.js',
                  )
                  console.log('AudioWorklet processor loaded successfully')
                } catch (workletError) {
                  console.error('Failed to load AudioWorklet:', workletError)
                  URL.revokeObjectURL(videoUrl)
                  throw new Error(
                    `Failed to load AudioWorklet processor: ${workletError instanceof Error ? workletError.message : 'Unknown error'}. Make sure /workers/audio-capture-processor.js is accessible.`,
                  )
                }

                // progressCallback?.({phase: 'extracting', percentage: 30})

                // Create AudioWorkletNode
                const workletNode = new AudioWorkletNode(
                  audioContext,
                  'audio-capture-processor',
                )

                let initialized = false

                // Set up handler for final audio data BEFORE starting playback
                const finalDataPromise = new Promise<{
                  channels: Float32Array[][]
                  channelCount: number
                  sampleRate: number
                }>((resolve, reject) => {
                  // const channelCount = 0
                  // let sampleRate = 0
                  const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for audio data'))
                  }, 60000) // 60 second timeout

                  const messageHandler = (event: MessageEvent) => {
                    const {
                      type,
                      // channelCount,
                      // sampleRate: sr,
                    } = event.data as {
                      type: string
                      channelCount: number
                      sampleRate: number
                    }

                    // console.log('AudioWorklet message:', type, {channelCount, sr})

                    if (type === 'initialized') {
                      // channelCount = channelCount ?? 0
                      // sampleRate = sr
                      initialized = true
                      progressCallback?.({phase: 'extracting', percentage: 2})
                    } else if (type === 'finalAudioData') {
                      console.log('Received final audio data:', {
                        channelCount: event.data.channelCount,
                        sampleRate: event.data.sampleRate,
                        chunksPerChannel: event.data.channels.map(
                          (ch: unknown[]) => ch.length,
                        ),
                      })
                      clearTimeout(timeout)
                      workletNode.port.removeEventListener(
                        'message',
                        messageHandler,
                      )
                      resolve(event.data)
                    }
                  }

                  workletNode.port.addEventListener('message', messageHandler)
                })

                source.connect(workletNode)
                workletNode.connect(audioContext.destination)

                // progressCallback?.({phase: 'extracting', percentage: 21})

                // Start playback
                try {
                  await video.play()
                  console.log('Video playing, duration:', video.duration)
                  // progressCallback?.({phase: 'extracting', percentage: 34})
                } catch (playError) {
                  console.error('Video play error:', playError)
                  URL.revokeObjectURL(videoUrl)
                  workletNode.disconnect()
                  source.disconnect()
                  throw new Error(
                    'Failed to play video (autoplay may be blocked)',
                  )
                }

                // Update progress as video plays
                const progressInterval = setInterval(() => {
                  if (video.duration && !isNaN(video.duration)) {
                    const progress = Math.min(
                      90,
                      35 + (video.currentTime / video.duration) * 55,
                    )
                    progressCallback?.({
                      phase: 'extracting',
                      percentage: progress,
                    })
                  }
                }, 100)

                // Wait for video to finish
                await new Promise<void>((resolve, reject) => {
                  video.onended = () => {
                    console.log('Video ended')
                    clearInterval(progressInterval)
                    resolve()
                  }
                  video.onerror = (error) => {
                    console.error('Video error:', error)
                    clearInterval(progressInterval)
                    reject(new Error('Video playback error'))
                  }
                  // Safety timeout
                  setTimeout(
                    () => {
                      if (!video.ended) {
                        console.log(
                          'Video timeout, currentTime:',
                          video.currentTime,
                          'duration:',
                          video.duration,
                        )
                        clearInterval(progressInterval)
                        resolve() // Resolve anyway to continue processing
                      }
                    },
                    (videoDuration + 5) * 1000,
                  )
                })

                // progressCallback?.({phase: 'extracting', percentage: 90})

                // Wait a bit for final audio processing
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Request final audio data from worklet
                workletNode.port.postMessage({type: 'getAudioData'})
                console.log('Requested audio data from worklet')

                // Get the final data
                let finalData
                try {
                  finalData = await finalDataPromise
                } catch (error) {
                  console.error('Error getting final audio data:', error)
                  // Check if we at least got initialization
                  if (!initialized) {
                    throw new Error(
                      'AudioWorklet never initialized. Make sure the video has an audio track and AudioWorklet is supported.',
                    )
                  }
                  throw error
                }

                // Clean up
                workletNode.disconnect()
                source.disconnect()
                URL.revokeObjectURL(videoUrl)

                // Combine all chunks into single Float32Arrays
                // Note: chunks come as regular arrays from postMessage
                const combinedChannels: Float32Array[] = []
                for (let ch = 0; ch < finalData.channelCount; ch++) {
                  const chunks = finalData.channels[ch] || []
                  if (chunks.length === 0) continue

                  const totalLength = chunks.reduce(
                    (sum, chunk) =>
                      sum +
                      (Array.isArray(chunk) ? chunk.length : chunk.length),
                    0,
                  )
                  const combined = new Float32Array(totalLength)
                  let offset = 0
                  for (const chunk of chunks) {
                    // Convert array back to Float32Array if needed
                    const floatChunk = Array.isArray(chunk)
                      ? new Float32Array(chunk)
                      : chunk
                    combined.set(floatChunk, offset)
                    offset += floatChunk.length
                  }
                  combinedChannels.push(combined)
                }

                const length = combinedChannels[0]?.length ?? 0
                console.log('Combined audio data:', {
                  channelCount: combinedChannels.length,
                  length,
                  sampleRate: finalData.sampleRate,
                })

                if (length === 0) {
                  throw new Error(
                    'No audio data captured from video. Make sure the video has an audio track.',
                  )
                }

                audioBuffer = audioContext.createBuffer(
                  finalData.channelCount,
                  length,
                  finalData.sampleRate,
                )
                for (let ch = 0; ch < finalData.channelCount; ch++) {
                  if (combinedChannels[ch]) {
                    audioBuffer.getChannelData(ch).set(combinedChannels[ch])
                  }
                }

                // progressCallback?.({phase: 'extracting', percentage: 30})
              }

              // Extract audio samples (use actual buffer properties)
              const actualChannelCount = audioBuffer.numberOfChannels
              const actualSampleRate = audioBuffer.sampleRate
              // const duration = audioBuffer.duration

              // Handle trimming
              let startSample = 0
              let endSample = audioBuffer.length

              if (options.trimStart || options.trimEnd) {
                const timeToSeconds = (time: string): number => {
                  const parts = time.split(':').map((p) => parseInt(p, 10) ?? 0)
                  if (parts.length === 3) {
                    return parts[0] * 3600 + parts[1] * 60 + parts[2]
                  }
                  return 0
                }

                if (options.trimStart) {
                  const startSeconds = timeToSeconds(options.trimStart)
                  startSample = Math.floor(startSeconds * actualSampleRate)
                }

                if (options.trimEnd) {
                  const endSeconds = timeToSeconds(options.trimEnd)
                  endSample = Math.floor(endSeconds * actualSampleRate)
                }

                startSample = Math.max(
                  0,
                  Math.min(startSample, audioBuffer.length),
                )
                endSample = Math.max(
                  startSample,
                  Math.min(endSample, audioBuffer.length),
                )
              }

              // Extract samples for each channel
              const samples: Float32Array[] = []
              for (let ch = 0; ch < actualChannelCount; ch++) {
                const channelData = audioBuffer.getChannelData(ch)
                const sampleData = channelData.subarray(startSample, endSample)
                samples.push(sampleData)
              }

              // Validate samples before sending to worker
              if (samples.length === 0) {
                throw new Error('No audio samples extracted')
              }

              if (!samples[0] || samples[0].length === 0) {
                throw new Error('First audio channel is empty')
              }

              const trimmedDuration =
                (endSample - startSample) / actualSampleRate

              // progressCallback?.({phase: 'encoding', percentage: 50})

              const handleMessage = (event: MessageEvent) => {
                try {
                  // Validate event exists and has data
                  if (!event) {
                    console.error('Worker message event is null/undefined')
                    if (resultReject) {
                      resultReject(
                        new Error('Worker message event is null/undefined'),
                      )
                    }
                    return
                  }

                  if (!event.data) {
                    console.error('Worker message has no data property:', {
                      event,
                      eventType: typeof event,
                      eventKeys: event ? Object.keys(event) : [],
                    })
                    if (resultReject) {
                      resultReject(
                        new Error('Worker message has no data property'),
                      )
                    }
                    return
                  }

                  const data = event.data

                  // Check if data is an array (unexpected but possible)
                  if (Array.isArray(data)) {
                    console.error(
                      'Worker message data is an array (unexpected):',
                      data,
                    )
                    if (resultReject) {
                      resultReject(
                        new Error('Worker returned array instead of object'),
                      )
                    }
                    return
                  }

                  // Validate data has type property
                  if (!data.type) {
                    console.error(
                      'Worker message data has no type property:',
                      data,
                    )
                    if (resultReject) {
                      resultReject(
                        new Error('Worker message has no type property'),
                      )
                    }
                    return
                  }

                  console.log('Worker message received:', {
                    type: data.type,
                    keys: Object.keys(data),
                    hasBlob: 'blob' in data,
                  })

                  if (data.type === 'progress') {
                    progressCallback?.(data)
                  } else if (data.type === 'complete') {
                    // Validate complete message has required fields
                    if (!data.blob) {
                      console.error(
                        'Worker complete message missing blob:',
                        data,
                      )
                      if (resultReject) {
                        resultReject(
                          new Error(
                            'Worker returned incomplete data: missing blob',
                          ),
                        )
                      }
                      return
                    }

                    const result: ConversionResult = {
                      blob: data.blob,
                      duration: trimmedDuration,
                      size: data.size || 0,
                      bitrate: data.bitrate || options.bitrate,
                    }
                    progressCallback?.({phase: 'complete', percentage: 100})
                    worker.removeEventListener('message', handleMessage)
                    if (audioContext) {
                      audioContext.close()
                    }
                    // Resolve the result promise
                    if (resultResolve) {
                      resultResolve(result)
                    }
                  } else if (data.type === 'error') {
                    console.error('Worker error message received:', data)
                    console.error('Error data details:', {
                      type: data.type,
                      error: (data as {error?: unknown}).error,
                      errorType: typeof (data as {error?: unknown}).error,
                      allKeys: Object.keys(data),
                    })

                    worker.removeEventListener('message', handleMessage)
                    if (audioContext) {
                      audioContext.close()
                    }

                    // Safely extract error message
                    let errorMessage = 'Unknown worker error'
                    try {
                      const errorData = data as {error?: string | Error}
                      if (errorData.error) {
                        if (typeof errorData.error === 'string') {
                          errorMessage = errorData.error
                        } else if (errorData.error instanceof Error) {
                          errorMessage = errorData.error.message
                        } else {
                          errorMessage = String(errorData.error)
                        }
                      } else {
                        // Try to stringify the whole data object
                        errorMessage = `Worker error: ${JSON.stringify(data)}`
                      }
                    } catch (e) {
                      errorMessage = `Worker error (failed to parse): ${String(e)}`
                    }

                    if (resultReject) {
                      resultReject(new Error(errorMessage))
                    }
                  } else {
                    console.warn(
                      'Unknown worker message type:',
                      data.type,
                      data,
                    )
                  }
                } catch (error) {
                  console.error('Error handling worker message:', error, event)
                  if (resultReject) {
                    resultReject(
                      error instanceof Error
                        ? error
                        : new Error(
                            `Error processing worker message: ${String(error)}`,
                          ),
                    )
                  }
                }
              }

              const handleError = (error: ErrorEvent) => {
                reject(error)
                worker.removeEventListener('error', handleError)
                if (audioContext) {
                  audioContext.close()
                }
              }

              worker.addEventListener('message', handleMessage)
              worker.addEventListener('error', handleError)

              // Parse bitrate (remove 'k' suffix if present)
              const bitrateValue = parseInt(
                options.bitrate.replace('k', ''),
                10,
              )

              // Validate data before sending
              console.log('Sending to worker:', {
                sampleCount: samples.length,
                firstChannelLength:
                  samples.length > 0 && samples[0] ? samples[0].length : 0,
                sampleRate: actualSampleRate,
                bitrate: bitrateValue,
                allChannelsValid: samples.every((s) => s && s.length > 0),
              })

              // Double-check samples before sending
              if (samples.length === 0) {
                throw new Error('Cannot send empty samples array to worker')
              }

              if (!samples[0] || samples[0].length === 0) {
                throw new Error('First channel is empty or invalid')
              }

              try {
                // Convert Float32Arrays to regular arrays for postMessage
                // Float32Arrays might not serialize correctly
                const samplesAsArrays = samples.map((channel) =>
                  Array.from(channel),
                )

                console.log(
                  'Sending samples to worker (converted to arrays):',
                  {
                    channelCount: samplesAsArrays.length,
                    firstChannelLength: samplesAsArrays[0]?.length,
                    firstChannelType: typeof samplesAsArrays[0],
                    firstChannelIsArray: Array.isArray(samplesAsArrays[0]),
                  },
                )

                worker.postMessage({
                  samples: samplesAsArrays,
                  sampleRate: actualSampleRate,
                  bitrate: bitrateValue,
                  duration: trimmedDuration,
                })
              } catch (postError) {
                console.error('Error posting message to worker:', postError)
                throw new Error(
                  `Failed to send data to worker: ${postError instanceof Error ? postError.message : String(postError)}`,
                )
              }
            } catch (error) {
              if (audioContext) {
                audioContext.close()
              }
              reject(error)
            }
          }

          reader.onerror = () => {
            if (resultReject) {
              resultReject(new Error('Failed to read file'))
            }
          }
          reader.readAsArrayBuffer(file)
        }
      })
    },
    [initWorker],
  )

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return {convert, terminate}
}
