
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Crown, Scroll, User, Clock } from 'lucide-react'
import { Conversation } from '@/lib/types'
import { useConversation } from '@/components/conversation-provider'

export function StoicConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { selectConversation, selectedConversation } = useConversation()

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        // Filter to show only stoic conversations (those using stoic category models)
        const stoicConversations = data.filter((conv: any) => 
          conv.modelA?.category === 'stoic' || conv.modelB?.category === 'stoic'
        )
        setConversations(stoicConversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`)
      if (response.ok) {
        const fullConversation = await response.json()
        selectConversation(fullConversation)
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error)
    }
  }

  const getPhilosopherIcon = (modelName: string) => {
    if (modelName?.includes('Marcus Aurelius')) return Crown
    if (modelName?.includes('Seneca')) return Scroll
    return User
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg animate-pulse">
            <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded mb-2"></div>
            <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <Scroll className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
          No philosophical dialogues yet
        </p>
        <p className="text-xs text-amber-500 dark:text-amber-500">
          Start a conversation between stoic philosophers
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const IconA = getPhilosopherIcon(conversation.modelA?.name || '')
        const IconB = getPhilosopherIcon(conversation.modelB?.name || '')
        const isSelected = selectedConversation?.id === conversation.id

        return (
          <Button
            key={conversation.id}
            variant={isSelected ? "default" : "ghost"}
            onClick={() => handleSelectConversation(conversation)}
            className={`w-full justify-start h-auto p-3 ${
              isSelected 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700' 
                : 'hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-900 dark:text-amber-100'
            }`}
          >
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <IconA className="h-4 w-4" />
                <span className="text-xs font-medium truncate">
                  {conversation.modelA?.name?.replace(/ /g, ' ')}
                </span>
                <span className="text-xs opacity-70">vs</span>
                <IconB className="h-4 w-4" />
                <span className="text-xs font-medium truncate">
                  {conversation.modelB?.name?.replace(/ /g, ' ')}
                </span>
              </div>
              
              <div className="text-left">
                <h4 className="text-sm font-medium leading-tight mb-1">
                  {conversation.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={conversation.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : conversation.status === 'ACTIVE' 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {conversation.status?.toLowerCase()}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-xs opacity-70">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
