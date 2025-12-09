import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  mode?: 'dark' | 'light'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, mode, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        'lg:grow',
        className,
        mode === 'dark' ? 'placeholder:text-indigo-200/40 text-orange-100' : 'text-base-100 placeholder:text-slate-500'
      )}
    />
  )
})

Input.displayName = 'Input'
