import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Token, TokenCoaster } from './token'
import { UsdcBalance } from './usdc-balance'

const tokenData: Record<string, { name: string; color: string; icon: IconName }> = {
  BTC: { name: 'Bitcoin', color: '#f7931a', icon: 'ethereum' },
  ETH: { name: 'Ethereum', color: '#627eea', icon: 'ethereum' },
  USDT: { name: 'Tether', color: '#26a17b', icon: 'ethereum' },
  USDC: { name: 'USD Coin', color: '#2775ca', icon: 'usdc' },
  SOL: { name: 'Solana', color: '#9945ff', icon: 'ethereum' },
  BNB: { name: 'BNB', color: '#f0b90b', icon: 'ethereum' }
}

interface TokenDisplayProps {
  token: Token
  balance: number | null
  showBalance?: boolean
  price: number | null
  size?: 'sm' | 'md' | 'lg'
  isInsufficient?: boolean | ''
  /** Symbol for the native gas token when token is 'ethereum' (e.g. 'ETH', 'MATIC'). */
  nativeSymbol?: string
}

export const TokenModern = ({
  token,
  balance,
  price,
  isInsufficient,
  showBalance = true,
  nativeSymbol
}: TokenDisplayProps) => {
  // Format balance for display
  const formattedBalance = balance
    ? balance.toLocaleString('en-US', {
        minimumFractionDigits: token === 'usdc' ? 2 : 0,
        maximumFractionDigits: token === 'usdc' ? 6 : 11
      })
    : '0'

  return (
    <div className='flex items-center justify-start w-full p-3 gap-4'>
      <div className={cn(`relative rounded-3xl flex items-center justify-center w-auto h-6 md:h-12 aspect-square`)}>
        <Icon
          name='squircle'
          className={cn('size-16 absolute', {
            'text-ethereum': token === 'ethereum',
            'text-usdc': token === 'usdc',
            'text-polygon': token === 'ethereum' && nativeSymbol === 'matic',
            'text-bitcoin/10': token === 'bitcoin',
            'text-white/10': token === 'usdt'
          })}
        />
        <TokenCoaster nativeSymbol={nativeSymbol} size='lg' token={token} />
      </div>
      <div className='flex items-center justify-between w-full'>
        <div className='text-left -space-y-px'>
          <p className={cn('')}>
            {token === 'usdc' && balance === null ? (
              // Fallback to UsdcBalance component if balance not provided
              <UsdcBalance compact />
            ) : (
              <span className='font-okxs font-normal text-indigo-100 text-xl'>{formattedBalance}</span>
            )}
          </p>
          <div className='flex items-center space-x-2'>
            <span className='text-white/60 font-okxs font-medium text-xs px-0.5 uppercase'>
              {token === 'ethereum' && nativeSymbol ? nativeSymbol : token}
            </span>
          </div>
        </div>
        <div className='text-right'>
          {showBalance && (
            <p className={`md:text-base text-base font-okxs font-medium px-2`}>
              <span className='pr-0.5 opacity-80'>$</span>
              <span className=''>
                {(balance ?? 0 * (price ?? 1)).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  currency: 'USD',
                  currencyDisplay: 'symbol'
                })}
              </span>
            </p>
          )}
          <div className='h-4.5 flex items-center justify-end overflow-hidden w-24 mr-1'>
            <AnimatePresence mode='wait'>
              {isInsufficient && (
                <motion.span
                  initial={{ opacity: 0.4, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.5, y: 5 }}
                  transition={{ ease: 'easeOut' }}
                  className='text-[8px] uppercase text-red-300 font-brk tracking-widest whitespace-nowrap'>
                  Low balance
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export { tokenData }
