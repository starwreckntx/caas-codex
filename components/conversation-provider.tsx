
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConversationWithDetails, Model, Document } from '@/lib/types'
import { useLoading } from '@/lib/loading-context'

interface ConversationContextType {
  conversations: ConversationWithDetails[]
  selectedConversation: ConversationWithDetails | null
  models: Model[]
  documents: Document[]
  isLoading: boolean
  selectConversation: (conversation: ConversationWithDetails) => void
  refreshConversations: () => void
  refreshSelectedConversation: () => Promise<void>
  createConversation: (data: any) => Promise<void>
  approveAndAdvance: () => Promise<void>
  intervene: (message: string) => Promise<void>
  enhancedIntervene: (interventionType: string, message: string) => Promise<void>
  pauseResume: () => Promise<void>
  saveConversation: (data: any) => Promise<void>
  archiveConversation: (data: any) => Promise<void>
  convertToKnowledgeDocument: (data: any) => Promise<void>
  // Truth checking functions
  performTruthCheck: (messageId: string, assessmentType?: string) => Promise<void>
  performBatchTruthCheck: (messageIds: string[], assessmentType?: string) => Promise<void>
  getTruthAssessment: (messageId: string) => Promise<any>
  getTruthAlerts: (conversationId?: string) => Promise<any>
  acknowledgeTruthAlert: (alertId: string) => Promise<void>
  dismissTruthAlert: (alertId: string) => Promise<void>
  toggleTruthChecking: (enabled: boolean) => Promise<void>
  // Loading-related functions
  isLoadingByKey: (key: string) => boolean
  getLoadingProgress: (key: string) => number
  getLoadingMessage: (key: string) => string | undefined
  getLoadingError: (key: string) => string | undefined
}

const ConversationContext = createContext<ConversationContextType | null>(null)

export function useConversation() {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider')
  }
  return context
}

