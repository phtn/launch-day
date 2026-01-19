import { Icon, IconName } from '@/lib/icons'
import { motion } from 'motion/react'

const tokenData: Record<string, { name: string; color: string; icon: IconName }> = {
  BTC: { name: 'Bitcoin', color: '#f7931a', icon: 'ethereum' },
  ETH: { name: 'Ethereum', color: '#627eea', icon: 'ethereum' },
  USDT: { name: 'Tether', color: '#26a17b', icon: 'ethereum' },
  USDC: { name: 'USD Coin', color: '#2775ca', icon: 'ethereum' },
  SOL: { name: 'Solana', color: '#9945ff', icon: 'ethereum' },
  BNB: { name: 'BNB', color: '#f0b90b', icon: 'ethereum' }
}

interface TokenDisplayProps {
  token: string | null
  balance: number | null
  showBalance?: boolean
  price: number | null
  size?: 'sm' | 'md' | 'lg'
}

export const TokenDisplay = ({ token, balance, price, showBalance = true, size = 'md' }: TokenDisplayProps) => {
  const sizes = {
    sm: { icon: 'w-8 h-8 text-sm', text: 'text-sm', balance: 'text-xs' },
    md: { icon: 'w-10 h-10 text-base', text: 'text-base', balance: 'text-sm' },
    lg: { icon: 'w-12 h-12 text-lg', text: 'text-lg', balance: 'text-base' }
  }

  return (
    <div className='flex items-center justify-start w-full gap-2'>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative ${sizes[size].icon} rounded-full flex items-center justify-center w-auto h-6 md:h-7 aspect-square`}>
        <Icon name='ethereum' className='size-6 md:size-7 absolute z-5 text-indigo-400/60 blur-xl' />
        <Icon name='ethereum' className='size-5 md:size-6 absolute z-10 text-indigo-400' />
      </motion.div>
      <div className='flex items-center justify-between w-full'>
        <p className={`font-brk text-indigo-100 font-thin text-left text-lg`}>
          {balance?.toLocaleString('en-US', { maximumFractionDigits: 11 })}
          <span className='text-white/50 font-thin text-xs px-0.5'>{token}</span>
        </p>
        {showBalance && (
          <p className={`md:text-base text-sm font-brk px-2`}>
            <span className='font-thin pr-0.5 text-teal-300/60'>$</span>
            <span className='text-white/90 font-normal font-brk'>
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
