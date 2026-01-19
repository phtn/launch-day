import { ReactNode } from 'react'

interface TitleProps {
  id: string
  children?: ReactNode
}
export const Title = ({ id, children }: TitleProps) => {
  return (
    <label
      htmlFor={id}
      className='text-xs tracking-widest md:tracking-wide md:text-sm uppercase font-brk text-white/60 mb-2 mx-3'>
      {children}
    </label>
  )
}
