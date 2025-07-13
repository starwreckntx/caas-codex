
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface TypingIndicatorProps {
  isTyping: boolean
  modelName?: string
  type?: 'ai' | 'moderator' | 'user'
  className?: string
}

export function TypingIndicator({ 
  isTyping, 
  modelName, 
  type = 'ai',
  className 
}: TypingIndicatorProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isTyping) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isTyping])

  if (!isTyping) return null

  const getIcon = () => {
    switch (type) {
      case 'moderator':
        return <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      case 'user':
        return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      default:
        return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
    }
  }

  return (
    <div className={cn('flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg', className)}>
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-200">
            {modelName || (type === 'moderator' ? 'Mind Dojo Moderator' : 'AI Assistant')}
          </span>
          <span className="text-xs text-slate-400">is typing</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full bg-slate-400 animate-pulse',
                index < dots.length && 'bg-blue-400'
              )}
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
