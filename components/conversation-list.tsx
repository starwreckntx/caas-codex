
'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Clock, Users, Search, Archive, FileText, Tag, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConversationWithDetails } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { NewConversationModal } from './new-conversation-modal'
import { ConversationStatusIndicator } from './conversation-status-indicator'
import { ArchiveManagement } from './archive-management'
import { ConversationSkeleton } from '@/components/ui/skeleton-loader'
import { useConversation } from '@/components/conversation-provider'

interface ConversationListProps {
  onSelectConversation?: (conversation: ConversationWithDetails) => void
  selectedConversationId?: string
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { 
    conversations, 
    isLoading, 
    isLoadingByKey, 
    refreshConversations 
  } = useConversation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSaved, setFilterSaved] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNewConversation = () => {
    setIsModalOpen(true)
  }

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    if (onSelectConversation) {
      onSelectConversation(conversation)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.modelA?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.modelB?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.sessionGoal?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || conversation.status === filterStatus
    
    const matchesSaved = filterSaved === 'all' || 
                        (filterSaved === 'saved' && conversation.savedConversation) ||
                        (filterSaved === 'unsaved' && !conversation.savedConversation)
    
    return matchesSearch && matchesStatus && matchesSaved
  })

  if (isLoading || isLoadingByKey('conversations')) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Conversations</h2>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-300"
                disabled
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button
                size="sm"
                className="btn-primary"
                disabled
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>
          
          {/* Search and Filters Skeleton */}
          <div className="space-y-2">
            <div className="relative">
              <div className="h-10 bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1 h-10 bg-slate-700 rounded animate-pulse" />
              <div className="flex-1 h-10 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          
          <div className="h-4 bg-slate-700 rounded animate-pulse mt-2 w-1/3" />
        </div>

        {/* Conversation List Skeleton */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <ConversationSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Conversations</h2>
          <div className="flex space-x-2">
            <ArchiveManagement>
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </ArchiveManagement>
            <Button
              onClick={handleNewConversation}
              className="btn-primary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSaved} onValueChange={setFilterSaved}>
              <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by saved" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="unsaved">Unsaved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mt-2">
          {filteredConversations.length} of {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm || filterStatus !== 'all' || filterSaved !== 'all' 
                ? 'No matching conversations' 
                : 'No conversations yet'
              }
            </p>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all' || filterSaved !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start a new AI dialogue'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-slate-700 border-slate-600 border-l-4 border-l-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-100 truncate flex-1">
                    {conversation.savedConversation?.customName || conversation.title}
                  </h3>
                </div>
                
                {/* Status Indicators */}
                <div className="mb-2">
                  <ConversationStatusIndicator conversation={conversation} />
                </div>
                
                <div className="flex items-center text-sm text-slate-400 mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="truncate">
                    {conversation.modelA?.name} × {conversation.modelB?.name}
                  </span>
                </div>
                
                {/* Description */}
                {(conversation.savedConversation?.description || conversation.sessionGoal) && (
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                    {conversation.savedConversation?.description || conversation.sessionGoal}
                  </p>
                )}
                
                {/* Tags */}
                {conversation.savedConversation?.tags && conversation.savedConversation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {conversation.savedConversation.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-slate-600 text-slate-200">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {conversation.savedConversation.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-200">
                        +{conversation.savedConversation.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {conversation._count?.messages || 0}
                    </div>
                    {conversation.knowledgeDocuments && conversation.knowledgeDocuments.length > 0 && (
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {conversation.knowledgeDocuments.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <NewConversationModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  )
}
