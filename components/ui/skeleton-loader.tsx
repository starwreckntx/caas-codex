
'use client'

import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  height?: string
  animate?: boolean
}

export function SkeletonLoader({ 
  className, 
  lines = 1, 
  height = 'h-4',
  animate = true 
}: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-slate-700 rounded',
            height,
            animate && 'animate-pulse',
            index === lines - 1 && lines > 1 && 'w-3/4' // Make last line shorter
          )}
        />
      ))}
    </div>
  )
}

// Specific skeleton components
export function MessageSkeleton() {
  return (
    <div className="flex space-x-3 p-4">
      <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-700 rounded animate-pulse w-1/4" />
        <div className="space-y-1">
          <div className="h-4 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 bg-slate-700 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
      <div className="space-y-3">
        <div className="h-5 bg-slate-700 rounded animate-pulse w-3/4" />
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-slate-700 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-1/4" />
        </div>
      </div>
    </div>
  )
}
