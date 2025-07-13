
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Brain, Zap, AlertCircle, BookOpen, GitBranch, CheckSquare } from 'lucide-react'
import { ConversationWithDetails } from '@/lib/types'

interface ModeratorInterventionProps {
  conversation: ConversationWithDetails
  onModeratorMessage: (message: any) => void
  onRefreshConversation: () => void
}

export function ModeratorIntervention({ 
  conversation, 
  onModeratorMessage, 
  onRefreshConversation 
}: ModeratorInterventionProps) {
  const [isInterventionPending, setIsInterventionPending] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastInterventionCheck, setLastInterventionCheck] = useState(0)

  // Check if moderator should intervene
  useEffect(() => {
    if (!conversation.moderatorEnabled) return

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/moderator?conversationId=${conversation.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsInterventionPending(data.shouldIntervene)
          setLastInterventionCheck(Date.now())
        }
      } catch (error) {
        console.error('Error checking moderator intervention:', error)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(checkInterval)
  }, [conversation.id, conversation.moderatorEnabled])

  // Also check immediately when messages change
  useEffect(() => {
    const checkImmediately = async () => {
      if (!conversation.moderatorEnabled) return
      
      try {
        const response = await fetch(`/api/moderator?conversationId=${conversation.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsInterventionPending(data.shouldIntervene)
        }
      } catch (error) {
        console.error('Error checking moderator intervention:', error)
      }
    }

    checkImmediately()
  }, [conversation.messages?.length, conversation.moderatorEnabled])

  const handleTriggerIntervention = async () => {
    if (!conversation.moderatorEnabled || isProcessing) return

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/moderator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Notify parent component about new moderator message
        onModeratorMessage(data.message)
        
        // If automatic handoff was successful, also handle the next AI message
        if (data.automaticHandoff && data.nextAIMessage) {
          console.log('Automatic handoff successful:', data.nextAIMessage)
          // The next AI message is already in the database, just refresh
        }
        
        // Refresh conversation to get updated state with both messages
        onRefreshConversation()
        
        // Reset intervention state
        setIsInterventionPending(false)
      } else {
        console.error('Error triggering moderator intervention:', response.statusText)
      }
    } catch (error) {
      console.error('Error triggering moderator intervention:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Don't show anything if moderator is not enabled
  if (!conversation.moderatorEnabled) {
    return null
  }

  return (
    <div className="p-3 sm:p-4 border-t border-slate-700 bg-slate-800/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-slate-300 font-medium text-sm sm:text-base">Mind Dojo Moderator</span>
          </div>
          
          {isInterventionPending && (
            <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Intervention Suggested</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {conversation.sessionGoal && (
            <div className="text-xs text-slate-400 max-w-xs sm:max-w-xs truncate">
              Goal: {conversation.sessionGoal}
            </div>
          )}
          
          <Button
            onClick={handleTriggerIntervention}
            disabled={isProcessing}
            size="sm"
            className={`text-xs sm:text-sm w-full sm:w-auto ${
              isInterventionPending 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-100' 
                : 'bg-purple-500 hover:bg-purple-600 text-slate-100'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {isInterventionPending ? 'Intervene Now' : 'Manual Intervention'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Moderator Stats */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <CheckSquare className="w-3 h-3 text-green-400 flex-shrink-0" />
          <span className="truncate">Messages: {conversation.messages?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="truncate">Moderator: {conversation.messages?.filter(m => m.messageType === 'MODERATOR').length || 0}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <GitBranch className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">Status: {conversation.status}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="truncate">Last Check: {lastInterventionCheck ? new Date(lastInterventionCheck).toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>
      
      {/* Action Type Legend */}
      <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2 text-xs">
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Devil's Advocate</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
          <BookOpen className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Summarization</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
          <GitBranch className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Flow Control</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-400 rounded">
          <CheckSquare className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Acknowledgement</span>
        </div>
      </div>
    </div>
  )
}
