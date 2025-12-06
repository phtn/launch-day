'use client'

import { IconEntry, useIconMeta } from '@/hooks/use-icon-meta'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ReactNode } from 'react'
import { IconSet } from '../api/icones/types'
import { ClassName } from '../types'
import { IconifySvg } from './iconify'

export const Content = () => {
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
            <h1 className='text-xl tracking-tighter leading-7 font-semibold font-sans'>Icon Sets</h1>
            <button className='btn btn-soft btn-xs btn-circle bg-minty'>
              <Icon name='plus-sign' className='size-4 text-base-300' />
            </button>
          </div>

          <div className='space-x-1 md:space-x-3 ld:space-x-4'>
            {attributions.map((attribution) => (
              <Attribution key={attribution.label} {...attribution} />
            ))}
          </div>
        </div>
        <div className='p-4 flex flex-wrap gap-4'>
          {['proicons', 'svg-spinners', 'pixelarticons', 'stash', 'lets-icons'].map((iconSetId) => (
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
  return (
    <div className={cn('card bg-base-300 card-sm shadow-sm w-full sm:w-fit', className)}>
      <div className='card-body w-full'>
        <div className='flex items-center space-x-4'>
          <div className='text-rotate items-center bg-black/80 rounded-xl' style={{ width: 44, height: 40 }}>
            <span className=''>
              {icons?.slice(0, 69).map((sample) => (
                <IconifySvg key={sample.name} icon={sample} size={40} className='text-minty size-full' />
              ))}
            </span>
          </div>
          <IconSetCardHeader icons={icons} metadata={metadata} loading={loadingMeta} loadingIcons={loadingIcons} />
        </div>
      </div>
    </div>
  )
}

interface IconSetCardHeaderProps {
  loading: boolean
  metadata: IconSet | null
  loadingIcons: boolean
  icons: Array<IconEntry>
}

const IconSetCardHeader = ({ loading, metadata, loadingIcons, icons }: IconSetCardHeaderProps) => {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='min-w-1/3 sm:min-w-48 space-y-2.5'>
        <div className='flex items-center space-x-2'>
          <Link
            href={`/icons/${metadata?.id}`}
            className={cn(
              'w-fit flex items-center space-x-2 font-space font-semibold text-lg md:text-xl lg:text-2xl leading-none tracking-tighter'
            )}>
            {loading ? <Icon name='spinners-ring' className='text-minty h-5' /> : <span>{metadata?.name}</span>}
          </Link>
          <Link
            href={`${metadata?.license.url}`}
            className='text-orange-100 opacity-70 uppercase hover:opacity-100 hover:underline underline-offset-2 decoration-dashed decoration-[0.33px] select-none text-xs portrait:max-w-[4ch] overflow-clip whitespace-nowrap font-sans font-thin tracking-wider'>
            {metadata?.license.title}
          </Link>
        </div>
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
      </div>
      <div className='flex items-center space-x-1'>
        <StatMini
          label={loadingIcons ? 'loading' : 'size'}
          value={
            loadingIcons ? (
              <Icon name='spinners-ring' className='size-5 m-1 shrink-0 text-indigo-300' />
            ) : (
              <div className='flex items-center text-indigo-300'>
                <Icon name='height' className='size-5 text-indigo-100 opacity-50' />
                <span>{metadata?.height}</span>
              </div>
            )
          }
          className={cn('text-indigo-200', {
            'text-indigo-400': loadingIcons
          })}
        />
        <StatMini
          label={loadingIcons ? 'loading' : 'loaded'}
          value={
            loadingIcons ? (
              <Icon name='spinners-ring' className='size-5 m-1 shrink-0 text-indigo-400' />
            ) : (
              <p className='text-lg'>{icons.length}</p>
            )
          }
          className={cn('text-orange-200/90', {
            'text-indigo-400': loadingIcons
          })}
        />
        <StatMini
          label='total'
          value={metadata?.icons.length ?? <Icon name='spinners-ring' className='size-5 m-1 shrink-0 opacity-80' />}
        />
      </div>
    </div>
  )
}

interface StatMiniProps {
  value: ReactNode
  label: string
  className?: ClassName
}
const StatMini = ({ value, label, className }: StatMiniProps) => (
  <div
    className={cn(
      'select-none space-y-0 flex flex-col items-center bg-black/20 p-2 min-size-14 sm:min-size-18 aspect-square',
      'font-bold font-space tracking-wide',
      className
    )}>
    <span className='py-0.5 px-1.5 font-light text-lg'>{value}</span>
    <span className='text-sm text-left font-space capitalize tracking-tight font-normal'>{label}</span>
  </div>
)
