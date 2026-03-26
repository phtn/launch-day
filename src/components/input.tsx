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

export const ModernInput = forwardRef<HTMLInputElement, InputProps>((inputProps, ref) => {
  const { className, value, defaultValue, ...props } = inputProps
  // Check if value prop was provided (controlled component)
  const isControlled = 'value' in inputProps
  return (
    <div className='flex items-center space-x-2'>
      <input
        {...props}
        ref={ref}
        {...(isControlled ? { value: value ?? '' } : { defaultValue })}
        className={cn(
          'flex md:h-14 h-9 w-full rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-xs shadow-2xs',
          ' bg-greyed/5 dark:bg-background/25 border border-origin dark:border-zinc-700',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground/80 placeholder:tracking-tight ',
          'focus-visible:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'dark:focus-visible:ring-primary-hover/50 ring-offset-background',
          className
        )}
      />
    </div>
  )
})
ModernInput.displayName = 'ModernInput'
