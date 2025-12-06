import { ClassName } from '@/app/types'
import { cn } from '@/lib/utils'
import { ChangeEvent, useCallback, useMemo } from 'react'

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: Array<number>
  defaultValue?: number
  onValueChange: (value: Array<number>) => void
  className?: ClassName
}

export const Slider = ({
  min = 0,
  max = 100,
  step = 10,
  defaultValue = 50,
  value,
  onValueChange,
  className
}: SliderProps) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onValueChange([event.target.valueAsNumber])
    },
    [onValueChange]
  )

  // Calculate tick marks based on min/max/step
  const ticks = useMemo(() => {
    const tickCount = Math.floor((max - min) / step) + 1
    return Array.from({ length: tickCount }, (_, i) => min + i * step)
  }, [min, max, step])

  return (
    <div className={cn('w-full max-w-xs', className)}>
      <input
        onChange={handleChange}
        type='range'
        min={min}
        max={max}
        value={value?.[0] ?? defaultValue}
        className='range range-xs'
        step={step}
      />
      <div className='flex justify-between px-0.5 mt-1 text-[8px] font-thin font-space'>
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  )
}
