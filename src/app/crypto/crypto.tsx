'use client'

import { useCrypto } from '@/hooks/use-crypto'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

const formatPrice = (price: number): string => {
  if (price >= 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  return `${num.toLocaleString()}`
}

const formatSupply = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  return num.toLocaleString()
}

const PercentChange = ({ value }: { value: number }) => {
  const isPositive = value >= 0
  const color = isPositive ? 'text-emerald-300' : 'text-rose-100 opacity-70 font-medium font-space'
  const arrow = isPositive ? '▲' : '▼'

  return (
    <span className={`${color} font-medium font-sans whitespace-nowrap`}>
      <span className={cn(isPositive ? 'text-emerald-300' : 'text-rose-400', 'text-xs')}>{arrow}</span>{' '}
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

export const CryptoContent = () => {
  const { data, error, lastUpdated, refetch } = useCrypto()

  if (error) {
    return (
      <main className='h-screen px-4 md:px-0 overflow-hidden text-white bg-black flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400 text-lg mb-4'>Error: {error}</p>
          <button onClick={refetch} className='btn btn-primary btn-sm'>
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className='h-full px-4 md:px-6 overflow-hidden text-white bg-black flex flex-col'>
      <header className='flex items-center justify-between py-4 border-b border-zinc-800'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold tracking-tight'>Crypto Prices</h1>
          {lastUpdated && (
            <p className='text-xs text-zinc-500 mt-1 portrait:hidden'>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <button onClick={refetch} className='btn btn-sm btn-neutral gap-2'>
          Refresh
        </button>
      </header>

      <Suspense fallback={<Loading />}>
        <div className='flex-1 overflow-auto'>
          <table className='table table-xs table-pin-rows'>
            <thead>
              <tr className='bg-base-300 text-zinc-400 text-xs sticky uppercase tracking-wider font-normal'>
                <th className='text-center sticky left-0 z-10 bg-zinc-900 text-base font-exo pr-1'>#</th>
                <th className='sticky left-6 z-10 bg-zinc-900'>Name</th>
                <th className='left-6 z-10 bg-zinc-900'></th>
                <th className='text-right'>($) Price</th>
                <th className='text-right'>1h %</th>
                <th className='text-right'>24h %</th>
                <th className='text-right'>7d %</th>
                <th className='text-right'>($) Market Cap</th>
                <th className='text-right'>Volume (24h)</th>
                <th className='text-right'>Circulating Supply</th>
                <th className='text-right'>Chain Id</th>
                <th className='text-right'>Tags</th>
              </tr>
            </thead>
            <tbody>
              {data.map((crypto) => (
                <tr
                  key={crypto.id}
                  className=' text-sm hover:bg-zinc-900/50 border-b border-zinc-800/50 transition-colors group'>
                  <th className='text-center text-zinc-500 font-normal sticky left-0 z-10 bg-black group-hover:bg-zinc-900 transition-colors portrait:w-4'>
                    {crypto.rank}
                  </th>
                  <td className='left-6 sticky z-10 bg-black group-hover:bg-zinc-900 transition-colors'>
                    <div className='flex items-center gap-2'>
                      <span className='font-bone font-semibold text-cyan-50/90'>{crypto.symbol}</span>
                    </div>
                  </td>
                  <td className='left-6 z-10 bg-black group-hover:bg-zinc-900 transition-colors'>
                    <div className='flex items-center gap-2'>
                      <span className='text-zinc-500 whitespace-nowrap text-[8px] md:text-xs'>{crypto.name}</span>
                    </div>
                  </td>
                  <td className='text-right font-space text-orange-100'>{formatPrice(crypto.price)}</td>
                  <td className='text-right'>
                    <PercentChange value={crypto.percentChange1h} />
                  </td>
                  <td className='text-right'>
                    <PercentChange value={crypto.percentChange24h} />
                  </td>
                  <td className='text-right'>
                    <PercentChange value={crypto.percentChange7d} />
                  </td>
                  <td className='text-right text-zinc-300'>{formatLargeNumber(crypto.marketCap)}</td>
                  <td className='text-right text-zinc-300'>{formatLargeNumber(crypto.volume24h)}</td>
                  <td className='text-right text-zinc-400'>
                    {formatSupply(crypto.circulatingSupply)} {crypto.symbol}
                  </td>
                  <td className='text-right text-zinc-400'>{crypto.id}</td>
                  <td className='text-right text-zinc-400 whitespace-nowrap'>{crypto.tags?.[0]}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider'>
                <th className='text-center sticky left-0 z-10 bg-zinc-900 font-exo text-base pr-1'>#</th>
                <th className='sticky left-6 z-10 bg-zinc-900 pl-1'>Name</th>
                <th className='left-6 z-10 pl-1'></th>
                <th className='text-right'>Price</th>
                <th className='text-right'>1h %</th>
                <th className='text-right'>24h %</th>
                <th className='text-right'>7d %</th>
                <th className='text-right'>Market Cap</th>
                <th className='text-right'>Volume (24h)</th>
                <th className='text-right'>Circulating Supply</th>
                <th className='text-right'>Chain Id</th>
                <th className='text-right'>Tags</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </Suspense>
    </main>
  )
}

const Loading = () => {
  return (
    <div className='h-screen px-4 md:px-0 overflow-hidden text-white bg-black flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <span className='loading loading-spinner loading-lg text-teal-500' />
        <p className='text-zinc-400'>Loading crypto data...</p>
      </div>
    </div>
  )
}
