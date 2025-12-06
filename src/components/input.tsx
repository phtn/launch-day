import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, useCallback, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const [value, setValue] = useState('')

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }, [])

  return <input ref={ref} onChange={handleChange} value={value} {...props} className={cn('lg:grow', className)} />
})

Input.displayName = 'Input'
