'use client'

import { prefetchIconSet } from '@/hooks/icon-cache'
import { IconEntry, useIconMeta } from '@/hooks/use-icon-meta'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { IconSet } from '../api/icones/types'
import { ClassName } from '../types'
import { IconifySvg } from './iconify'

const DEFAULT_ICON_SET_IDS = ['proicons', 'svg-spinners', 'pixelarticons', 'stash', 'lets-icons'] as const
const STORAGE_KEY = 'icon-sets'

const loadIconSetsFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [...DEFAULT_ICON_SET_IDS]
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_ICON_SET_IDS]
    }
  } catch (err) {
    console.error('[Content] Failed to load icon sets from localStorage:', err)
  }
  return [...DEFAULT_ICON_SET_IDS]
}

const saveIconSetsToStorage = (iconSets: string[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iconSets))
  } catch (err) {
    console.error('[Content] Failed to save icon sets to localStorage:', err)
  }
}

export const Content = () => {
  const router = useRouter()
  const [iconSetIds, setIconSetIds] = useState<string[]>(loadIconSetsFromStorage())
  const [isAddingIconSet, setIsAddingIconSet] = useState(false)
  const [newIconSetId, setNewIconSetId] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Load icon sets from localStorage on mount
  // useEffect(() => {
  //   setIconSetIds(loadIconSetsFromStorage())
  // }, [])

  // Eager prefetch all routes on mount for instant navigation
  useEffect(() => {
    // Use requestIdleCallback for non-blocking prefetch
    const prefetchAll = () => {
      iconSetIds.forEach((id) => {
        router.prefetch(`/icons/${id}`)
        void prefetchIconSet(id)
      })
    }

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(prefetchAll, { timeout: 2000 })
      return () => window.cancelIdleCallback(handle)
    } else {
      // Fallback: defer with setTimeout
      const handle = setTimeout(prefetchAll, 100)
      return () => clearTimeout(handle)
    }
  }, [router, iconSetIds])

  const handleAddIconSetClick = useCallback(() => {
    setIsAddingIconSet(true)
    setNewIconSetId('')
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  const handleInputBlur = useCallback(() => {
    const trimmedId = newIconSetId.trim()
    if (trimmedId && !iconSetIds.includes(trimmedId)) {
      const updated = [...iconSetIds, trimmedId]
      setIconSetIds(updated)
      saveIconSetsToStorage(updated)
      // Prefetch the new icon set
      router.prefetch(`/icons/${trimmedId}`)
      void prefetchIconSet(trimmedId)
    }
    setIsAddingIconSet(false)
    setNewIconSetId('')
  }, [newIconSetId, iconSetIds, router])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setIsAddingIconSet(false)
      setNewIconSetId('')
    }
  }, [])

  const attributions = [
    {
      label: 'Icônes',
      description: 'from',
      href: 'https://icones.js.org'
    },
    {
      label: '@antfu',
      description: 'built by',
      href: 'https://github.com/antfu'
    },
    {
      label: 'Iconify',
      description: 'powered by',
      href: 'https://iconify.design/'
    }
  ]
  return (
    <main className='h-screen'>
      <div className='text-white pt-12 md:pt-16 md:px-12 size-full'>
        <div className='px-4 h-12 flex items-end justify-between'>
          <div className='flex items-center space-x-2'>
            <h1 className='whitespace-nowrap text-xl tracking-tighter leading-7 font-semibold font-sans'>Icon Sets</h1>
            {isAddingIconSet ? (
              <input
                ref={inputRef}
                type='text'
                value={newIconSetId}
                onChange={(e) => setNewIconSetId(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                placeholder=' icon-set-id'
                className='input input-xs sm:input-sm border-0 outline-0 focus-within:ring-0 focus-visible:ring-0 bg-base-300/50 text-white placeholder:text-base-content/50 focus:outline-none rounded-lg px-3 py-1.5 min-w-30'
                autoFocus
              />
            ) : (
              <button
                id='add-icon-set'
                onClick={handleAddIconSetClick}
                className='btn btn-soft btn-xs btn-circle bg-minty'>
                <Icon name='plus-sign' className='size-4 text-base-300' />
              </button>
            )}
          </div>

          <div className='space-x-1 md:space-x-3 ld:space-x-4'>
            {attributions.map((attribution) => (
              <Attribution key={attribution.label} {...attribution} />
            ))}
          </div>
        </div>
        <div className='p-4 flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-8'>
          {iconSetIds.map((iconSetId) => (
            <IconSetCard key={iconSetId} iconSetId={iconSetId} />
          ))}
        </div>
      </div>
    </main>
  )
}

interface AttributionProps {
  label: string
  description: string
  href: string
  className?: ClassName
}
const Attribution = ({ className, label, description, href }: AttributionProps) => (
  <span className={cn('text-blue-300 px-2 text-xs md:text-sm lg:text-base font-thin tracking-tighter', className)}>
    <span className='text-neutral-300 mr-1 font-bold opacity-60'>{description}</span>
    <a href={href} target='_blank' rel='noopener noreferrer'>
      {label}
    </a>
  </span>
)

interface IconSetCardProps {
  iconSetId: string
  className?: ClassName
}
const IconSetCard = ({ iconSetId, className }: IconSetCardProps) => {
  const { metadata, icons, loadingIcons, loadingMeta } = useIconMeta(iconSetId)
  const router = useRouter()
  const [isPrefetching, startTransition] = useTransition()
  const hasPrefetched = useRef(false)

  // Prefetch route + data on hover/focus for instant navigation
  const handlePrefetch = useCallback(() => {
    if (hasPrefetched.current) return
    hasPrefetched.current = true

    startTransition(() => {
      // Prefetch the route (Next.js RSC payload)
      router.prefetch(`/icons/${iconSetId}`)
      // Prefetch the data (metadata + initial icons)
      void prefetchIconSet(iconSetId)
    })
  }, [router, iconSetId])

  return (
    <div
      className={cn('card bg-base-300/50 card-md shadow-sm w-full sm:w-fit', className)}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}>
      <div className='card-body w-full p-0'>
        <div className='flex items-center space-x-0 sm:space-x-2 pl-4 sm:pl-6'>
          <div className='text-rotate items-center rounded-xl size-12 aspect-square' style={{ width: 44, height: 40 }}>
            <span className=''>
              {icons?.slice(0, 69).map((sample, i) => (
                <IconifySvg key={sample.name + i} icon={sample} size={40} className='text-lime-100 size-10' />
              ))}
            </span>
          </div>
          <IconSetCardHeader
            icons={icons}
            metadata={metadata}
            loading={loadingMeta}
            loadingIcons={loadingIcons}
            isPrefetching={isPrefetching}
          />
        </div>
      </div>
    </div>
  )
}

