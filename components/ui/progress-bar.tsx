
'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
  showPercentage?: boolean
}

export function ProgressBar({ 
  progress, 
  message, 
  className,
  size = 'md',
  color = 'primary',
  showPercentage = false
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {(message || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {message && (
            <span className="text-sm text-slate-300">{message}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-slate-400">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn('w-full bg-slate-700 rounded-full', sizeClasses[size])}>
        <div 
          className={cn(
            'rounded-full transition-all duration-300 ease-out',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
