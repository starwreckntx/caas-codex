
'use client'

import { Badge } from '@/components/ui/badge'
import { Save, Archive, FileText, Clock, Play, Pause, CheckCircle } from 'lucide-react'
import { ConversationWithDetails } from '@/lib/types'

interface ConversationStatusIndicatorProps {
  conversation: ConversationWithDetails
}

export function ConversationStatusIndicator({ conversation }: ConversationStatusIndicatorProps) {
  const indicators = []

  // Status indicator
  if (conversation.status === 'ACTIVE') {
    indicators.push(
      <Badge key="active" className="bg-green-600/20 text-green-300 border-green-600/30">
        <Play className="w-3 h-3 mr-1" />
        Active
      </Badge>
    )
  } else if (conversation.status === 'PAUSED') {
    indicators.push(
      <Badge key="paused" className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30">
        <Pause className="w-3 h-3 mr-1" />
        Paused
      </Badge>
    )
  } else if (conversation.status === 'COMPLETED') {
    indicators.push(
      <Badge key="completed" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    )
  } else if (conversation.status === 'ARCHIVED') {
    indicators.push(
      <Badge key="archived" className="bg-purple-600/20 text-purple-300 border-purple-600/30">
        <Archive className="w-3 h-3 mr-1" />
        Archived
      </Badge>
    )
  }

  // Saved indicator
  if (conversation.savedConversation) {
    indicators.push(
      <Badge key="saved" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
        <Save className="w-3 h-3 mr-1" />
        Saved
      </Badge>
    )
  }

  // Knowledge documents indicator
  if (conversation.knowledgeDocuments && conversation.knowledgeDocuments.length > 0) {
    indicators.push(
      <Badge key="knowledge" className="bg-purple-600/20 text-purple-300 border-purple-600/30">
        <FileText className="w-3 h-3 mr-1" />
        {conversation.knowledgeDocuments.length} Doc{conversation.knowledgeDocuments.length > 1 ? 's' : ''}
      </Badge>
    )
  }

  // Moderator indicator
  if (conversation.moderatorEnabled) {
    indicators.push(
      <Badge key="moderator" className="bg-orange-600/20 text-orange-300 border-orange-600/30">
        <Clock className="w-3 h-3 mr-1" />
        Moderated
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {indicators}
    </div>
  )
}
