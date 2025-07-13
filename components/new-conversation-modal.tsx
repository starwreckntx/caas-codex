
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConversation } from './conversation-provider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Zap } from 'lucide-react'

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const { models, documents, createConversation } = useConversation()
  const [formData, setFormData] = useState({
    title: '',
    modelAId: '',
    modelBId: '',
    documentIds: [] as string[],
    moderatorEnabled: false,
    sessionGoal: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.modelAId || !formData.modelBId) {
      return
    }

    // Validate moderator settings
    if (formData.moderatorEnabled && !formData.sessionGoal.trim()) {
      alert('Session goal is required when moderator is enabled')
      return
    }

    await createConversation(formData)
    
    // Reset form and close modal
    setFormData({
      title: '',
      modelAId: '',
      modelBId: '',
      documentIds: [],
      moderatorEnabled: false,
      sessionGoal: ''
    })
    onOpenChange(false)
  }

  const handleDocumentToggle = (documentId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        documentIds: [...prev.documentIds, documentId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        documentIds: prev.documentIds.filter(id => id !== documentId)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create New Conversation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-slate-300">Conversation Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Exploring AI Consciousness"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Model A</Label>
              <Select 
                value={formData.modelAId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, modelAId: value }))}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select first model" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {models?.filter(m => m.id !== formData.modelBId).map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-slate-100">
                      {model.name} ({model.persona})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Model B</Label>
              <Select 
                value={formData.modelBId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, modelBId: value }))}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select second model" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {models?.filter(m => m.id !== formData.modelAId).map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-slate-100">
                      {model.name} ({model.persona})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Moderator Settings */}
          <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="moderatorEnabled"
                checked={formData.moderatorEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  moderatorEnabled: checked as boolean,
                  sessionGoal: checked ? prev.sessionGoal : '' 
                }))}
              />
              <label htmlFor="moderatorEnabled" className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Enable Mind Dojo Moderator</span>
              </label>
            </div>
            
            {formData.moderatorEnabled && (
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Session Goal</span>
                </Label>
                <Textarea
                  value={formData.sessionGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionGoal: e.target.value }))}
                  placeholder="Define the goal for this moderated conversation. What should the AI participants aim to achieve through their dialogue?"
                  className="textarea-field min-h-[100px]"
                  required={formData.moderatorEnabled}
                />
                <p className="text-xs text-slate-400">
                  The moderator will use this goal to guide the conversation flow and ensure productive dialogue.
                </p>
              </div>
            )}
          </div>

          {documents && documents.length > 0 && (
            <div>
              <Label className="text-slate-300">Context Documents (Optional)</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={document.id}
                      checked={formData.documentIds.includes(document.id)}
                      onCheckedChange={(checked) => handleDocumentToggle(document.id, checked as boolean)}
                    />
                    <label
                      htmlFor={document.id}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {document.originalName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="btn-primary flex-1">
              Create Conversation
            </Button>
            <Button 
              type="button" 
              onClick={() => onOpenChange(false)} 
              className="btn-secondary flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
