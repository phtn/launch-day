import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} {...props} className={cn('lg:grow', className)} />
})

Input.displayName = 'Input'
