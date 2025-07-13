
'use client'

import { useState, useEffect } from 'react'
import { Bot, User, CheckCircle, Clock, AlertCircle, MessageSquare, Brain, Zap, BookOpen, GitBranch, CheckSquare, Shield } from 'lucide-react'
import { Message, ConversationWithDetails } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ChainOfThought } from './chain-of-thought'
import { ModeratorIntervention } from './moderator-intervention'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { MessageSkeleton } from '@/components/ui/skeleton-loader'
import { TruthReliabilityIndicator } from '@/components/ui/truth-reliability-indicator'
import { useConversation } from '@/components/conversation-provider'

interface DialogueViewProps {
  conversation?: ConversationWithDetails | null
  onRefreshConversation?: () => void
}

export function DialogueView({ conversation, onRefreshConversation }: DialogueViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const { 
    isLoadingByKey, 
    getLoadingMessage, 
    getLoadingProgress 
  } = useConversation()

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || [])
    }
  }, [conversation])

  const handleModeratorMessage = (message: any) => {
    setMessages(prev => [...prev, message])
  }

  const handleRefreshConversation = () => {
    onRefreshConversation?.()
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
          <p className="text-sm">Select a conversation from the list to view the AI dialogue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-4 pt-16 md:pt-4 border-b border-slate-700 bg-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-100 truncate">
              {conversation.title}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-400 mt-1 space-y-1 sm:space-y-0">
              <span className="flex items-center mr-4">
                <Bot className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{conversation.modelA?.name}</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">×</span>
              <span className="flex items-center sm:ml-4">
                <Bot className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{conversation.modelB?.name}</span>
              </span>
              {conversation.moderatorEnabled && (
                <>
                  <span className="text-slate-500 hidden sm:inline sm:ml-4">×</span>
                  <span className="flex items-center sm:ml-4">
                    <Brain className="w-4 h-4 mr-1 text-purple-400 flex-shrink-0" />
                    <span className="text-purple-400 truncate">Mind Dojo Moderator</span>
                  </span>
                </>
              )}
            </div>
            {conversation.moderatorEnabled && conversation.sessionGoal && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                <div className="flex items-center mb-1">
                  <Zap className="w-3 h-3 mr-1 text-amber-400 flex-shrink-0" />
                  <span className="font-medium text-amber-400">Session Goal:</span>
                </div>
                <p className="text-slate-200">{conversation.sessionGoal}</p>
              </div>
            )}
          </div>
          <div className="text-right mt-2 md:mt-0 md:ml-4 flex-shrink-0">
            <div className={`px-3 py-1 rounded-full text-sm ${
              conversation.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
              conversation.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400' :
              conversation.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {conversation.status}
            </div>
            {conversation.moderatorEnabled && (
              <div className="mt-1 px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                Moderated
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6 pb-20 sm:pb-4">
        {messages.length === 0 && !isLoadingByKey('approve-advance') ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">This conversation hasn't started</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
            const isModeratorMessage = message.messageType === 'MODERATOR'
            const isModelAMessage = message.modelId === conversation.modelAId
            const isModelBMessage = message.modelId === conversation.modelBId
            
            return (
              <div
                key={message.id}
                className={`flex ${
                  isModeratorMessage ? 'justify-center' : 
                  isModelAMessage ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`w-full sm:max-w-2xl message-bubble ${
                    isModeratorMessage ? 'moderator-message' : 
                    isModelAMessage ? 'model-a' : 'model-b'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        isModeratorMessage ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        isModelAMessage ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {message.messageType === 'HUMAN' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : message.messageType === 'MODERATOR' ? (
                          <Brain className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">
                          {message.messageType === 'HUMAN' ? 'Human Moderator' : 
                           message.messageType === 'MODERATOR' ? 'Mind Dojo Moderator' :
                           isModelAMessage ? conversation.modelA?.name : conversation.modelB?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {message.isApproved ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Moderator Action Indicator */}
                  {isModeratorMessage && message.moderatorAction && (
                    <div className="mb-3 flex items-center">
                      <div className={`px-2 py-1 rounded-full text-xs flex items-center ${
                        message.moderatorAction === 'DEVILS_ADVOCATE' ? 'bg-red-500/20 text-red-400' :
                        message.moderatorAction === 'SUMMARIZATION' ? 'bg-blue-500/20 text-blue-400' :
                        message.moderatorAction === 'FLOW_CONTROL' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {message.moderatorAction === 'DEVILS_ADVOCATE' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {message.moderatorAction === 'SUMMARIZATION' && <BookOpen className="w-3 h-3 mr-1" />}
                        {message.moderatorAction === 'FLOW_CONTROL' && <GitBranch className="w-3 h-3 mr-1" />}
                        {message.moderatorAction === 'SIMPLE_ACKNOWLEDGEMENT' && <CheckSquare className="w-3 h-3 mr-1" />}
                        {message.moderatorAction.replace('_', ' ')}
                      </div>
                      {message.nextSpeaker && (
                        <div className="ml-2 px-2 py-1 rounded-full text-xs bg-slate-600/50 text-slate-300">
                          Next: {message.nextSpeaker === 'modelA' ? conversation.modelA?.name : 
                                message.nextSpeaker === 'modelB' ? conversation.modelB?.name : 
                                message.nextSpeaker}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-slate-200 leading-relaxed">
                    {message.content}
                  </div>
                  
                  {/* Next Speaker Prompt */}
                  {isModeratorMessage && message.promptForNext && (
                    <div className="mt-3 p-2 bg-slate-700/30 rounded-lg text-sm">
                      <div className="flex items-center mb-1">
                        <Zap className="w-3 h-3 mr-1 text-amber-400" />
                        <span className="font-medium text-amber-400">Guidance for Next Speaker:</span>
                      </div>
                      <p className="text-slate-300">{message.promptForNext}</p>
                    </div>
                  )}
                  
                  {/* Chain of Thought */}
                  {(message.messageType === 'AI' || message.messageType === 'MODERATOR') && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <ChainOfThought
                        chainData={message.chainOfThought}
                        thoughtSteps={message.thoughtSteps || undefined}
                        reasoningMeta={message.reasoningMeta}
                      />
                    </div>
                  )}

                  {/* Truth Reliability Assessment */}
                  {(message.messageType === 'AI' || message.messageType === 'MODERATOR') && conversation?.truthCheckEnabled === true && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center mb-2">
                        <Shield className="w-4 h-4 text-cyan-400 mr-2" />
                        <span className="text-sm font-medium text-cyan-400">Truth Reliability Assessment</span>
                      </div>
                      <TruthReliabilityIndicator
                        assessment={message.truthAssessment}
                        issues={message.detectedIssues}
                        alerts={message.truthAlerts}
                        showDetails={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Typing Indicators */}
          {isLoadingByKey('approve-advance') && (
            <TypingIndicator
              isTyping={true}
              modelName={conversation?.moderatorEnabled ? 'Mind Dojo Moderator' : 'AI Assistant'}
              type={conversation?.moderatorEnabled ? 'moderator' : 'ai'}
              className="animate-fade-in"
            />
          )}
          
          {isLoadingByKey('intervene') && (
            <TypingIndicator
              isTyping={true}
              modelName="Human Moderator"
              type="user"
              className="animate-fade-in"
            />
          )}
          
          {isLoadingByKey('enhanced-intervene') && (
            <TypingIndicator
              isTyping={true}
              modelName="Enhanced Human Intervention"
              type="user"
              className="animate-fade-in"
            />
          )}
          
          {isLoadingByKey('refresh-conversation') && (
            <div className="flex justify-center">
              <div className="bg-slate-800/50 rounded-lg p-4 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-slate-300">Refreshing conversation...</span>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Moderator Intervention Panel */}
      <ModeratorIntervention
        conversation={conversation}
        onModeratorMessage={handleModeratorMessage}
        onRefreshConversation={handleRefreshConversation}
      />
    </div>
  )
}
