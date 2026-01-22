import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
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
}

export const TokenModern = ({ token, balance, price, isInsufficient, showBalance = true }: TokenDisplayProps) => {
  // Format balance for display
  const formattedBalance = balance
    ? balance.toLocaleString('en-US', {
        minimumFractionDigits: token === 'usdc' ? 2 : 0,
        maximumFractionDigits: token === 'usdc' ? 6 : 11
      })
    : '0'

  return (
    <div className='flex items-center justify-start w-full gap-4'>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(`relative rounded-3xl flex items-center justify-center w-auto h-6 md:h-12 aspect-square`)}>
        <Icon
          name='squircle'
          className={cn('size-16 absolute', {
            'text-ethereum/10': token === 'ethereum',
            'text-usdc/10': token === 'usdc'
          })}
        />
        <TokenCoaster size='lg' token={token} />
      </motion.div>
      <div className='flex items-center justify-between w-full'>
        <div className='text-left -space-y-1'>
          <p className={cn('')}>
            {token === 'usdc' && balance === null ? (
              // Fallback to UsdcBalance component if balance not provided
              <UsdcBalance compact />
            ) : (
              <span className='font-okxs font-normal text-indigo-100 text-xl'>{formattedBalance}</span>
            )}
          </p>
          <div className='flex items-center space-x-2'>
            <span className='text-white/60 font-okxs font-normal text-[8px] px-0.5 uppercase'>{token}</span>
            {isInsufficient && (
              <span className='text-[8px] uppercase text-red-400/80 font-okxs font-medium whitespace-nowrap'>
                Low balance
              </span>
            )}
          </div>
        </div>
        {showBalance && (
          <p className={`md:text-base text-sm font-brk px-2`}>
            <span className='font-okxs font-light pr-0.5 opacity-80'>$</span>
            <span className='font-normal font-okxs'>
              {((balance ?? 0) * (price ?? 1)).toLocaleString('en-US', {
                maximumFractionDigits: 2,
                currency: 'USD',
                currencyDisplay: 'symbol'
              })}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export { tokenData }
