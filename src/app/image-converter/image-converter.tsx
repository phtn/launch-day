'use client'

import { Lens } from '@/components/lens'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import { ConversionStats } from './content'

interface Props {
  file: File | null
  setFile: Dispatch<SetStateAction<File | null>>
  inputFileRef: RefObject<HTMLInputElement | null>
  converting: boolean
  convertedUrl: string
  stats: ConversionStats | null
  setConvertedUrl: Dispatch<SetStateAction<string>>
  setStats: Dispatch<SetStateAction<ConversionStats | null>>
  onDownload: () => void
}

export const ImageConverter = ({
  file,
  setFile,
  inputFileRef,
  converting,
  convertedUrl,
  stats,
  setConvertedUrl,
  setStats,
  onDownload
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      // Revoke old preview URL to prevent memory leak
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setFile(f)
      setPreviewUrl(URL.createObjectURL(f))
      setConvertedUrl('')
      setStats({ originalSize: f.size, compressionRatio: 0, newSize: 0 })
    }
  }

  // Cleanup preview URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className='relative mx-auto border-x border-b border-base-300'>
      <div className='hidden'>
        <input
          ref={inputFileRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
        />
      </div>

      {file && (
        <div className='grid md:grid-cols-2'>
          <div className='relative'>
            <h3 className='z-100 top-4 px-2 py-0.5 left-4 bg-base-300/50 backdrop-blur-2xl absolute font-space font-semibold space-x-6'>
              <span className='font-bold'>Original</span>
              <span className='font-sans tracking-tight text-orange-200'>
                {stats && formatBytes(stats.originalSize)}
              </span>
            </h3>
            <Lens>
              <Image
                src={previewUrl}
                alt='Original'
                width={500}
                height={500}
                className='w-full border rounded relative z-20'
              />
            </Lens>
          </div>

          {convertedUrl && (
            <div className='relative'>
              <div className='relative flex items-center justify-between'>
                <h3 className='z-100 top-4 left-4 absolute font-semibold flex items-center bg-base-300/50 backdrop-blur-2xl px-1.5 py-0.5'>
                  <span className='ps-1 pe-3 tracking-tight'>Converted</span>
                  <Icon
                    name={converting ? 'spinner-ring' : 'check-ring'}
                    className={cn('size-5 text-emerald-400', { 'text-orange-200': converting })}
                  />
                  <span className='px-4 font-space'>{formatBytes(stats?.newSize ?? 1)}</span>
                  <span className='text-emerald-400 font-space'>
                    &darr;<span className='text-emerald-300'>{stats?.compressionRatio.toFixed(2)}%</span>
                  </span>
                </h3>
                <div className='absolute top-4 right-4 z-200'>
                  <button
                    onClick={onDownload}
                    disabled={converting}
                    className='btn btn-lg flex items-center font-normal font-space px-3 space-x-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-200/20'>
                    <span className='font-sans font-semibold tracking-tight text-base'>Download</span>
                    <Icon name='hyper-download' className='size-5' />
                  </button>
                </div>
              </div>
              <Lens>
                <Image src={convertedUrl} alt='Converted' width={500} height={500} className='w-full border rounded' />
              </Lens>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
