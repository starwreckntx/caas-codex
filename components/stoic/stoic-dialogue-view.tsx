
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Crown, 
  Scroll, 
  User, 
  Play, 
  Pause, 
  RotateCcw,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useConversation } from '@/components/conversation-provider'
import { TruthReliabilityIndicator } from '@/components/ui/truth-reliability-indicator'
import { Message } from '@/lib/types'

export function StoicDialogueView() {
  const { selectedConversation, approveAndAdvance } = useConversation()
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const getPhilosopherIcon = (modelName: string) => {
    if (modelName?.includes('Marcus Aurelius')) return Crown
    if (modelName?.includes('Seneca')) return Scroll
    return User
  }

  const handleContinueDialogue = async () => {
    if (!selectedConversation || isGenerating) return

    setIsGenerating(true)
    try {
      await approveAndAdvance?.()
    } catch (error) {
      console.error('Error continuing dialogue:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Scroll className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <p className="text-amber-600 dark:text-amber-400">
            No dialogue selected
          </p>
        </div>
      </div>
    )
  }

  const IconA = getPhilosopherIcon(selectedConversation.modelA?.name || '')
  const IconB = getPhilosopherIcon(selectedConversation.modelB?.name || '')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                {selectedConversation.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <IconA className="h-4 w-4" />
                  <span>{selectedConversation.modelA?.name}</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-2">
                  <IconB className="h-4 w-4" />
                  <span>{selectedConversation.modelB?.name}</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{selectedConversation.messages?.length || 0} exchanges</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge 
                variant={selectedConversation.status === 'ACTIVE' ? 'default' : 'secondary'}
                className={
                  selectedConversation.status === 'ACTIVE' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                }
              >
                {selectedConversation.status?.toLowerCase()}
              </Badge>

              <Button
                onClick={handleContinueDialogue}
                disabled={isGenerating || selectedConversation.status !== 'ACTIVE'}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Reflecting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Dialogue
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {selectedConversation.messages?.map((message: Message, index: number) => {
              const isFromModelA = message.modelId === selectedConversation.modelAId
              const model = isFromModelA ? selectedConversation.modelA : selectedConversation.modelB
              const Icon = getPhilosopherIcon(model?.name || '')
              
              return (
                <Card 
                  key={message.id} 
                  className={`${
                    isFromModelA 
                      ? 'bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700' 
                      : 'bg-gradient-to-br from-stone-50 to-amber-50 dark:from-amber-900 dark:to-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isFromModelA 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                            : 'bg-gradient-to-br from-stone-400 to-stone-600'
                        }`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                            {model?.name}
                          </h3>
                          <p className="text-sm text-amber-600 dark:text-amber-400 font-normal">
                            {model?.persona}
                          </p>
                        </div>
                      </CardTitle>
                      
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(message.createdAt)}</span>
                        {message.isApproved && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="prose prose-amber dark:prose-invert max-w-none">
                      <p className="text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Truth Reliability Indicator for Stoic mode */}
                    {message.truthAssessment && (
                      <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-700">
                        <TruthReliabilityIndicator 
                          assessment={message.truthAssessment}
                          showDetails={false}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* Generating indicator */}
            {isGenerating && (
              <Card className="bg-gradient-to-br from-amber-100 to-stone-100 dark:from-stone-700 dark:to-amber-800 border-amber-300 dark:border-amber-600 border-dashed">
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-3 text-amber-700 dark:text-amber-300">
                    <div className="animate-pulse flex items-center gap-2">
                      <Scroll className="h-5 w-5" />
                      <span>Philosopher is contemplating...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
