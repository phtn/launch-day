'use client'

import { Particles } from '@/components/particles'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon } from '@/lib/icons'
import { motion, useAnimation } from 'motion/react'
import { useEffect } from 'react'

export const ProgressCard = () => {
  const controls = useAnimation()
  const progress = 65 // The progress percentage

  useEffect(() => {
    // Animate the width of the progress bar to the target percentage
    controls.start({ width: `${progress}%` }, { duration: 1.5, ease: 'easeOut' })
  }, [controls, progress])

  return (
    <div className='flex items-center justify-center py-44'>
      <div className='relative w-full max-w-md rounded-3xl bg-dark-card-bg p-6 shadow-xl'>
        {/* Header Section */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-2 text-white'>
            <Icon name='sparkle' className='w-5 h-5 text-gray-400' />
            <h2 className='text-lg font-semibold'>Project Progress</h2>
          </div>
          {/* Button for "Onboarding prototype" with updated styling */}
          <button className='btn-lg bg-black text-white rounded-2xl px-4 py-2 shadow-beta-button hover:bg-gray-800 transition-all duration-200 ease-in-out active:translate-y-0.5 active:shadow-none'>
            Onboarding prototype
          </button>
        </div>

        {/* Progress Bar Section */}
        <div className='mb-6'>
          <p className='text-5xl font-bold text-white mb-2'>{progress}%</p>
          <div className='relative h-4 rounded-full bg-linear-to-r from-gray-300 via-gray-300 to-gray-500'>
            {/* Glow layer - positioned behind the main bar */}
            <motion.div
              className='absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-emerald-400 via-progress-end to-cyan-300 z-0'
              style={{ filter: 'blur(10px)' }} // Apply blur directly for the glow effect
              initial={{ width: 0 }}
              animate={controls}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            {/* Actual progress bar - on top of the glow */}
            <motion.div
              className='absolute top-0 left-0 h-full rounded-full shadow-2xs bg-linear-to-r from-emerald-300 via-progress-end to-cyan-200 z-10'
              initial={{ width: 0 }}
              animate={controls}>
              <Particles
                ease={40}
                vy={0.001}
                vx={-0.25}
                size={0.15}
                color='#000000'
                quantity={1050}
                staticity={0.25}
                className='absolute z-200 inset-0 top-0 h-full select-none pointer-events-none'
              />
            </motion.div>
            <span className='absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white z-20'>
              Due July 28
            </span>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className='flex items-center justify-between mb-6'>
          <p className='text-gray-300 text-sm'>Collaborators 3</p>
          <div className='hidden _flex -space-x-2'>
            {/*<Avatar className='w-10 h-10 border-2 border-dark-card-bg'>
              <AvatarImage src='/placeholder.svg?height=40&width=40' alt='Avatar 1' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className='w-10 h-10 border-2 border-dark-card-bg'>
              <AvatarImage src='/placeholder.svg?height=40&width=40' alt='Avatar 2' />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <Avatar className='w-10 h-10 border-2 border-dark-card-bg'>
              <AvatarImage src='/placeholder.svg?height=40&width=40' alt='Avatar 3' />
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>*/}
          </div>
        </div>

        {/* More details button */}
        <div className='flex justify-end'>
          <button className='btn-lg text-gray-300 hover:bg-gray-700 hover:text-white rounded-full px-4 py-2'>
            More details <Icon name='arrow-right-02' className='ml-2 w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
}

export const ProgressBar = ({ progress }: ProgressBarProps) => (
  <div className='relative flex items-center h-4 rounded-md bg-linear-to-r from-gray-500 via-gray-400 to-gray-500'>
    {/* Glow layer - positioned behind the main bar */}
    <motion.div
      className='absolute top-0 left-1 h-4 rounded-full bg-linear-to-r from-emerald-400 to-cyan-300 z-0'
      style={{ filter: 'blur(10px)' }} // Apply blur directly for the glow effect
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
    {/* Actual progress bar - on top of the glow */}
    <motion.div
      className='absolute top-0 left-0 h-4 rounded-md shadow-2xs bg-linear-to-r from-emerald-300 via-progress-end to-cyan-200'
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ ease: 'easeOut' }}>
      <Particles
        ease={40}
        vy={0.001}
        vx={-0.25 - progress / 100}
        size={0.08}
        color='#FFFFFF'
        quantity={1050}
        staticity={0.25}
        className='absolute z-200 inset-0 top-0 h-4 w-full select-none'
      />
    </motion.div>
    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white z-20'></span>
  </div>
)
