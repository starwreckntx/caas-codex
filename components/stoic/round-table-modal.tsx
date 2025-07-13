
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Crown, Scroll, User, Loader2, Users, Settings } from 'lucide-react'
import { Model, UserRole } from '@/lib/types'
import { useConversation } from '@/components/conversation-provider'

interface RoundTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoundTableModal({ open, onOpenChange }: RoundTableModalProps) {
  const [title, setTitle] = useState('')
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<string[]>([])
  const [maxParticipants, setMaxParticipants] = useState(5)
  const [moderationStyle, setModerationStyle] = useState('DEMOCRATIC')
  const [topicFocus, setTopicFocus] = useState('')
  const [userParticipation, setUserParticipation] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('OBSERVER')
  const [stoicPhilosophers, setStoicPhilosophers] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingPhilosophers, setFetchingPhilosophers] = useState(true)
  const { refreshConversations, selectConversation } = useConversation()

  useEffect(() => {
    if (open) {
      fetchStoicPhilosophers()
    }
  }, [open])

  const fetchStoicPhilosophers = async () => {
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const models = await response.json()
        const stoics = models.filter((model: Model) => model.category === 'stoic')
        setStoicPhilosophers(stoics)
      }
    } catch (error) {
      console.error('Error fetching stoic philosophers:', error)
    } finally {
      setFetchingPhilosophers(false)
    }
  }

  const getPhilosopherIcon = (name: string) => {
    if (name?.includes('Marcus Aurelius')) return Crown
    if (name?.includes('Seneca')) return Scroll
    return User
  }

  const handlePhilosopherToggle = (philosopherId: string) => {
    setSelectedPhilosophers(prev => {
      if (prev.includes(philosopherId)) {
        return prev.filter(id => id !== philosopherId)
      } else if (prev.length < maxParticipants) {
        return [...prev, philosopherId]
      }
      return prev
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || selectedPhilosophers.length < 2) return

    setLoading(true)
    try {
      const response = await fetch('/api/round-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          participantIds: selectedPhilosophers,
          maxParticipants,
          moderationStyle,
          topicFocus,
          userParticipation,
          userRole
        })
      })

      if (response.ok) {
        const newConversation = await response.json()
        await refreshConversations?.()
        selectConversation?.(newConversation)
        resetForm()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating round table conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setSelectedPhilosophers([])
    setMaxParticipants(5)
    setModerationStyle('DEMOCRATIC')
    setTopicFocus('')
    setUserParticipation(false)
    setUserRole('OBSERVER')
  }

  const generateTitle = () => {
    if (selectedPhilosophers.length >= 2) {
      const topics = [
        'Round Table: The Nature of Virtue',
        'Council on Living Well',
        'Assembly on Wisdom and Justice',
        'Symposium on Freedom and Duty',
        'Dialogue on the Good Life',
        'Conclave on Courage and Temperance',
        'Forum on Philosophy and Leadership',
        'Gathering on Truth and Reality'
      ]
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      setTitle(randomTopic)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-amber-950 border-amber-200 dark:border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Create Round Table Discussion
          </DialogTitle>
          <DialogDescription className="text-amber-700 dark:text-amber-300">
            Bring multiple stoic philosophers together for a comprehensive philosophical discussion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <Label htmlFor="title" className="text-amber-900 dark:text-amber-100">
              Discussion Topic
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a philosophical topic for discussion..."
                className="flex-1 bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateTitle}
                disabled={selectedPhilosophers.length < 2 || fetchingPhilosophers}
                className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
              >
                <Scroll className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxParticipants" className="text-amber-900 dark:text-amber-100">
                Max Participants
              </Label>
              <Select value={maxParticipants.toString()} onValueChange={(value) => setMaxParticipants(parseInt(value))}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Philosophers</SelectItem>
                  <SelectItem value="4">4 Philosophers</SelectItem>
                  <SelectItem value="5">5 Philosophers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="moderationStyle" className="text-amber-900 dark:text-amber-100">
                Moderation Style
              </Label>
              <Select value={moderationStyle} onValueChange={setModerationStyle}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEMOCRATIC">Democratic (Turn-based)</SelectItem>
                  <SelectItem value="MODERATED">Moderated (Guided)</SelectItem>
                  <SelectItem value="FREE_FLOW">Free Flow (Open)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic Focus */}
          <div>
            <Label htmlFor="topicFocus" className="text-amber-900 dark:text-amber-100">
              Topic Focus (Optional)
            </Label>
            <Textarea
              id="topicFocus"
              value={topicFocus}
              onChange={(e) => setTopicFocus(e.target.value)}
              placeholder="Provide specific context or questions to guide the discussion..."
              className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100"
              rows={3}
            />
          </div>

          {/* User Participation */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="userParticipation"
                checked={userParticipation}
                onCheckedChange={(checked) => setUserParticipation(checked as boolean)}
              />
              <Label htmlFor="userParticipation" className="text-amber-900 dark:text-amber-100">
                Allow human participation in the discussion
              </Label>
            </div>

            {userParticipation && (
              <div>
                <Label htmlFor="userRole" className="text-amber-900 dark:text-amber-100">
                  Your Role
                </Label>
                <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                  <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBSERVER">Observer (Watch only)</SelectItem>
                    <SelectItem value="PARTICIPANT">Participant (Join discussion)</SelectItem>
                    <SelectItem value="MODERATOR">Moderator (Guide discussion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Philosopher Selection */}
          <div>
            <Label className="text-amber-900 dark:text-amber-100 mb-3 block">
              Select Philosophers ({selectedPhilosophers.length}/{maxParticipants} selected)
            </Label>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {stoicPhilosophers.map((philosopher) => {
                const Icon = getPhilosopherIcon(philosopher.name)
                const isSelected = selectedPhilosophers.includes(philosopher.id)
                const isDisabled = !isSelected && selectedPhilosophers.length >= maxParticipants

                return (
                  <div
                    key={philosopher.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50'
                        : isDisabled
                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-amber-200 dark:border-amber-700 bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                    }`}
                    onClick={() => !isDisabled && handlePhilosopherToggle(philosopher.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100">
                          {philosopher.name}
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {philosopher.persona}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge className="bg-amber-500 text-white">Selected</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !title || selectedPhilosophers.length < 2}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Round Table
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
