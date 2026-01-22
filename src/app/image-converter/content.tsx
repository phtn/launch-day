'use client'

import { Dock } from '@/components/dock'
import { useImageConverter } from '@/hooks/use-image-converter'
import { Icon } from '@/lib/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageConverter } from './image-converter'

export interface ConversionStats {
  originalSize: number
  newSize: number
  compressionRatio: number
}

export type ConversionFormat = 'avif' | 'webp' | 'jpeg'

export const Content = () => {
  const [file, setFile] = useState<File | null>(null)
  const [convertedUrl, setConvertedUrl] = useState<string>('')
  const [stats, setStats] = useState<ConversionStats | null>(null)
  const [convertedFormat, setConvertedFormat] = useState<ConversionFormat | null>(null)
  const inputFileRef = useRef<HTMLInputElement | null>(null)
  const browseFile = () => {
    inputFileRef.current?.click()
  }

  const { convert, converting, setConverting } = useImageConverter()

  const handleConvert = useCallback(
    async (format: ConversionFormat) => {
      if (!file) return

      try {
        const result = await convert(file, {
          format,
          quality: 0.8
        })

        // Revoke old converted URL to prevent memory leak
        if (convertedUrl) {
          URL.revokeObjectURL(convertedUrl)
        }
        
        const url = URL.createObjectURL(result.blob)
        setConvertedUrl(url)
        setConvertedFormat(format)
        setStats({
          originalSize: result.originalSize,
          newSize: result.size,
          compressionRatio: result.compressionRatio
        })
      } catch (error) {
        console.error('Conversion error:', error)
        alert('Failed to convert image')
      } finally {
        setConverting(false)
      }
    },
    [file, convert, setConverting, convertedUrl]
  )

  const handleDownload = useCallback(() => {
    if (!convertedUrl || !file || !convertedFormat) return

    const link = document.createElement('a')
    link.href = convertedUrl

    // Generate filename: original name without extension + new extension
    const originalName = file.name.replace(/\.[^/.]+$/, '')
    const extension = convertedFormat === 'jpeg' ? 'jpg' : convertedFormat
    link.download = `${originalName}.${extension}`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [convertedUrl, file, convertedFormat])

  const convertTrigger = useCallback(
    (mime: 'avif' | 'webp' | 'jpeg') => () => {
      if (file) {
        handleConvert(mime)
      }
    },
    [handleConvert, file]
  )

  // Cleanup converted URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl)
      }
    }
  }, [convertedUrl])

  // Cleanup converted URL when file is cleared
  useEffect(() => {
    if (!file && convertedUrl) {
      URL.revokeObjectURL(convertedUrl)
      setConvertedUrl('')
    }
  }, [file, convertedUrl])

  return (
    <main className='h-screen'>
      <div className='text-white pt-12 md:pt-16 md:px-12 size-full'>
        {/*<div className='px-4 h-12 flex items-center justify-between border-b border-x border-base-300'></div>*/}
        <ImageConverter
          file={file}
          setFile={setFile}
          inputFileRef={inputFileRef}
          converting={converting}
          convertedUrl={convertedUrl}
          setConvertedUrl={setConvertedUrl}
          setStats={setStats}
          stats={stats}
          onDownload={handleDownload}
        />
      </div>
      <Dock>
        {/*<button className='dock-xs'>Image Converter </button>*/}
        <div className='flex items-center'>
          <h1 className='md:min-w-40 px-6 text-xl whitespace-nowrap tracking-tighter leading-7 font-bold font-sans'>
            Image Converter
          </h1>
        </div>
        <button onClick={browseFile} className='min-w-40 btn btn-soft btn-sm md:btn-md font-sans'>
          {file ? (
            <div className='flex items-center space-x-2'>
              <span className='text-orange-50 whitespace-nowrap'>
                ...{file.name.substring(file.name.length - 10, file.name.length)}
              </span>
              <Icon name='close' className='text-red-300 size-4' />
            </div>
          ) : (
            'Select Image'
          )}
        </button>
        <div className='w-full flex' />
        <div className='w-full flex' />
        <div className='w-full flex' />
        <div className='w-full flex' />
        <p className='tracking-tight font-medium'>Convert to </p>
        <button
          onClick={convertTrigger('avif')}
          disabled={converting}
          className='flex flex-1 btn btn-md font-normal font-space px-2 bg-emerald-300 text-base-300 rounded hover:bg-emerald-400 disabled:bg-gray-400'>
          <span className='font-bone'>AVIF</span>
        </button>

        <button
          onClick={convertTrigger('jpeg')}
          disabled={converting}
          className='btn btn-md font-normal font-space px-2 bg-emerald-100 text-base-100 rounded hover:bg-emerald-200 disabled:bg-gray-400'>
          <span className='font-bone'>JPEG</span>
        </button>
        <button
          onClick={convertTrigger('webp')}
          disabled={converting}
          className='btn btn-md font-normal font-space px-2 bg-emerald-50 text-base-300 rounded hover:bg-emerald-100 disabled:bg-gray-400'>
          <span className='font-bone'>WebP</span>
        </button>
        <button
          onClick={handleDownload}
          disabled={converting || !convertedUrl}
          className='btn btn-md font-normal font-space px-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-200/20'>
          <span className='font-bone'>Download</span>
        </button>
      </Dock>
    </main>
  )
}
