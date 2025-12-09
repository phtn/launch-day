'use client'

import { Input } from '@/components/input'
import { Slider } from '@/components/slider'
import { prefetchIconSet } from '@/hooks/icon-cache'
import { useCopy } from '@/hooks/use-copy'
import { IconEntry } from '@/hooks/use-icon-meta'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { RefObject, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { IconifySvg } from '../iconify'

interface IconsPageProps {
  icons: Array<IconEntry>
  iconSetId: string
  hasMore: boolean
  loadMore: VoidFunction
  loadAll: VoidFunction
  scrollAreaRef: RefObject<HTMLDivElement | null>
}

export const IconSetList = ({ icons, iconSetId, hasMore, loadMore, loadAll, scrollAreaRef }: IconsPageProps) => {
  const [iconSize, setIconSize] = useState(40)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [hoveredIcon, setHoveredIcon] = useState<IconEntry | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { isCopied, copy } = useCopy({ timeout: 2000 })

  // Debounce search query to avoid filtering on every keystroke
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms debounce delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query])

  // Focus search input on '/' key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is already typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const symbolValue = useMemo(
    () =>
      hoveredIcon
        ? {
            [hoveredIcon.name as string]: {
              symbol: hoveredIcon.body.replaceAll('"', '"').replaceAll(': ', '`').replaceAll('",', '`,'),
              viewBox: `0 0 ${hoveredIcon.sourceHeight} ${hoveredIcon.sourceHeight}`,
              set: `${hoveredIcon.sourceSetId}`
            }
          }
        : {},
    [hoveredIcon]
  )
  const propertySnippet = useMemo(() => {
    if (!hoveredIcon) return ''
    const inner = symbolValue[hoveredIcon.name]
    const innerJson = JSON.stringify(inner, null, 2)
    const prop = JSON.stringify(hoveredIcon.name)
    return `${prop}: ${innerJson}`
  }, [symbolValue, hoveredIcon])

  const copyIconSymbol = useCallback(
    () => copy(hoveredIcon?.name ?? 'icon-name', propertySnippet),
    [propertySnippet, hoveredIcon, copy]
  )

  // Memoize filtered icons with debounced query and useTransition for non-blocking updates
  const [isFiltering, startFilterTransition] = useTransition()
  const [filteredIcons, setFilteredIcons] = useState<IconEntry[]>(icons)

  // Update filtered icons when icons or debouncedQuery changes
  useEffect(() => {
    startFilterTransition(() => {
      const filtered = icons.filter((icon) => icon.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      setFilteredIcons(filtered)
    })
  }, [icons, debouncedQuery, startFilterTransition])

  const back = useRouter().back

  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light')

  const handleChangeSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const [isPrefetching, startPrefetchTransition] = useTransition()
  const hasPrefetched = useRef(false)

  const handlePrefetch = useCallback(
    (count: number) => () => {
      if (hasPrefetched.current) return
      startPrefetchTransition(() => {
        void prefetchIconSet(iconSetId, count)
        hasPrefetched.current = true
      })
    },
    [startPrefetchTransition, iconSetId]
  )

  return (
    <div
      className={cn(
        'h-[calc(100lvh-96px)] sm:h-[calc(100lvh-50px)] overflow-scroll bg-neutral-50 text-base-300',
        mode === 'dark' ? 'bg-neutral-900 text-neutral-200' : ''
      )}>
      <div className='absolute z-100 h-16 flex items-center mx-auto w-full'>
        <div
          className={cn(
            'size-full h-16 px-4 lg:px-8 flex items-center w-full justify-center bg-base-100/10 backdrop-blur-2xl',
            {
              'bg-base-300': mode === 'dark'
            }
          )}>
          <div className='flex items-center flex-1 min-w-44 lg:min-w-80 space-x-4 md:space-x-4 lg:space-x-8'>
            <div className='flex items-center space-x-2'>
              <button
                onClick={back}
                className='btn btn-ghost btn-xs btn-circle hover:bg-white hover:text-base-300 -mb-0.5'>
                <Icon name='arrow-left-01' className='size-6' />
              </button>
              <h1 className='md:text-xl lg:text-2xl space-x-1 lg:space-x-4 xl:space-x-6 tracking-tighter h-12 flex items-center capitalize'>
                <span className={cn('text-neutral-800', { 'text-neutral-200': mode === 'dark' })}>{iconSetId}</span>
                <span
                  className={cn('flex font-bone rounded-md aspect-square items-center justify-center', {
                    'text-orange-300': filteredIcons.length === 0
                  })}>
                  {filteredIcons.length}
                </span>
              </h1>
            </div>

            <div
              className={cn('flex items-center lg:space-x-4 text-base-200', {
                'text-neutral-400': mode === 'dark'
              })}>
              <div className={cn('flex items-center justify-center space-x-0.5 md:space-x-4', { hidden: !hasMore })}>
                <button
                  onMouseEnter={handlePrefetch(40)}
                  onClick={loadMore}
                  className={cn(
                    'rounded-full btn-ghost btn btn-xs -space-x-2 lg:btn-sm text-xs lg:text-sm font-medium font-space px-1 disabled:text-transparent hidden',
                    { flex: hasMore }
                  )}
                  disabled={!hasMore}>
                  <Icon name={isPrefetching ? 'spinner-ring' : 'plus-sign'} className='size-3.5 hidden lg:block' />
                  <span>40</span>
                </button>
                <button
                  onMouseEnter={handlePrefetch(3000)}
                  onClick={loadAll}
                  className='btn btn-ghost btn-xs lg:btn-sm -space-x-2 font-sans text-xs lg:text-sm font-normal md:font-medium lg:font-medium px-1 rounded-lg disabled:text-transparent'
                  disabled={!hasMore}>
                  <Icon name={isPrefetching ? 'spinner-ring' : 'plus-sign'} className='size-3.5 hidden lg:block' />
                  <span className=''>All</span>
                </button>
              </div>
              <button onClick={toggleMode} className='btn btn-xs btn-circle btn-ghost group'>
                <Icon
                  name='dark-theme'
                  className={cn(
                    'size-5 text-shadow-emerald-200 rotate-5 transition-transform duration-300 ease-in-out',
                    {
                      'rotate-360': mode === 'dark'
                    }
                  )}
                />
              </button>
            </div>
          </div>

          <div className='flex items-center justify-center w-40 lg:w-64'>
            <Slider
              min={16}
              max={64}
              step={8}
              value={[iconSize]}
              onValueChange={(value: Array<number>) => setIconSize(value[0])}
              className='hidden sm:block w-full'
            />
          </div>
          <div className={cn('min-w-24 md:min-w-44 lg:min-w-64 xl:min-w-80 join flex items-center justify-end', {})}>
            <div>
              <label
                className={cn(
                  'input input-primary bg-base-300/10 join-item input-ghost input-sm md:input-sm lg:input-lg focus-visible:ring-0 focus-within:outline-0 rounded-s-lg font-space text-base',
                  { 'bg-black/20': mode === 'dark' }
                )}>
                <Input
                  mode={mode}
                  type='search'
                  ref={searchInputRef}
                  placeholder='Search'
                  onChange={handleChangeSearchQuery}
                  // className={cn('dark:text-base-200 placeholder:text-slate-200 dark:placeholder:text-base-300 border-0', {
                  //   'text-base-100': mode === 'light'
                  // })}
                />
              </label>
            </div>
            <button
              className={cn(
                'btn btn-soft bg-base-300/10 btn-sm md:btn-sm lg:btn-lg join-item px-1.5 border-transparent rounded-e-lg translate-x-px',
                { ' bg-black/20': mode === 'dark' }
              )}
              onClick={() => searchInputRef.current?.focus()}>
              <Icon
                name={isFiltering ? 'spinner-ring' : 'slash-bold'}
                className={cn('size-4 md:size-4 lg:size-5.5', { 'text-base-300': isFiltering })}
              />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollAreaRef}
        className={cn(
          'mt-20 relative z-50 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12 gap-4 pb-28',
          { '': filteredIcons.length > 40 }
        )}>
        {filteredIcons.map((icon, i) => (
          <div
            key={icon.name + i}
            onMouseEnter={() => setHoveredIcon(icon)}
            className='group/icon relative flex flex-col group aspect-square items-center justify-center p-4 border-[0.33px] border-transparent cursor-pointer hover:bg-base-200/10 dark:hover:bg-card-origin/40 hover:border-xy'>
            <IconifySvg
              icon={icon}
              size={iconSize}
              className='group-hover:scale-150 _text-emerald-50 transition-transform duration-300'
            />
            <span className='absolute bottom-0 whitespace-nowrap text-transparent group-hover:text-base-200 text-sm mt-2 group-hover:translate-y-5 group-hover:bg-base-100/4 rounded-b-md w-full text-center transition-transform duration-300 ease-in-out font-thin font-sans'>
              {icon.name}
            </span>

            <div className='absolute top-0 right-0 hidden group-hover/icon:flex p-2'>
              <label className='swap swap-rotate'>
                <input type='checkbox' onClick={copyIconSymbol} checked={isCopied} readOnly />
                <Icon name={'check'} className='size-4 swap-on' />
                <Icon name={'re-up.ph'} className='size-4 swap-off' />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