interface ConversationProviderProps {
  children: ReactNode
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    startLoading, 
    stopLoading, 
    setError, 
    updateLoading,
    isLoading: isLoadingByKey,
    getProgress,
    getMessage,
    getError
  } = useLoading()

  useEffect(() => {
    Promise.all([
      fetchConversations(),
      fetchModels(),
      fetchDocuments()
    ]).finally(() => setIsLoading(false))
  }, [])

  const fetchConversations = async () => {
    try {
      startLoading('conversations', 'Loading conversations...')
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        
        // Auto-select the first conversation if none selected
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0])
        }
      } else {
        throw new Error('Failed to fetch conversations')
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setError('conversations', 'Failed to load conversations')
    } finally {
      stopLoading('conversations')
    }
  }

  const fetchModels = async () => {
    try {
      startLoading('models', 'Loading models...')
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      } else {
        throw new Error('Failed to fetch models')
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      setError('models', 'Failed to load models')
    } finally {
      stopLoading('models')
    }
  }

  const fetchDocuments = async () => {
    try {
      startLoading('documents', 'Loading documents...')
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      } else {
        throw new Error('Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('documents', 'Failed to load documents')
    } finally {
      stopLoading('documents')
    }
  }

  const selectConversation = async (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation)
    
    // Fetch full conversation data with all messages
    try {
      startLoading('select-conversation', 'Loading conversation details...')
      const response = await fetch(`/api/conversations/${conversation.id}`)
      if (response.ok) {
        const fullConversation = await response.json()
        setSelectedConversation(fullConversation)
      } else {
        console.error('Failed to fetch full conversation details')
      }
    } catch (error) {
      console.error('Error fetching full conversation:', error)
    } finally {
      stopLoading('select-conversation')
    }
  }

  const refreshConversations = () => {
    fetchConversations()
  }

  const refreshSelectedConversation = async () => {
    if (!selectedConversation) return

    try {
      startLoading('refresh-conversation', 'Refreshing conversation...')
      const response = await fetch(`/api/conversations/${selectedConversation.id}`)
      if (response.ok) {
        const updatedConversation = await response.json()
        setSelectedConversation(updatedConversation)
        
        // Also update in conversations list
        setConversations(conversations.map(c => 
          c.id === updatedConversation.id ? updatedConversation : c
        ))
      } else {
        throw new Error('Failed to refresh conversation')
      }
    } catch (error) {
      console.error('Error refreshing selected conversation:', error)
      setError('refresh-conversation', 'Failed to refresh conversation')
    } finally {
      stopLoading('refresh-conversation')
    }
  }

  const createConversation = async (data: any) => {
    try {
      startLoading('create-conversation', 'Creating conversation...')
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newConversation = await response.json()
        setConversations([newConversation, ...conversations])
        setSelectedConversation(newConversation)
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      setError('create-conversation', 'Failed to create conversation')
    } finally {
      stopLoading('create-conversation')
    }
  }

  const approveAndAdvance = async () => {
    if (!selectedConversation) return

    try {
      startLoading('approve-advance', 'Processing interactions...')
      
      // Process 5 interactions instead of just 1
      for (let i = 0; i < 5; i++) {
        const progress = ((i + 1) / 5) * 100
        updateLoading('approve-advance', progress, `Processing interaction ${i + 1} of 5...`)
        
        console.log(`Starting interaction ${i + 1} of 5...`)
        
        // Get the current state of the conversation
        const currentConversation = await fetch(`/api/conversations/${selectedConversation.id}`)
        if (!currentConversation.ok) break
        
        const conversationData = await currentConversation.json()
        const lastMessage = conversationData.messages?.slice(-1)[0]
        
        if (lastMessage && !lastMessage.isApproved) {
          // Approve the last message
          await fetch(`/api/messages/${lastMessage.id}/approve`, {
            method: 'POST'
          })
        }

        // Get the latest conversation state to check for new messages
        const beforeInteractionState = await fetch(`/api/conversations/${selectedConversation.id}`)
        const beforeMessages = beforeInteractionState.ok ? (await beforeInteractionState.json()).messages : []
        
        // If moderator is enabled, trigger moderator intervention first
        if (conversationData.moderatorEnabled) {
          console.log(`Triggering moderator intervention for interaction ${i + 1}...`)
          
          const moderatorResponse = await fetch('/api/moderator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId: conversationData.id
            }),
          })

          if (moderatorResponse.ok) {
            const moderatorData = await moderatorResponse.json()
            console.log(`Moderator intervention ${i + 1} completed:`, {
              automaticHandoff: moderatorData.automaticHandoff,
              handoffError: moderatorData.handoffError
            })
            
            // If handoff failed, try manual advancement
            if (!moderatorData.automaticHandoff && moderatorData.handoffError) {
              console.log(`Automatic handoff failed for interaction ${i + 1}, attempting manual advancement...`)
              await performManualAdvancement(conversationData)
            }
          } else {
            console.error(`Moderator intervention ${i + 1} failed, attempting manual advancement...`)
            await performManualAdvancement(conversationData)
          }
        } else {
          // Fallback to manual advancement if moderator is disabled
          await performManualAdvancement(conversationData)
        }

        // Check for new AI messages and perform truth checking if enabled
        const afterInteractionState = await fetch(`/api/conversations/${selectedConversation.id}`)
        if (afterInteractionState.ok) {
          const afterMessages = (await afterInteractionState.json()).messages
          const newMessages = afterMessages.filter((msg: any) => 
            !beforeMessages.some((before: any) => before.id === msg.id) && 
            (msg.messageType === 'AI' || msg.messageType === 'MODERATOR')
          )
          
          // Perform truth checking on new AI messages if enabled
          if (conversationData.truthCheckEnabled && newMessages.length > 0) {
            console.log(`Performing truth check on ${newMessages.length} new AI messages...`)
            updateLoading('approve-advance', ((i + 1) / 5) * 100, `Truth checking interaction ${i + 1}...`)
            
            try {
              await performBatchTruthCheck(newMessages.map((msg: any) => msg.id), 'QUICK_SCAN')
              console.log(`Truth check completed for interaction ${i + 1}`)
            } catch (error) {
              console.error(`Truth check failed for interaction ${i + 1}:`, error)
              // Continue with the conversation even if truth check fails
            }
          }
        }

        // Small delay between interactions to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Refresh the conversation to get all new messages
      updateLoading('approve-advance', 100, 'Refreshing conversation...')
      await refreshSelectedConversation()
      
    } catch (error) {
      console.error('Error in 5-interaction processing:', error)
      setError('approve-advance', 'Failed to process interactions')
    } finally {
      stopLoading('approve-advance')
    }
  }

  const performManualAdvancement = async (conversationData: any) => {
    const lastMessage = conversationData.messages?.slice(-1)[0]
    
    // Determine which model should respond next
    const nextModelId = lastMessage?.modelId === conversationData.modelAId 
      ? conversationData.modelBId 
      : conversationData.modelAId

    const nextModel = nextModelId === conversationData.modelAId 
      ? conversationData.modelA 
      : conversationData.modelB

    if (!nextModel) return

    // Prepare conversation history for context
    const conversationHistory = conversationData.messages?.map((msg: any) => ({
      role: msg.modelId === conversationData.modelAId ? 'assistant' : 'user',
      content: msg.content
    })) || []

    // Get context documents
    const contextDocuments = conversationData.documents?.map((d: any) => d.documentId) || []

    // Generate AI response
    const response = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: conversationData.id,
        modelId: nextModelId,
        systemInstructions: nextModel.systemInstructions,
        messages: conversationHistory,
        contextDocuments
      }),
    })

    if (!response.ok) {
      console.error('Manual advancement failed:', response.statusText)
    }
  }

  const intervene = async (message: string) => {
    if (!selectedConversation) return

    try {
      startLoading('intervene', 'Sending intervention...')
      
      // Create human intervention message
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          modelId: null, // Human message
          content: message,
          messageType: 'HUMAN',
          isApproved: true
        }),
      })

      // Refresh the conversation
      updateLoading('intervene', 50, 'Refreshing conversation...')
      refreshConversations()
      
      const updatedResponse = await fetch(`/api/conversations/${selectedConversation.id}`)
      if (updatedResponse.ok) {
        const updatedConversation = await updatedResponse.json()
        setSelectedConversation(updatedConversation)
      } else {
        throw new Error('Failed to refresh conversation after intervention')
      }
    } catch (error) {
      console.error('Error intervening in conversation:', error)
      setError('intervene', 'Failed to send intervention')
    } finally {
      stopLoading('intervene')
    }
  }

  const enhancedIntervene = async (interventionType: string, message: string) => {
    if (!selectedConversation) return

    try {
      startLoading('enhanced-intervene', 'Sending enhanced intervention...')
      console.log('Sending enhanced intervention:', { interventionType, message })
      
      // Send enhanced human intervention
      const response = await fetch('/api/human-intervention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          interventionType,
          message,
          context: {
            timestamp: new Date().toISOString(),
            sessionGoal: selectedConversation.sessionGoal
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Enhanced intervention result:', result)
        
        // Refresh the conversation to show new message
        updateLoading('enhanced-intervene', 80, 'Refreshing conversation...')
        await refreshSelectedConversation()
        refreshConversations()
      } else {
        console.error('Enhanced intervention failed:', response.statusText)
        // Fallback to regular intervention
        updateLoading('enhanced-intervene', 50, 'Falling back to regular intervention...')
        await intervene(message)
      }
    } catch (error) {
      console.error('Error in enhanced intervention:', error)
      setError('enhanced-intervene', 'Enhanced intervention failed, falling back to regular intervention')
      // Fallback to regular intervention
      await intervene(message)
    } finally {
      stopLoading('enhanced-intervene')
    }
  }

  const pauseResume = async () => {
    if (!selectedConversation) return

    try {
      const newStatus = selectedConversation.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'
      const action = newStatus === 'ACTIVE' ? 'Resuming' : 'Pausing'
      
      startLoading('pause-resume', `${action} conversation...`)
      
      const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      })

      if (response.ok) {
        const updatedConversation = await response.json()
        setSelectedConversation(updatedConversation)
        
        // Update in conversations list
        setConversations(conversations.map(c => 
          c.id === updatedConversation.id ? updatedConversation : c
        ))
      } else {
        throw new Error(`Failed to ${action.toLowerCase()} conversation`)
      }
    } catch (error) {
      console.error('Error updating conversation status:', error)
      setError('pause-resume', 'Failed to update conversation status')
    } finally {
      stopLoading('pause-resume')
    }
  }

  const saveConversation = async (data: any) => {
    try {
      startLoading('save-conversation', 'Saving conversation...')
      
      const response = await fetch('/api/conversations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const savedConversation = await response.json()
        
        // Update the selected conversation with saved data
        if (selectedConversation?.id === data.conversationId) {
          setSelectedConversation({
            ...selectedConversation,
            savedConversation: savedConversation
          } as ConversationWithDetails)
        }
        
        // Update in conversations list
        setConversations(conversations.map(c => 
          c.id === data.conversationId ? {
            ...c,
            savedConversation: savedConversation
          } : c
        ))
      } else {
        throw new Error('Failed to save conversation')
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
      setError('save-conversation', 'Failed to save conversation')
    } finally {
      stopLoading('save-conversation')
    }
  }

  const archiveConversation = async (data: any) => {
    try {
      startLoading('archive-conversation', 'Archiving conversation...')
      
      const response = await fetch('/api/conversations/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const archivedConversation = await response.json()
        
        // Update the selected conversation with archived data
        if (selectedConversation?.id === data.conversationId) {
          setSelectedConversation({
            ...selectedConversation,
            status: 'ARCHIVED',
            archivedConversation: archivedConversation
          } as ConversationWithDetails)
        }
        
        // Update in conversations list
        setConversations(conversations.map(c => 
          c.id === data.conversationId ? {
            ...c,
            status: 'ARCHIVED',
            archivedConversation: archivedConversation
          } : c
        ))
      } else {
        throw new Error('Failed to archive conversation')
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
      setError('archive-conversation', 'Failed to archive conversation')
    } finally {
      stopLoading('archive-conversation')
    }
  }

  const convertToKnowledgeDocument = async (data: any) => {
    try {
      startLoading('convert-knowledge', 'Converting to knowledge document...')
      
      const response = await fetch('/api/knowledge-documents/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const knowledgeDocument = await response.json()
        
        // Update the selected conversation with new knowledge document
        if (selectedConversation && selectedConversation.id === data.conversationId) {
          const existingKnowledgeDocs = selectedConversation.knowledgeDocuments || []
          setSelectedConversation({
            ...selectedConversation,
            knowledgeDocuments: [...existingKnowledgeDocs, knowledgeDocument]
          } as ConversationWithDetails)
        }
        
        // Update in conversations list
        setConversations(conversations.map(c => 
          c.id === data.conversationId ? {
            ...c,
            knowledgeDocuments: [...(c.knowledgeDocuments || []), knowledgeDocument]
          } : c
        ))
      } else {
        throw new Error('Failed to convert to knowledge document')
      }
    } catch (error) {
      console.error('Error converting to knowledge document:', error)
      setError('convert-knowledge', 'Failed to convert to knowledge document')
    } finally {
      stopLoading('convert-knowledge')
    }
  }

  // Truth checking functions
  const performTruthCheck = async (messageId: string, assessmentType = 'COMPREHENSIVE') => {
    if (!selectedConversation) return

    try {
      startLoading('truth-check', 'Performing truth check...')
      
      const response = await fetch('/api/truth-checker/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          conversationId: selectedConversation.id,
          assessmentType
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Truth check completed:', result)
        
        // Refresh the conversation to show updated truth assessment
        await refreshSelectedConversation()
      } else {
        throw new Error('Failed to perform truth check')
      }
    } catch (error) {
      console.error('Error performing truth check:', error)
      setError('truth-check', 'Failed to perform truth check')
    } finally {
      stopLoading('truth-check')
    }
  }

  const performBatchTruthCheck = async (messageIds: string[], assessmentType = 'COMPREHENSIVE') => {
    if (!selectedConversation) return

    try {
      startLoading('batch-truth-check', 'Performing batch truth check...')
      
      const response = await fetch('/api/truth-checker/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          messageIds,
          assessmentType
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Batch truth check completed:', result)
        
        // Refresh the conversation to show updated truth assessments
        await refreshSelectedConversation()
      } else {
        throw new Error('Failed to perform batch truth check')
      }
    } catch (error) {
      console.error('Error performing batch truth check:', error)
      setError('batch-truth-check', 'Failed to perform batch truth check')
    } finally {
      stopLoading('batch-truth-check')
    }
  }

  const getTruthAssessment = async (messageId: string) => {
    try {
      startLoading('get-truth-assessment', 'Getting truth assessment...')
      
      const response = await fetch(`/api/truth-checker/analyze?messageId=${messageId}`)
      
      if (response.ok) {
        const result = await response.json()
        return result.assessments
      } else {
        throw new Error('Failed to get truth assessment')
      }
    } catch (error) {
      console.error('Error getting truth assessment:', error)
      setError('get-truth-assessment', 'Failed to get truth assessment')
      return null
    } finally {
      stopLoading('get-truth-assessment')
    }
  }

  const getTruthAlerts = async (conversationId?: string) => {
    try {
      startLoading('get-truth-alerts', 'Getting truth alerts...')
      
      const targetConversationId = conversationId || selectedConversation?.id
      if (!targetConversationId) return []
      
      const response = await fetch(`/api/truth-checker/alerts?conversationId=${targetConversationId}`)
      
      if (response.ok) {
        const result = await response.json()
        return result.alerts || []
      } else {
        throw new Error('Failed to get truth alerts')
      }
    } catch (error) {
      console.error('Error getting truth alerts:', error)
      setError('get-truth-alerts', 'Failed to get truth alerts')
      return []
    } finally {
      stopLoading('get-truth-alerts')
    }
  }

  const acknowledgeTruthAlert = async (alertId: string) => {
    try {
      startLoading('acknowledge-alert', 'Acknowledging alert...')
      
      const response = await fetch('/api/truth-checker/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          action: 'acknowledge'
        }),
      })

      if (response.ok) {
        console.log('Alert acknowledged successfully')
        // Could refresh alerts here if needed
      } else {
        throw new Error('Failed to acknowledge alert')
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      setError('acknowledge-alert', 'Failed to acknowledge alert')
    } finally {
      stopLoading('acknowledge-alert')
    }
  }

  const dismissTruthAlert = async (alertId: string) => {
    try {
      startLoading('dismiss-alert', 'Dismissing alert...')
      
      const response = await fetch('/api/truth-checker/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          action: 'dismiss'
        }),
      })

      if (response.ok) {
        console.log('Alert dismissed successfully')
        // Could refresh alerts here if needed
      } else {
        throw new Error('Failed to dismiss alert')
      }
    } catch (error) {
      console.error('Error dismissing alert:', error)
      setError('dismiss-alert', 'Failed to dismiss alert')
    } finally {
      stopLoading('dismiss-alert')
    }
  }

  const toggleTruthChecking = async (enabled: boolean) => {
    if (!selectedConversation) return

    try {
      startLoading('toggle-truth-checking', enabled ? 'Enabling truth checking...' : 'Disabling truth checking...')
      
      const response = await fetch('/api/truth-checker/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          enabled
        }),
      })

      if (response.ok) {
        console.log('Truth checking toggled successfully')
        // Update the conversation state
        setSelectedConversation({
          ...selectedConversation,
          truthCheckEnabled: enabled
        } as ConversationWithDetails)
        
        // Update in conversations list
        setConversations(conversations.map(c => 
          c.id === selectedConversation.id ? {
            ...c,
            truthCheckEnabled: enabled
          } : c
        ))
      } else {
        throw new Error('Failed to toggle truth checking')
      }
    } catch (error) {
      console.error('Error toggling truth checking:', error)
      setError('toggle-truth-checking', 'Failed to toggle truth checking')
    } finally {
      stopLoading('toggle-truth-checking')
    }
  }

  return (
    <ConversationContext.Provider value={{
      conversations,
      selectedConversation,
      models,
      documents,
      isLoading,
      selectConversation,
      refreshConversations,
      refreshSelectedConversation,
      createConversation,
      approveAndAdvance,
      intervene,
      enhancedIntervene,
      pauseResume,
      saveConversation,
      archiveConversation,
      convertToKnowledgeDocument,
      // Truth checking functions
      performTruthCheck,
      performBatchTruthCheck,
      getTruthAssessment,
      getTruthAlerts,
      acknowledgeTruthAlert,
      dismissTruthAlert,
      toggleTruthChecking,
      // Loading-related functions
      isLoadingByKey,
      getLoadingProgress: getProgress,
      getLoadingMessage: getMessage,
      getLoadingError: getError
    }}>
      {children}
    </ConversationContext.Provider>
  )
}
