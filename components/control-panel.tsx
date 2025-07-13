
'use client'

import { useState } from 'react'
import { Play, Pause, MessageSquare, Settings, FileText, Bot, Users, Target, Lightbulb, AlertTriangle, Eye, Send, Save, Archive, Shield, ShieldCheck, ShieldAlert, ShieldX, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ConversationWithDetails } from '@/lib/types'
import { MindDojoModerator } from '@/lib/moderator-service'
import { SaveConversationDialog } from '@/components/save-conversation-dialog'
import { KnowledgeTransferDialog } from '@/components/knowledge-transfer-dialog'
import { useConversation } from '@/components/conversation-provider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProgressBar } from '@/components/ui/progress-bar'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

interface ControlPanelProps {
  conversation?: ConversationWithDetails | null
  onApproveAndAdvance?: () => void
  onIntervene?: (message: string) => void
  onEnhancedIntervene?: (interventionType: string, message: string) => void
  onPauseResume?: () => void
}

export function ControlPanel({ 
  conversation, 
  onApproveAndAdvance, 
  onIntervene, 
  onEnhancedIntervene,
  onPauseResume 
}: ControlPanelProps) {
  const { 
    saveConversation, 
    archiveConversation, 
    convertToKnowledgeDocument,
    performTruthCheck,
    performBatchTruthCheck,
    toggleTruthChecking,
    isLoadingByKey,
    getLoadingProgress,
    getLoadingMessage,
    getLoadingError
  } = useConversation()
  const [interventionMessage, setInterventionMessage] = useState('')
  const [isIntervening, setIsIntervening] = useState(false)
  const [selectedInterventionType, setSelectedInterventionType] = useState('')

  const handleIntervene = () => {
    if (isIntervening && interventionMessage.trim()) {
      if (selectedInterventionType && onEnhancedIntervene) {
        onEnhancedIntervene(selectedInterventionType, interventionMessage)
      } else {
        onIntervene?.(interventionMessage)
      }
      setInterventionMessage('')
      setSelectedInterventionType('')
      setIsIntervening(false)
    } else {
      setIsIntervening(true)
    }
  }

  const handleQuickIntervention = (type: string) => {
    setSelectedInterventionType(type)
    setIsIntervening(true)
  }

  const handleCancel = () => {
    setIsIntervening(false)
    setInterventionMessage('')
    setSelectedInterventionType('')
  }

  // Get intervention type details
  const getInterventionTypeDetails = (type: string) => {
    const details = {
      [MindDojoModerator.HUMAN_INTERVENTION_TYPES.SUGGEST_DIRECTION]: {
        icon: Target,
        label: 'Suggest Direction',
        description: 'Guide conversation toward specific focus',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      },
      [MindDojoModerator.HUMAN_INTERVENTION_TYPES.INJECT_CREATIVITY]: {
        icon: Lightbulb,
        label: 'Inject Creativity',
        description: 'Introduce creative and innovative thinking',
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      },
      [MindDojoModerator.HUMAN_INTERVENTION_TYPES.CHALLENGE_THINKING]: {
        icon: AlertTriangle,
        label: 'Challenge Thinking',
        description: 'Question assumptions and reasoning',
        color: 'bg-red-500/20 text-red-300 border-red-500/30'
      },
      [MindDojoModerator.HUMAN_INTERVENTION_TYPES.NEW_PERSPECTIVE]: {
        icon: Eye,
        label: 'New Perspective',
        description: 'Introduce alternative viewpoints',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      }
    }
    return details[type] || { icon: MessageSquare, label: 'General', description: '', color: '' }
  }

  const handleApproveAndAdvance = async () => {
    if (isLoadingByKey('approve-advance')) return
    
    try {
      await onApproveAndAdvance?.()
    } catch (error) {
      console.error('Error in approve and advance:', error)
    }
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-slate-400">
          <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Active Conversation</h3>
          <p className="text-sm">Select a conversation to access controls</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-700">
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Control Panel
        </h2>
      </div>

      {/* Main Controls */}
      <div className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Mediation Controls */}
        <div className="content-card">
          <h3 className="font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mediation Controls
          </h3>
          
          {!isIntervening ? (
            <div className="space-y-2 sm:space-y-3">
              {/* Main Action Button */}
              <Button
                onClick={handleApproveAndAdvance}
                className="w-full btn-success text-sm sm:text-base py-2 sm:py-2"
                disabled={conversation.status !== 'ACTIVE' || isLoadingByKey('approve-advance')}
              >
                {isLoadingByKey('approve-advance') ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>{getLoadingMessage('approve-advance') || 'Processing...'}</span>
                  </div>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Approve & Advance (5 interactions)
                  </>
                )}
              </Button>
              
              {isLoadingByKey('approve-advance') && (
                <ProgressBar 
                  progress={getLoadingProgress('approve-advance')} 
                  message={getLoadingMessage('approve-advance')}
                  color="success"
                  showPercentage
                />
              )}
              
              {/* Enhanced Human Intervention Buttons */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-medium text-slate-400 mb-2">
                  Human Interventions
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(MindDojoModerator.HUMAN_INTERVENTION_TYPES).map((type) => {
                    const details = getInterventionTypeDetails(type)
                    const IconComponent = details.icon
                    
                    return (
                      <Button
                        key={type}
                        onClick={() => handleQuickIntervention(type)}
                        className={`text-xs py-2 px-2 border ${details.color} hover:opacity-80 transition-opacity`}
                        variant="outline"
                        disabled={conversation.status !== 'ACTIVE'}
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{details.label}</span>
                        <span className="sm:hidden">{details.label.split(' ')[0]}</span>
                      </Button>
                    )
                  })}
                </div>
                
                {/* General Intervention Button */}
                <Button
                  onClick={handleIntervene}
                  className="w-full btn-warning text-sm sm:text-base py-2 sm:py-2"
                  disabled={conversation.status !== 'ACTIVE' || isLoadingByKey('intervene')}
                  variant="outline"
                >
                  {isLoadingByKey('intervene') ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {getLoadingMessage('intervene') || 'Sending...'}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      General Intervention
                    </>
                  )}
                </Button>
              </div>
              
              {/* Pause/Resume Button */}
              <Button
                onClick={onPauseResume}
                className="w-full btn-secondary text-sm sm:text-base py-2 sm:py-2"
                variant="outline"
                disabled={isLoadingByKey('pause-resume')}
              >
                {isLoadingByKey('pause-resume') ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {getLoadingMessage('pause-resume') || 'Updating...'}
                  </>
                ) : conversation.status === 'PAUSED' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {/* Show selected intervention type */}
              {selectedInterventionType && (
                <div className="mb-3">
                  {(() => {
                    const details = getInterventionTypeDetails(selectedInterventionType)
                    const IconComponent = details.icon
                    return (
                      <Badge className={`${details.color} flex items-center space-x-1 p-2`}>
                        <IconComponent className="w-3 h-3" />
                        <span className="text-xs font-medium">{details.label}</span>
                      </Badge>
                    )
                  })()}
                  <p className="text-xs text-slate-400 mt-1">
                    {getInterventionTypeDetails(selectedInterventionType).description}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  {selectedInterventionType ? 'Intervention Message' : 'General Intervention Message'}
                </label>
                <Textarea
                  value={interventionMessage}
                  onChange={(e) => setInterventionMessage(e.target.value)}
                  placeholder={selectedInterventionType ? 
                    `Enter your ${getInterventionTypeDetails(selectedInterventionType).label.toLowerCase()}...` : 
                    'Enter your intervention message...'
                  }
                  className="textarea-field text-sm"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleIntervene}
                  className="flex-1 btn-warning text-xs sm:text-sm py-2"
                  disabled={!interventionMessage.trim() || isLoadingByKey('intervene') || isLoadingByKey('enhanced-intervene')}
                >
                  {(isLoadingByKey('intervene') || isLoadingByKey('enhanced-intervene')) ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send {selectedInterventionType ? getInterventionTypeDetails(selectedInterventionType).label : 'Intervention'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="flex-1 btn-secondary text-xs sm:text-sm py-2"
                  variant="outline"
                  disabled={isLoadingByKey('intervene') || isLoadingByKey('enhanced-intervene')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="content-card">
          <h3 className="font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
            <Users className="w-4 h-4 mr-2" />
            Conversation Info
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1">
                Model A
              </label>
              <div className="flex items-center text-slate-200 text-sm">
                <Bot className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{conversation.modelA?.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {conversation.modelA?.persona}
              </p>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1">
                Model B
              </label>
              <div className="flex items-center text-slate-200 text-sm">
                <Bot className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{conversation.modelB?.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {conversation.modelB?.persona}
              </p>
            </div>
          </div>
        </div>

        {/* Context Documents */}
        <div className="content-card">
          <h3 className="font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
            <FileText className="w-4 h-4 mr-2" />
            Context Documents
          </h3>
          
          <div className="space-y-2">
            {conversation.documents && conversation.documents.length > 0 ? (
              conversation.documents.map((doc) => (
                <div key={doc.id} className="flex items-center text-xs sm:text-sm text-slate-300">
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{doc.document?.originalName}</span>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-slate-500">No documents attached</p>
            )}
          </div>
        </div>

        {/* Truth Checking Controls */}
        <div className="content-card">
          <h3 className="font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
            <Shield className="w-4 h-4 mr-2" />
            Truth Checking
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            {/* Truth Checking Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs sm:text-sm text-slate-300">
                <div className="flex items-center">
                  {conversation.truthCheckEnabled ? (
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <ShieldX className="w-4 h-4 mr-2 text-red-400" />
                  )}
                  <span>Truth Checking</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={`${conversation.truthCheckEnabled ? 
                  'bg-green-600/20 border-green-600/30 text-green-300 hover:bg-green-600/30' : 
                  'bg-red-600/20 border-red-600/30 text-red-300 hover:bg-red-600/30'
                }`}
                disabled={!conversation || isLoadingByKey('toggle-truth-checking')}
                onClick={() => toggleTruthChecking(!conversation.truthCheckEnabled)}
              >
                {isLoadingByKey('toggle-truth-checking') ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-1" />
                    Updating...
                  </>
                ) : conversation.truthCheckEnabled ? (
                  <>
                    <ShieldX className="w-3 h-3 mr-1" />
                    Disable
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Enable
                  </>
                )}
              </Button>
            </div>

            {/* Truth Check Actions */}
            {conversation.truthCheckEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs sm:text-sm text-slate-300">
                    <Zap className="w-4 h-4 mr-2" />
                    <span>Check Recent Messages</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-cyan-600/20 border-cyan-600/30 text-cyan-300 hover:bg-cyan-600/30"
                    disabled={!conversation || isLoadingByKey('truth-check') || !conversation.messages?.length}
                    onClick={() => {
                      // Check the last 3 AI messages
                      const aiMessages = conversation.messages?.filter(m => 
                        m.messageType === 'AI' || m.messageType === 'MODERATOR'
                      ).slice(-3) || []
                      
                      if (aiMessages.length > 0) {
                        performBatchTruthCheck(aiMessages.map(m => m.id), 'COMPREHENSIVE')
                      }
                    }}
                  >
                    {isLoadingByKey('truth-check') ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Check
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs sm:text-sm text-slate-300">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    <span>Batch Check All</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-orange-600/20 border-orange-600/30 text-orange-300 hover:bg-orange-600/30"
                    disabled={!conversation || isLoadingByKey('batch-truth-check') || !conversation.messages?.length}
                    onClick={() => {
                      // Check all AI messages
                      const aiMessages = conversation.messages?.filter(m => 
                        m.messageType === 'AI' || m.messageType === 'MODERATOR'
                      ) || []
                      
                      if (aiMessages.length > 0) {
                        performBatchTruthCheck(aiMessages.map(m => m.id), 'COMPREHENSIVE')
                      }
                    }}
                  >
                    {isLoadingByKey('batch-truth-check') ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Check All
                      </>
                    )}
                  </Button>
                </div>

                {/* Truth Check Progress */}
                {(isLoadingByKey('truth-check') || isLoadingByKey('batch-truth-check')) && (
                  <div className="mt-2">
                    <ProgressBar 
                      progress={getLoadingProgress('truth-check') || getLoadingProgress('batch-truth-check')} 
                      message={getLoadingMessage('truth-check') || getLoadingMessage('batch-truth-check')}
                      color="primary"
                      showPercentage
                    />
                  </div>
                )}
              </>
            )}

            {/* Truth Check Status */}
            <div className="text-xs text-slate-500 mt-2">
              {conversation.truthCheckEnabled ? (
                <span className="flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 text-green-400" />
                  Truth checking is enabled for this conversation
                </span>
              ) : (
                <span className="flex items-center">
                  <ShieldX className="w-3 h-3 mr-1 text-red-400" />
                  Truth checking is disabled for this conversation
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conversation Management */}
        <div className="content-card">
          <h3 className="font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
            <Settings className="w-4 h-4 mr-2" />
            Conversation Management
          </h3>
          
          <div className="space-y-2">
            {/* Save Conversation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs sm:text-sm text-slate-300">
                <Save className="w-4 h-4 mr-2" />
                <span>Save Conversation</span>
              </div>
              <SaveConversationDialog conversation={conversation} onSave={saveConversation}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-600/20 border-blue-600/30 text-blue-300 hover:bg-blue-600/30"
                  disabled={!conversation || isLoadingByKey('save-conversation')}
                >
                  {isLoadingByKey('save-conversation') ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </SaveConversationDialog>
            </div>

            {/* Archive Conversation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs sm:text-sm text-slate-300">
                <Archive className="w-4 h-4 mr-2" />
                <span>Archive Conversation</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-purple-600/20 border-purple-600/30 text-purple-300 hover:bg-purple-600/30"
                disabled={!conversation || isLoadingByKey('archive-conversation')}
                onClick={() => {
                  if (conversation) {
                    archiveConversation({
                      conversationId: conversation.id,
                      archiveReason: 'Manual archive from control panel'
                    })
                  }
                }}
              >
                {isLoadingByKey('archive-conversation') ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-1" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </>
                )}
              </Button>
            </div>

            {/* Knowledge Transfer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs sm:text-sm text-slate-300">
                <FileText className="w-4 h-4 mr-2" />
                <span>Convert to Document</span>
              </div>
              <KnowledgeTransferDialog conversation={conversation} onConvert={convertToKnowledgeDocument}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-600/20 border-green-600/30 text-green-300 hover:bg-green-600/30"
                  disabled={!conversation || isLoadingByKey('convert-knowledge')}
                >
                  {isLoadingByKey('convert-knowledge') ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 mr-1" />
                      Convert
                    </>
                  )}
                </Button>
              </KnowledgeTransferDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
