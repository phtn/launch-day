'use client'

import { Input } from '@/components/input'
import { Slider } from '@/components/slider'
import { useCopy } from '@/hooks/use-copy'
import { IconEntry } from '@/hooks/use-icon-meta'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [iconSize, setIconSize] = useState(24)
  const [query, setQuery] = useState('')
  const [hoveredIcon, setHoveredIcon] = useState<IconEntry | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { isCopied, copy } = useCopy({ timeout: 2000 })

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

  // Memoize filtered icons to prevent unnecessary recalculations
  const filteredIcons = useMemo(
    () => icons.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase())),
    [icons, query]
  )

  const back = useRouter().back

  return (
    <div className='h-screen overflow-scroll'>
      <div className='absolute z-100 h-16 flex items-center mx-auto w-full'>
        <div className='bg-base-300 size-full h-16 px-4 lg:px-8 flex items-center w-full justify-center'>
          <div className='flex items-center flex-1 min-w-44 lg:min-w-80 space-x-4 md:space-x-4 lg:space-x-8'>
            <div className='flex items-center'>
              <button onClick={back} className='btn btn-ghost btn-xs btn-circle'>
                <Icon name='arrow-left-01' className='size-4 text-minty' />
              </button>
              <h1 className='text-base md:text-xl lg:text-2xl space-x-1 lg:space-x-2 tracking-tighter h-12 flex items-center capitalize'>
                <span className='whitespace-nowrap'>{iconSetId}</span>
                <span
                  className={cn('flex font-bone rounded-md aspect-square items-center justify-center', {
                    'text-orange-300': filteredIcons.length === 0
                  })}>
                  {filteredIcons.length}
                </span>
              </h1>
            </div>

            <div className='flex items-center lg:space-x-4'>
              <button
                onClick={loadMore}
                className=' rounded-full btn btn-xs lg:btn-sm btn-dash border-minty/40 disabled:border-minty/20 disabled:bg-transparent text-minty disabled:text-minty/50 font-sans text-xs lg:text-sm font-medium'
                disabled={!hasMore}>
                <span className='hidden lg:flex'>Load</span> More
              </button>
              <button
                onClick={loadAll}
                className='btn btn-ghost btn-xs lg:btn-sm text-minty disabled:text-minty/50 font-sans text-xs lg:text-sm font-normal md:font-medium lg:font-medium'
                disabled={!hasMore}>
                <span className='hidden lg:flex'>Load</span> All
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
          <div className='min-w-24 md:min-w-44 lg:min-w-64 xl:min-w-80 join flex items-center justify-end'>
            <div>
              <label className='input join-item input-ghost input-sm md:input-sm lg:input-md bg-black focus-visible:ring-0 focus-within:outline-0'>
                <Input
                  ref={searchInputRef}
                  value={query}
                  type='search'
                  placeholder='Search'
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <button
              className='btn btn-soft btn-sm md:btn-sm lg:btn-md join-item px-1.5 bg-black border-black'
              onClick={undefined}>
              <Icon name='slash-bold' className='size-4 md:size-4 lg:size-5 text-minty' />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollAreaRef}
        className='relative mt-24 z-50 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:gird-cols-12 gap-4 pb-36'>
        {filteredIcons.map((icon, i) => (
          <div
            key={icon.name + i}
            onMouseEnter={() => setHoveredIcon(icon)}
            className='group/icon relative flex flex-col group aspect-square items-center justify-center p-4 border-[0.33px] border-transparent cursor-pointer hover:bg-base-200/40 dark:hover:bg-card-origin/40 hover:border-xy'>
            <IconifySvg
              icon={icon}
              size={iconSize}
              className='group-hover:scale-150 text-emerald-50 transition-transform duration-300'
            />
            <span className='text-sm mt-2 group-hover:translate-y-8 text-emerald-100 transition-transform duration-300 ease-in-out font-thin font-sans'>
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
