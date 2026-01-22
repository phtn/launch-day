import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Token } from './token'
import { TokenModern } from './token-modern'

interface TokensProps {
  tokens: Token[]
  excludeToken?: Token
}

export const Tokens = ({ tokens, excludeToken }: TokensProps) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const filteredTokens = tokens.filter((t) => t !== excludeToken)
  const handleTokenSelect = (token: Token) => () => {
    setSelectedToken(token)
  }

  return (
    <div className='relative min-h-40'>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.05 }}
        className='absolute z-50 w-full mt-px rounded-3xl bg-zinc-950 backdrop-blur-xl border border-white/10 shadow-2xl'>
        {filteredTokens.map((token) => (
          <motion.button
            key={token}
            onClick={handleTokenSelect(token)}
            className={cn(
              'w-full md:hover:bg-zinc-100/5 flex items-center justify-between py-4 px-3 rounded-3xl transition-colors duration-75'
            )}>
            <TokenModern price={0} token={token} balance={0} size='sm' />
            {selectedToken === token && <Icon name='check' className='w-3 h-3 text-cyan-100/60' />}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
