// hooks/useImageConverter.ts
import { useCallback, useEffect, useRef, useState } from 'react'

interface ConversionOptions {
  format: 'avif' | 'webp' | 'jpeg'
  quality?: number
}

interface ConversionResult {
  blob: Blob
  size: number
  format: string
  originalSize: number
  compressionRatio: number
}

export const useImageConverter = () => {
  const [converting, setConverting] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../public/workers/image-converter.worker.ts', import.meta.url))
    }
    return workerRef.current
  }, [])

  const convert = useCallback(
    async (file: File, options: ConversionOptions): Promise<ConversionResult> => {
      setConverting(true)

      return new Promise((resolve, reject) => {
        const worker = initWorker()

        // Load the image file
        const reader = new FileReader()

        reader.onload = async (e: ProgressEvent<FileReader>) => {
          let imageBitmap: ImageBitmap | null = null
          let canvas: HTMLCanvasElement | null = null
          
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer
            if (!arrayBuffer) {
              setConverting(false)
              throw new Error('Failed to read file')
            }

            // Create an image bitmap from the file
            const blob = new Blob([arrayBuffer], { type: file.type })
            imageBitmap = await createImageBitmap(blob)

            // Create a canvas to extract ImageData
            canvas = document.createElement('canvas')
            canvas.width = imageBitmap.width
            canvas.height = imageBitmap.height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
              setConverting(false)
              throw new Error('Failed to get canvas context')
            }

            ctx.drawImage(imageBitmap, 0, 0)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            // Set up worker message handler
            const handleMessage = (event: MessageEvent) => {
              // Clean up event listeners
              worker.removeEventListener('message', handleMessage)
              worker.removeEventListener('error', handleError)
              
              // Clean up resources
              if (imageBitmap) {
                imageBitmap.close()
              }
              canvas = null
              
              if ('error' in event.data) {
                setConverting(false)
                reject(new Error(event.data.error))
              } else {
                const result: ConversionResult = {
                  ...event.data,
                  originalSize: file.size,
                  compressionRatio: ((file.size - event.data.size) / file.size) * 100
                }

                resolve(result)
              }
              setConverting(false)
            }

            const handleError = (error: ErrorEvent) => {
              // Clean up event listeners
              worker.removeEventListener('message', handleMessage)
              worker.removeEventListener('error', handleError)
              
              // Clean up resources
              if (imageBitmap) {
                imageBitmap.close()
              }
              canvas = null
              
              setConverting(false)
              reject(error)
            }

            worker.addEventListener('message', handleMessage)
            worker.addEventListener('error', handleError)

            // Send to worker
            worker.postMessage({
              imageData,
              format: options.format,
              quality: options.quality
            })
          } catch (error) {
            // Clean up resources on error
            if (imageBitmap) {
              imageBitmap.close()
            }
            canvas = null
            
            setConverting(false)
            reject(error)
          }
        }

        reader.onerror = () => {
          setConverting(false)
          reject(new Error('Failed to read file'))
        }
        reader.readAsArrayBuffer(file)
      })
    },
    [initWorker]
  )

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      terminate()
    }
  }, [terminate])

  return { convert, terminate, converting, setConverting }
}
