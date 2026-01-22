import type { TokenBalance } from '@/hooks/use-network-tokens'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Token } from './token'
import { TokenModern } from './token-modern'

interface TokensProps {
  tokens: Token[]
  excludeToken?: Token
  tokenBalances?: TokenBalance[]
  selectedToken?: Token | null
  paymentAmountUsd?: string
  tokenPrices?: { usdc: number; ethereum: number | null }
  onTokenSelect?: (token: Token) => void
}

export const Tokens = ({
  tokens,
  excludeToken,
  tokenBalances = [],
  selectedToken,
  paymentAmountUsd = '',
  tokenPrices,
  onTokenSelect
}: TokensProps) => {
  const filteredTokens = tokens.filter((t) => t !== excludeToken)

  // Create a map of token balances for quick lookup
  const balanceMap = new Map<Token, TokenBalance>()
  tokenBalances.forEach((tb) => {
    balanceMap.set(tb.token, tb)
  })

  const handleTokenSelect = (token: Token) => () => {
    onTokenSelect?.(token)
  }

  // Get token price
  const getTokenPrice = (token: Token): number | null => {
    if (!tokenPrices) return null
    if (token === 'usdc') return tokenPrices.usdc
    if (token === 'ethereum') return tokenPrices.ethereum
    return null
  }

  return (
    <div className='relative min-h-40'>
      <motion.div
        initial={{ opacity: 0, y: -2, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className='absolute z-50 w-full mt-px rounded-3xl bg-zinc-950 backdrop-blur-xl border border-white/10 shadow-2xl'>
        {filteredTokens.map((token) => {
          const tokenBalance = balanceMap.get(token)
          const balance = tokenBalance ? Number.parseFloat(tokenBalance.formatted) : 0
          const price = getTokenPrice(token)

          // Check if this token has insufficient balance
          // Convert USD amount to token amount and compare with balance
          const usdAmount = Number.parseFloat(paymentAmountUsd)
          const tokenPrice = getTokenPrice(token)
          const tokenAmount = tokenPrice && !Number.isNaN(usdAmount) && usdAmount > 0 ? usdAmount / tokenPrice : 0
          const hasInsufficientBalance =
            paymentAmountUsd && !Number.isNaN(usdAmount) && usdAmount > 0 && tokenAmount > balance

          return (
            <motion.button
              key={token}
              onClick={handleTokenSelect(token)}
              className={cn(
                'w-full md:hover:bg-zinc-100/5 flex items-center justify-between py-4 px-3 rounded-3xl transition-colors duration-75',
                {
                  'bg-white/5': selectedToken === token
                }
              )}>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <TokenModern
                  isInsufficient={hasInsufficientBalance}
                  price={price ?? 0}
                  token={token}
                  balance={balance}
                  size='sm'
                />
              </div>
              {selectedToken === token && <Icon name='check' className='w-3 h-3 text-cyan-100/60 shrink-0' />}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
