
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Brain, Sparkles, Users, Target } from 'lucide-react'
import { ConversationWithDetails } from '@/lib/types'

interface KnowledgeTransferDialogProps {
  conversation: ConversationWithDetails
  onConvert: (data: any) => Promise<void>
  children: React.ReactNode
}

export function KnowledgeTransferDialog({ conversation, onConvert, children }: KnowledgeTransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('CONVERSATION_SUMMARY')
  const [isLoading, setIsLoading] = useState(false)

  const handleConvert = async () => {
    setIsLoading(true)
    try {
      await onConvert({
        conversationId: conversation.id,
        title: title.trim() || `Knowledge from ${conversation.title}`,
        documentType
      })
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error converting conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDocumentType('CONVERSATION_SUMMARY')
  }

  const documentTypes = [
    { value: 'CONVERSATION_SUMMARY', label: 'Conversation Summary', icon: FileText },
    { value: 'INSIGHT_EXTRACTION', label: 'Key Insights', icon: Brain },
    { value: 'ACTION_ITEMS', label: 'Action Items', icon: Target },
    { value: 'CREATIVE_IDEAS', label: 'Creative Ideas', icon: Sparkles }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Convert to Knowledge Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Conversation Preview */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-200 mb-2">Source Conversation</h4>
            <p className="text-sm text-slate-300 mb-1">{conversation.title}</p>
            <div className="flex items-center text-xs text-slate-400 mb-2">
              <Users className="w-3 h-3 mr-1" />
              {conversation.modelA.name} ↔ {conversation.modelB.name}
            </div>
            <div className="flex items-center text-xs text-slate-400">
              <FileText className="w-3 h-3 mr-1" />
              {conversation.messages?.length || 0} messages
            </div>
            {conversation.sessionGoal && (
              <div className="mt-2 text-xs text-slate-300">
                <strong>Session Goal:</strong> {conversation.sessionGoal}
              </div>
            )}
          </div>

          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Document Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Knowledge from ${conversation.title}`}
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label className="text-slate-300">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {documentTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <IconComponent className="w-4 h-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* AI Processing Info */}
          <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
            <div className="flex items-center text-blue-300 mb-2">
              <Brain className="w-4 h-4 mr-2" />
              <span className="font-medium">AI-Powered Conversion</span>
            </div>
            <p className="text-sm text-blue-200">
              Our AI will analyze the conversation and extract key insights, conclusions, and knowledge points to create a structured document.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Converting...</span>
                </div>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to Document
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
