import { ReactNode } from 'react'
import { AnimatedNumber } from '../animated-number'

interface TitleProps {
  id: string
  children?: ReactNode
}
export const Title = ({ id, children }: TitleProps) => {
  return (
    <label
      htmlFor={id}
      className='text-xs tracking-wide md:tracking-wide uppercase font-exo font-bold italic opacity-70 mb-2 mx-3 select-none'>
      {children}
    </label>
  )
}

interface USDValueProps {
  value: number
}

export const USDValue = ({ value }: USDValueProps) => {
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }

  return (
    <div className='md:text-sm mt-2 flex items-center'>
      <span className='text-xl font-sans font-bold text-white/60 mr-2'>≈</span>
      <span className='text-sm font-okxs opacity-90'>
        <span className='text-sm font-okxs font-light mx-px opacity-70'>$</span>
        <AnimatedNumber value={value} precision={2} stiffness={100} mass={0.1} damping={120} />
        {/*{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*/}
      </span>
    </div>
  )
}
