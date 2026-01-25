import { Icon } from '@/lib/icons'
import { motion } from 'motion/react'
import { AnimatedNumber } from '../animated-number'
interface PayAmountProps {
  usdValue: number
  spinRandomAmount: VoidFunction
}
export const PayAmount = ({ usdValue, spinRandomAmount }: PayAmountProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' }, ease: 'easeInOut' }}>
      <div className='p-4 border-0 decoration-1 border-white/10'>
        <div className='flex items-center justify-between text-xs md:text-sm'>
          <div className='flex items-center space-x-8'>
            <button
              onClick={spinRandomAmount}
              className='btn btn-ghost btn-lg btn-circle hover:bg-transparent backdrop-blur-3xl'>
              <motion.div className='relative flex items-center justify-center h-6 w-6 aspect-square'>
                <Icon name='cash' className='absolute size-4 text-lime-200/50 blur-xs' />
                <Icon name='cash' className='absolute size-6 text-lime-100' />
              </motion.div>
            </button>
            <button className='relative btn btn-ghost btn-lg btn-circle bg-transparent backdrop-blur-lg hover:bg-transparent'>
              <Icon name='qrcode' className='absolute size-7 text-lime-200/50 blur-md' />
              <Icon name='qrcode' className='size-6 text-lime-100' />
            </button>
          </div>
          {/*<span className='opacity-70 font-exo font-bold uppercase italic'>Total</span>*/}
          <div className='text-right'>
            <span className='text-white text-2xl font-okxs'>
              $
              <AnimatedNumber
                value={usdValue}
                format={(v) => v.toPrecision(4)}
                precision={2}
                stiffness={150}
                damping={6}
              />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
