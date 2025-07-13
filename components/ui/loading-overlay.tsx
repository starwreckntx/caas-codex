
'use client'

import { cn } from '@/lib/utils'
import { LoadingSpinner } from './loading-spinner'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  className?: string
  blur?: boolean
  children?: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message, 
  progress,
  className,
  blur = false,
  children 
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      {/* Content with optional blur */}
      <div className={cn(blur && isLoading && 'blur-sm opacity-50 pointer-events-none')}>
        {children}
      </div>
      
      {/* Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" />
              
              {message && (
                <p className="text-slate-200 text-sm text-center font-medium">
                  {message}
                </p>
              )}
              
              {progress !== undefined && progress > 0 && (
                <div className="w-full">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    {Math.round(progress)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