interface IconSetCardHeaderProps {
  loading: boolean
  metadata: IconSet | null
  loadingIcons: boolean
  isPrefetching: boolean
  icons: Array<IconEntry>
}

const IconSetCardHeader = ({ loading, metadata, loadingIcons, isPrefetching }: IconSetCardHeaderProps) => {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='min-w-1/3 m-4 sm:m-6 sm:min-w-44 md:min-w-50 lg:min-w-54 space-y-2.5'>
        <div className='flex items-center space-x-1 sm:space-x-2'>
          <Link
            href={`/icons/${metadata?.id}`}
            prefetch
            className={cn(
              'w-fit flex items-center space-x-2 font-space font-semibold text-lg md:text-xl lg:text-2xl leading-none tracking-tighter'
            )}>
            {loading ? <Icon name='spinners-ring' className='text-minty h-5' /> : <span>{metadata?.name}</span>}
          </Link>
          <Link
            href={`${metadata?.license.url}`}
            className='text-[8px] text-orange-100 opacity-70 uppercase hover:opacity-100 hover:underline underline-offset-2 decoration-dashed decoration-[0.33px] select-none portrait:max-w-[6ch] overflow-clip whitespace-nowrap font-sans font-thin tracking-tighter'>
            {metadata?.license.title}
          </Link>
        </div>
        <div className='flex items-center space-x-1'>
          <Link
            href={`${metadata?.author.url}`}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline underline-offset-2 decoration-dashed decoration-[0.33px]'>
            <h4 className='select-none w-fit text-xs flex items-center space-x-0.5 text-blue-200 tracking-normal'>
              <Icon name='user-fill' className='size-3 opacity-40' />
              <span className='font-medium opacity-70'>{metadata?.author.name}</span>
              <span className='select-none leading-none text-xs opacity-60 font-space font-light tracking-tight'>
                {metadata?.version}
              </span>
            </h4>
          </Link>
          <Icon name={isPrefetching ? 'spinner-ring' : 'check'} className='size-4 text-orange-200' />
        </div>
      </div>
      <div className='flex items-start space-x-1 px-2 sm:pr-2'>
        <StatMini
          label={loadingIcons ? 'loading' : 'size'}
          value={
            loadingIcons ? (
              <Icon name='spinners-ring' className='size-5 m-1 shrink-0 text-indigo-300' />
            ) : (
              metadata?.height
            )
          }
          className={cn({
            'text-indigo-400': loadingIcons
          })}
        />
        <StatMini
          label='icons'
          href={`/icons/${metadata?.id}`}
          value={metadata?.icons.length ?? <Icon name='spinners-ring' className='size-5 m-1 shrink-0 opacity-80' />}
        />
      </div>
    </div>
  )
}

interface StatMiniProps {
  value: ReactNode
  label: string
  href?: string
  className?: ClassName
}
const StatMini = ({ value, label, className, href }: StatMiniProps) => (
  <Link href={href ?? '#'} prefetch>
    <div
      className={cn(
        'select-none flex flex-col items-center p-1 sm:p-2.5 min-h-fit min-w-12 bg-black/20 sm:min-h-18 sm:min-w-20 sm:aspect-square',
        'font-bold font-space',
        className
      )}>
      <span className='pb-0.5 text-xl font-space font-thin'>{value}</span>
      <span className='text-xs opacity-60 text-left capitalize font-sans font-normal'>{label}</span>
    </div>
  </Link>
)
