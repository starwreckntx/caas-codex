
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  AlertCircle,
  Users,
  Download,
  Send,
  Settings,
  UserPlus,
  Volume2,
  Eye,
  Gavel,
  BookOpen,
  Mountain
} from 'lucide-react'
import { useConversation } from '@/components/conversation-provider'
import { TruthReliabilityIndicator } from '@/components/ui/truth-reliability-indicator'
import { Message, UserRole, ExportFormat } from '@/lib/types'

export function EnhancedDialogueView() {
  const { selectedConversation, approveAndAdvance } = useConversation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [userParticipation, setUserParticipation] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('OBSERVER')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('MARKDOWN')
  const [showControls, setShowControls] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  useEffect(() => {
    // Check if this is a round table conversation with user participation
    if (selectedConversation?.roundTableConversation) {
      setUserParticipation(selectedConversation.roundTableConversation.userParticipation)
      setUserRole(selectedConversation.roundTableConversation.userRole)
    }
  }, [selectedConversation])

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

  const handleSendUserMessage = async () => {
    if (!selectedConversation || !userMessage.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/user-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage.trim() })
      })

      if (response.ok) {
        setUserMessage('')
        // Refresh conversation to show new message
        // This would typically be handled by the conversation provider
      }
    } catch (error) {
      console.error('Error sending user message:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportConversation = async () => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportFormat,
          includeMetadata: true,
          includeTexts: true,
          includeWisdom: true
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stoic_dialogue_${selectedConversation.title.replace(/[^a-zA-Z0-9]/g, '_')}.${exportFormat.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setShowExportDialog(false)
      }
    } catch (error) {
      console.error('Error exporting conversation:', error)
    }
  }

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'MODERATOR': return Gavel
      case 'PARTICIPANT': return MessageCircle
      case 'FACILITATOR': return Users
      default: return Eye
    }
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
  const isRoundTable = !!selectedConversation.roundTableConversation
  const RoleIcon = getRoleIcon(userRole)

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="border-b border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                {selectedConversation.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-amber-700 dark:text-amber-300">
                {isRoundTable ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Round Table Discussion</span>
                    </div>
                    <span className="text-amber-500">•</span>
                    <div>
                      {selectedConversation.roundTableConversation?.participants?.length || 0} participants
                    </div>
                    {userParticipation && (
                      <>
                        <span className="text-amber-500">•</span>
                        <div className="flex items-center gap-1">
                          <RoleIcon className="h-4 w-4" />
                          <span>{userRole.toLowerCase()}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <IconA className="h-4 w-4" />
                      <span>{selectedConversation.modelA?.name}</span>
                    </div>
                    <span className="text-amber-500">•</span>
                    <div className="flex items-center gap-2">
                      <IconB className="h-4 w-4" />
                      <span>{selectedConversation.modelB?.name}</span>
                    </div>
                  </>
                )}
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

              {/* Controls Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Export Button */}
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-amber-950">
                  <DialogHeader>
                    <DialogTitle className="text-amber-900 dark:text-amber-100">
                      Export Conversation
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Export Format
                      </label>
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                        <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MARKDOWN">Markdown (.md)</SelectItem>
                          <SelectItem value="TXT">Plain Text (.txt)</SelectItem>
                          <SelectItem value="HTML">HTML (.html)</SelectItem>
                          <SelectItem value="JSON">JSON (.json)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowExportDialog(false)}
                        className="border-amber-200 dark:border-amber-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleExportConversation}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Continue Button */}
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

          {/* Enhanced Controls Panel */}
          {showControls && (
            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/50 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-amber-900 dark:text-amber-100">Truth Checking:</span>
                  <div className="text-amber-700 dark:text-amber-300">
                    {selectedConversation.truthCheckEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                {isRoundTable && (
                  <>
                    <div>
                      <span className="font-medium text-amber-900 dark:text-amber-100">Moderation:</span>
                      <div className="text-amber-700 dark:text-amber-300">
                        {selectedConversation.roundTableConversation?.moderationStyle?.toLowerCase()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-amber-900 dark:text-amber-100">Round:</span>
                      <div className="text-amber-700 dark:text-amber-300">
                        #{selectedConversation.roundTableConversation?.roundNumber || 1}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <span className="font-medium text-amber-900 dark:text-amber-100">Created:</span>
                  <div className="text-amber-700 dark:text-amber-300">
                    {new Date(selectedConversation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {selectedConversation.messages?.map((message: Message, index: number) => {
              const isFromModelA = message.modelId === selectedConversation.modelAId
              const isHuman = message.messageType === 'HUMAN'
              const model = isHuman ? null : (isFromModelA ? selectedConversation.modelA : selectedConversation.modelB)
              const Icon = isHuman ? User : getPhilosopherIcon(model?.name || '')
              
              return (
                <Card 
                  key={message.id} 
                  className={`${
                    isHuman 
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-blue-200 dark:border-blue-700'
                      : isFromModelA 
                        ? 'bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700' 
                        : 'bg-gradient-to-br from-stone-50 to-amber-50 dark:from-amber-900 dark:to-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isHuman
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                            : isFromModelA 
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                              : 'bg-gradient-to-br from-stone-400 to-stone-600'
                        }`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                            {isHuman ? 'Human Participant' : model?.name}
                          </h3>
                          <p className="text-sm text-amber-600 dark:text-amber-400 font-normal">
                            {isHuman ? userRole.toLowerCase() : model?.persona}
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

      {/* User Input Area (if participation is enabled) */}
      {userParticipation && (userRole === 'PARTICIPANT' || userRole === 'MODERATOR' || userRole === 'FACILITATOR') && (
        <div className="border-t border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={`Share your thoughts as a ${userRole.toLowerCase()}...`}
                  className="min-h-[80px] bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100"
                  disabled={isGenerating}
                />
              </div>
              <Button
                onClick={handleSendUserMessage}
                disabled={!userMessage.trim() || isGenerating}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white self-end"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
