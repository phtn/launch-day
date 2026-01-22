import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type Token = 'usdc' | 'ethereum' | 'bitcoin'

interface TokenProps {
  token: Token
  size?: 'sm' | 'md' | 'lg'
}

export const TokenCoaster = ({ token, size = 'md' }: TokenProps) => {
  return (
    <div className='size-10 relative flex items-center justify-center'>
      <div
        className={cn(
          'absolute size-7 aspect-square rounded-full',
          { 'bg-white': token === 'usdc' },
          { 'size-5': size === 'lg', 'size-4': size === 'md', 'size-3.5': size === 'sm' }
        )}
      />
      <Icon
        name={token as IconName}
        className={cn(
          'absolute size-5 text-usdc/40 blur-xl',
          { 'size-6': size === 'lg', 'size-5': size === 'md', 'size-4': size === 'sm' },
          {
            'text-ethereum/40': token === 'ethereum',
            'text-bitcoin/40': token === 'bitcoin'
          }
        )}
      />
      <Icon
        name={token as IconName}
        className={cn(
          'relative size-5 text-usdc',
          { 'size-6': size === 'lg', 'size-5': size === 'md', 'size-4': size === 'sm' },
          {
            'text-ethereum': token === 'ethereum',
            'text-bitcoin': token === 'bitcoin'
          }
        )}
      />
    </div>
  )
}
