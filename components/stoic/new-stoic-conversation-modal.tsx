
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Crown, Scroll, User, Loader2 } from 'lucide-react'
import { Model } from '@/lib/types'
import { useConversation } from '@/components/conversation-provider'

interface NewStoicConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewStoicConversationModal({ open, onOpenChange }: NewStoicConversationModalProps) {
  const [title, setTitle] = useState('')
  const [philosopherA, setPhilosopherA] = useState('')
  const [philosopherB, setPhilosopherB] = useState('')
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
        // Filter to only stoic philosophers
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !philosopherA || !philosopherB) return

    setLoading(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          modelAId: philosopherA,
          modelBId: philosopherB,
          moderatorEnabled: false, // Stoic conversations don't use the modern moderator
          truthCheckEnabled: true  // Still check for philosophical accuracy
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
      console.error('Error creating conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setPhilosopherA('')
    setPhilosopherB('')
  }

  const generateTitle = () => {
    const philosopherAName = stoicPhilosophers.find(p => p.id === philosopherA)?.name || ''
    const philosopherBName = stoicPhilosophers.find(p => p.id === philosopherB)?.name || ''
    
    if (philosopherAName && philosopherBName) {
      const topics = [
        'On Virtue and Excellence',
        'The Nature of Freedom',
        'Wisdom in Leadership',
        'Accepting What Cannot Be Changed',
        'The Path to Inner Peace',
        'Living According to Nature',
        'The Role of Reason',
        'Duty and Honor',
        'The Good Life',
        'Courage in Adversity'
      ]
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      setTitle(`${randomTopic}: ${philosopherAName} & ${philosopherBName}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-amber-950 border-amber-200 dark:border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">
            Begin a Philosophical Dialogue
          </DialogTitle>
          <DialogDescription className="text-amber-700 dark:text-amber-300">
            Select two stoic philosophers to engage in a dialogue on wisdom, virtue, and the good life.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-amber-900 dark:text-amber-100">
              Dialogue Topic
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a philosophical topic or question..."
                className="flex-1 bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateTitle}
                disabled={!philosopherA || !philosopherB || fetchingPhilosophers}
                className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
              >
                <Scroll className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="philosopherA" className="text-amber-900 dark:text-amber-100">
                First Philosopher
              </Label>
              <Select value={philosopherA} onValueChange={setPhilosopherA} disabled={fetchingPhilosophers}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100">
                  <SelectValue placeholder="Choose philosopher..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  {stoicPhilosophers.map((philosopher) => {
                    const Icon = getPhilosopherIcon(philosopher.name)
                    return (
                      <SelectItem 
                        key={philosopher.id} 
                        value={philosopher.id}
                        disabled={philosopher.id === philosopherB}
                        className="text-amber-900 dark:text-amber-100"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{philosopher.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="philosopherB" className="text-amber-900 dark:text-amber-100">
                Second Philosopher
              </Label>
              <Select value={philosopherB} onValueChange={setPhilosopherB} disabled={fetchingPhilosophers}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100">
                  <SelectValue placeholder="Choose philosopher..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  {stoicPhilosophers.map((philosopher) => {
                    const Icon = getPhilosopherIcon(philosopher.name)
                    return (
                      <SelectItem 
                        key={philosopher.id} 
                        value={philosopher.id}
                        disabled={philosopher.id === philosopherA}
                        className="text-amber-900 dark:text-amber-100"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{philosopher.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show selected philosophers' descriptions */}
          {(philosopherA || philosopherB) && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
              {philosopherA && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const Icon = getPhilosopherIcon(stoicPhilosophers.find(p => p.id === philosopherA)?.name || '')
                      return <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    })()}
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      {stoicPhilosophers.find(p => p.id === philosopherA)?.name}
                    </span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 text-xs">
                    {stoicPhilosophers.find(p => p.id === philosopherA)?.persona}
                  </p>
                </div>
              )}
              
              {philosopherB && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const Icon = getPhilosopherIcon(stoicPhilosophers.find(p => p.id === philosopherB)?.name || '')
                      return <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    })()}
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      {stoicPhilosophers.find(p => p.id === philosopherB)?.name}
                    </span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 text-xs">
                    {stoicPhilosophers.find(p => p.id === philosopherB)?.persona}
                  </p>
                </div>
              )}
            </div>
          )}

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
              disabled={loading || !title || !philosopherA || !philosopherB}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Begin Dialogue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
