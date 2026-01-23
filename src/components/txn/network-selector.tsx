import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
interface NetworkSelectorProps {
  currentNetwork: string | null
  onSelectNetwork: (network: string) => () => void
}

export const NetworkSelector = ({ currentNetwork, onSelectNetwork }: NetworkSelectorProps) => {
  const allowedNetworks = ['sepolia', 'ethereum', 'polygon', 'amoy'] as const
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.2 }}
      className='bg-linear-to-r from-zinc-300/1 via-zinc-300/3 to-zinc-300/1 py-2 px-1.5 flex items-center rounded-xl justify-between'>
      {allowedNetworks.map((net, i) => {
        const isActive = currentNetwork === net
        return (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              duration: 0.15,
              delay: i * 0.033 * 1.03,
              ease: 'circInOut'
            }}
            key={net}
            onClick={onSelectNetwork(net)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex items-center justify-center -space-x-1.5 py-1 px-1.5 h-8 overflow-hidden rounded-lg transition-colors',
              {
                'bg-white/5': isActive,
                'hover:bg-white/2 ': !isActive,
                'cursor-pointer': true
              }
            )}>
            <Icon
              name={net === 'sepolia' ? 'ethereum' : net === 'polygon' || net === 'amoy' ? 'polygon' : 'ethereum'}
              className={cn('absolute left-1 blur-md -rotate-25 text-zinc-100/30 size-7 opacity-50', {
                'opacity-100': isActive,
                'text-rose-400': net === 'sepolia' && isActive,
                'text-polygon': net === 'polygon' && isActive,
                'text-ethereum': net === 'ethereum' && isActive,
                'text-rose-300': net === 'amoy' && isActive
              })}
            />
            <Icon
              name={net === 'sepolia' ? 'ethereum' : net === 'polygon' || net === 'amoy' ? 'polygon' : 'ethereum'}
              className={cn('text-zinc-300/20 size-5', {
                'text-rose-400': net === 'sepolia' && isActive,
                'text-polygon': net === 'polygon' && isActive,
                'text-ethereum': net === 'ethereum' && isActive,
                'text-rose-300': net === 'amoy' && isActive
              })}
            />
            <span
              className={cn('lowercase drop-shadow-md', {
                ' font-polyn font-bold': net === 'polygon' || net === 'amoy',
                ' font-bold tracking-tight': net === 'ethereum',
                'font-normal font-okxs tracking-tight': net === 'sepolia',
                ' font-polyn font-semibold tracking-tighter': net === 'amoy'
              })}>
              {net}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
