'use client'

import { prefetchIconSet } from '@/hooks/icon-cache'
import { useIconMeta } from '@/hooks/use-icon-meta'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode
} from 'react'
import { IconSet } from '../api/icones/types'
import { ClassName } from '../types'
import { IconifySvg } from './iconify'

const DEFAULT_ICON_SET_IDS = ['proicons', 'svg-spinners', 'pixelarticons', 'stash', 'lets-icons'] as const
const FALLBACK_ICON_SET_SUGGESTION_IDS = [
  ...DEFAULT_ICON_SET_IDS,
  'material-symbols',
  'mdi',
  'tabler',
  'lucide',
  'solar',
  'ph',
  'heroicons',
  'ri',
  'uil',
  'carbon'
] as const
const STORAGE_KEY = 'icon-sets'
const ICON_PREVIEW_LIMIT = 36
const ICON_SET_SUGGESTION_LIMIT = 8
const ATTRIBUTIONS = [
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
] as const

interface IconSetSuggestion {
  id: string
  name: string
  total?: number
  category?: string
  author?: {
    name?: string
  }
}

type IconifyCollectionsResponse = Record<
  string,
  {
    name?: string
    total?: number
    category?: string
    author?: {
      name?: string
    }
  }
>

const fallbackIconSetSuggestions = FALLBACK_ICON_SET_SUGGESTION_IDS.map((id) => ({
  id,
  name: id
}))

const loadIconSetsFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [...DEFAULT_ICON_SET_IDS]
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      return Array.isArray(parsed) ? parsed : [...DEFAULT_ICON_SET_IDS]
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
  const [iconSetIds, setIconSetIds] = useState<string[]>(() => loadIconSetsFromStorage())
  const [isAddingIconSet, setIsAddingIconSet] = useState(false)
  const [newIconSetId, setNewIconSetId] = useState('')
  const [iconSetSuggestions, setIconSetSuggestions] = useState<IconSetSuggestion[]>(fallbackIconSetSuggestions)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipNextInputCommitRef = useRef(false)

  // Load icon sets from localStorage on mount
  // useEffect(() => {
  //   setIconSetIds(loadIconSetsFromStorage())
  // }, [])

  // Route payloads are cheap to prefetch; icon payloads are fetched per-card at preview size.
  useEffect(() => {
    const prefetchAll = () => {
      iconSetIds.forEach((id) => {
        router.prefetch(`/icons/${id}`)
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

  useEffect(() => {
    const controller = new AbortController()

    const loadIconSetSuggestions = async () => {
      try {
        const response = await fetch('https://api.iconify.design/collections', {
          headers: { Accept: 'application/json' },
          signal: controller.signal
        })

        if (!response.ok) return

        const collections = (await response.json()) as IconifyCollectionsResponse
        const suggestions = Object.entries(collections).map(([id, collection]) => ({
          id,
          name: collection.name ?? id,
          total: collection.total,
          category: collection.category,
          author: collection.author
        }))

        setIconSetSuggestions(suggestions)
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return
        console.error('[Content] Failed to load icon set suggestions:', err)
      }
    }

    void loadIconSetSuggestions()

    return () => controller.abort()
  }, [])

  const filteredIconSetSuggestions = useMemo(() => {
    const query = newIconSetId.trim().toLowerCase()
    const usedIconSetIds = new Set(iconSetIds)

    return iconSetSuggestions
      .filter((suggestion) => {
        if (usedIconSetIds.has(suggestion.id)) return false
        if (!query) return true

        return (
          suggestion.id.toLowerCase().includes(query) ||
          suggestion.name.toLowerCase().includes(query) ||
          suggestion.category?.toLowerCase().includes(query) ||
          suggestion.author?.name?.toLowerCase().includes(query)
        )
      })
      .slice(0, ICON_SET_SUGGESTION_LIMIT)
  }, [iconSetIds, iconSetSuggestions, newIconSetId])

  const activeSuggestionIndex = Math.min(selectedSuggestionIndex, Math.max(filteredIconSetSuggestions.length - 1, 0))

  const addIconSet = useCallback(
    (iconSetId: string) => {
      const trimmedId = iconSetId.trim()
      if (!trimmedId) return

      setIconSetIds((currentIconSetIds) => {
        if (currentIconSetIds.includes(trimmedId)) return currentIconSetIds

        const updated = [...currentIconSetIds, trimmedId]
        saveIconSetsToStorage(updated)
        return updated
      })

      router.prefetch(`/icons/${trimmedId}`)
      void prefetchIconSet(trimmedId, ICON_PREVIEW_LIMIT)
    },
    [router]
  )

  const handleAddIconSetClick = useCallback(() => {
    skipNextInputCommitRef.current = false
    setIsAddingIconSet(true)
    setNewIconSetId('')
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  const handleRemoveIconSet = useCallback((iconSetId: string) => {
    setIconSetIds((currentIconSetIds) => {
      const updated = currentIconSetIds.filter((currentIconSetId) => currentIconSetId !== iconSetId)
      saveIconSetsToStorage(updated)
      return updated
    })
  }, [])

  const handleInputBlur = useCallback(() => {
    if (skipNextInputCommitRef.current) {
      skipNextInputCommitRef.current = false
      return
    }

    addIconSet(newIconSetId)
    setIsAddingIconSet(false)
    setNewIconSetId('')
  }, [addIconSet, newIconSetId])

  const handleSuggestionSelect = useCallback(
    (iconSetId: string) => {
      skipNextInputCommitRef.current = true
      addIconSet(iconSetId)
      setIsAddingIconSet(false)
      setNewIconSetId('')
    },
    [addIconSet]
  )

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestionIndex((currentIndex) =>
          Math.min(currentIndex + 1, Math.max(filteredIconSetSuggestions.length - 1, 0))
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestionIndex((currentIndex) => Math.max(currentIndex - 1, 0))
      } else if (e.key === 'Enter') {
        const selectedSuggestion = filteredIconSetSuggestions[activeSuggestionIndex]
        if (selectedSuggestion) {
          e.preventDefault()
          handleSuggestionSelect(selectedSuggestion.id)
        } else {
          e.currentTarget.blur()
        }
      } else if (e.key === 'Escape') {
        skipNextInputCommitRef.current = true
        setIsAddingIconSet(false)
        setNewIconSetId('')
      }
    },
    [activeSuggestionIndex, filteredIconSetSuggestions, handleSuggestionSelect]
  )

  return (
    <main className='h-screen'>
      <div className='text-white pt-12 md:pt-16 md:px-12 size-full'>
        <div className='px-4 h-12 flex items-end justify-between'>
          <div className='flex items-center space-x-2'>
            <h1 className='whitespace-nowrap text-xl tracking-tighter leading-7 font-semibold font-sans'>Icon Sets</h1>
            {isAddingIconSet ? (
              <div className='relative'>
                <input
                  id='iconset-id'
                  ref={inputRef}
                  type='text'
                  value={newIconSetId}
                  onChange={(e) => {
                    setNewIconSetId(e.target.value)
                    setSelectedSuggestionIndex(0)
                  }}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  placeholder=' icon-set-id'
                  role='combobox'
                  aria-autocomplete='list'
                  aria-expanded={filteredIconSetSuggestions.length > 0}
                  aria-controls='icon-set-suggestions'
                  className='input input-xs sm:input-sm border-0 outline-0 focus-within:ring-0 focus-visible:ring-0 bg-base-300/50 text-white placeholder:text-base-content/50 focus:outline-none rounded-lg px-3 py-1.5 min-w-30'
                  autoFocus
                />
                {filteredIconSetSuggestions.length > 0 && (
                  <div
                    id='icon-set-suggestions'
                    role='listbox'
                    className='absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-lg bg-base-300/95 p-1 shadow-2xl backdrop-blur-xl'>
                    {filteredIconSetSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        type='button'
                        role='option'
                        aria-selected={index === activeSuggestionIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionSelect(suggestion.id)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-xs text-white hover:bg-white/10',
                          {
                            'bg-white/10': index === activeSuggestionIndex
                          }
                        )}>
                        <span className='min-w-0'>
                          <span className='block truncate font-space text-sm font-semibold tracking-tight'>
                            {suggestion.id}
                          </span>
                          <span className='block truncate text-[10px] text-blue-100/70'>
                            {suggestion.name}
                            {suggestion.category ? ` / ${suggestion.category}` : ''}
                          </span>
                        </span>
                        {suggestion.total ? (
                          <span className='shrink-0 font-space text-[10px] text-orange-100/70'>
                            {suggestion.total.toLocaleString()}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                id='add-icon-set'
                onClick={handleAddIconSetClick}
                className='btn btn-soft btn-xs btn-circle bg-minty'>
                <Icon name='plus-sign' className='size-4 text-base-300' />
              </button>
            )}
          </div>

          <div className='flex items-center space-x-4'>
            <button
              onClick={() => router.push('/icons/optimizer')}
              className='btn btn-soft text-white px-1.5 rounded-lg'>
              <span>Optimizer</span>
              <Icon name='hot' className='size-3 text-minty' />
            </button>
          </div>
          <div className='space-x-1 md:space-x-3 ld:space-x-4'>
            {ATTRIBUTIONS.map((attribution) => (
              <Attribution key={attribution.label} {...attribution} />
            ))}
          </div>
        </div>
        <div className='p-4 flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-8'>
          {iconSetIds.map((iconSetId) => (
            <IconSetCard key={iconSetId} iconSetId={iconSetId} onRemove={handleRemoveIconSet} />
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
const Attribution = memo(function Attribution({ className, label, description, href }: AttributionProps) {
  return (
    <span className={cn('text-orange-200 px-2 text-xs md:text-sm lg:text-base font-thin tracking-tighter', className)}>
      <span className='text-neutral-300 mr-1 font-normal opacity-50'>{description}</span>
      <a href={href} target='_blank' rel='noopener noreferrer'>
        {label}
      </a>
    </span>
  )
})

interface IconSetCardProps {
  iconSetId: string
  onRemove: (iconSetId: string) => void
  className?: ClassName
}
const IconSetCard = memo(function IconSetCard({ iconSetId, onRemove, className }: IconSetCardProps) {
  const { metadata, icons, loadingIcons, loadingMeta } = useIconMeta(iconSetId, {
    initialIconCount: ICON_PREVIEW_LIMIT
  })
  const router = useRouter()
  const [isPrefetching, startTransition] = useTransition()
  const hasPrefetched = useRef(false)
  const previewIcons = useMemo(() => icons.slice(0, ICON_PREVIEW_LIMIT), [icons])

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
      className={cn('group relative card bg-base-300/50 card-xs shadow-none w-full sm:w-fit', className)}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}>
      <button
        type='button'
        aria-label={`Remove ${iconSetId} icon set`}
        title={`Remove ${iconSetId}`}
        onClick={() => onRemove(iconSetId)}
        className='btn btn-ghost btn-sm btn-circle absolute -right-3 -top-3 z-10 bg-black/20 text-red-100 opacity-70 transition-opacity hover:bg-red-400/60 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 rounded-xs'>
        <Icon name='close' className='size-5' />
      </button>
      <div className='card-body w-full p-0!'>
        <div className='flex items-center space-x-0 sm:space-x-2 pl-4 sm:pl-6'>
          <div className='text-rotate items-center size-12 aspect-square' style={{ width: 44, height: 40 }}>
            <span className=''>
              {previewIcons.map((sample) => (
                <IconifySvg key={sample.name} icon={sample} size={40} className='text-lime-100 size-10' />
              ))}
            </span>
          </div>
          <IconSetCardHeader
            metadata={metadata}
            loading={loadingMeta}
            loadingIcons={loadingIcons}
            isPrefetching={isPrefetching}
          />
        </div>
      </div>
    </div>
  )
})

interface IconSetCardHeaderProps {
  loading: boolean
  metadata: IconSet | null
  loadingIcons: boolean
  isPrefetching: boolean
}

const IconSetCardHeader = memo(function IconSetCardHeader({
  loading,
  metadata,
  loadingIcons,
  isPrefetching
}: IconSetCardHeaderProps) {
  return (
    <div className='flex items-center justify-between w-full h-24'>
      <div className='min-w-1/3 m-4 sm:m-6 sm:min-w-44 md:min-w-50 lg:min-w-54 space-y-2'>
        <div className='block'>
          <Link
            href={`${metadata?.license.url}`}
            className='text-[8px] text-orange-100 opacity-70 uppercase hover:opacity-100 hover:underline underline-offset-2 decoration-dashed decoration-[0.33px] select-none portrait:max-w-[6ch] overflow-clip whitespace-nowrap font-sans font-thin tracking-tighter'>
            {metadata?.license.title}
          </Link>
        </div>
        <div>
          <Link
            href={`/icons/${metadata?.id}`}
            prefetch
            className={cn(
              'truncate max-w-[18ch] flex items-center space-x-2 font-space font-semibold text-lg md:text-xl leading-none tracking-tighter'
            )}>
            {loading ? <Icon name='spinners-ring' className='text-minty h-5' /> : <span>{metadata?.name}</span>}
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
          <Icon
            name={isPrefetching ? 'spinner-ring' : 'check'}
            className={cn('size-3 text-orange-200', { 'size-4': isPrefetching })}
          />
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
})

interface StatMiniProps {
  value: ReactNode
  label: string
  href?: string
  className?: ClassName
}
const StatMini = memo(function StatMini({ value, label, className, href }: StatMiniProps) {
  return (
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
})
