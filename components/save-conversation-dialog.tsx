
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Save, X, Plus, Tag } from 'lucide-react'
import { ConversationWithDetails } from '@/lib/types'

interface SaveConversationDialogProps {
  conversation: ConversationWithDetails
  onSave: (data: any) => Promise<void>
  children: React.ReactNode
}

export function SaveConversationDialog({ conversation, onSave, children }: SaveConversationDialogProps) {
  const [open, setOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave({
        conversationId: conversation.id,
        customName: customName.trim() || undefined,
        description: description.trim() || undefined,
        tags,
        metadata: {
          originalTitle: conversation.title,
          sessionGoal: conversation.sessionGoal,
          moderatorEnabled: conversation.moderatorEnabled,
          messageCount: conversation.messages?.length || 0,
          participants: [conversation.modelA.name, conversation.modelB.name],
          savedAt: new Date().toISOString()
        }
      })
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCustomName('')
    setDescription('')
    setTags([])
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Save Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Original Conversation Info */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-200 mb-2">Original Conversation</h4>
            <p className="text-sm text-slate-300 mb-1">{conversation.title}</p>
            <p className="text-xs text-slate-400">
              {conversation.modelA.name} ↔ {conversation.modelB.name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {conversation.messages?.length || 0} messages
            </p>
          </div>

          {/* Custom Name */}
          <div className="space-y-2">
            <Label htmlFor="customName" className="text-slate-300">
              Custom Name (optional)
            </Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter a custom name for this conversation"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description or notes about this conversation"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-slate-300">Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
              <Button
                type="button"
                onClick={addTag}
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-slate-600 text-slate-100">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Conversation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
