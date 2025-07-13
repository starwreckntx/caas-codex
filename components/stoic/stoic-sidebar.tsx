
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  Plus, 
  Archive, 
  BookOpen, 
  Settings,
  Crown,
  Scroll,
  Mountain,
  Flame,
  LogOut,
  Users
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { StoicConversationList } from '@/components/stoic/stoic-conversation-list'
import { NewStoicConversationModal } from '@/components/stoic/new-stoic-conversation-modal'
import { RoundTableModal } from '@/components/stoic/round-table-modal'

interface StoicSidebarProps {
  onNavigate?: (section: 'conversations' | 'texts' | 'wisdom') => void
}

export function StoicSidebar({ onNavigate }: StoicSidebarProps) {
  const { logout } = useAuth()
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isRoundTableOpen, setIsRoundTableOpen] = useState(false)

  return (
    <>
      <div className="w-80 h-screen bg-gradient-to-b from-amber-100 via-stone-50 to-amber-50 dark:from-stone-800 dark:via-amber-900 dark:to-stone-800 border-r border-amber-200 dark:border-amber-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                Stoic Corner
              </h1>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Philosophical Dialogues
              </p>
            </div>
          </div>
          
          {/* Stoic Quote */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Scroll className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-800 dark:text-amber-200 italic">
                  "You have power over your mind - not outside events. Realize this, and you will find strength."
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  — Marcus Aurelius
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-3">
          <Button
            onClick={() => setIsNewConversationOpen(true)}
            className="w-full justify-start bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Dialogue
          </Button>

          <Button
            onClick={() => setIsRoundTableOpen(true)}
            variant="outline"
            className="w-full justify-start text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <Users className="h-4 w-4 mr-2" />
            Round Table
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={() => onNavigate?.('texts')}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Texts
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={() => onNavigate?.('wisdom')}
            >
              <Mountain className="h-4 w-4 mr-1" />
              Wisdom
            </Button>
          </div>
        </div>

        <Separator className="bg-amber-200 dark:bg-amber-700" />

        {/* Conversations List */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Philosophical Dialogues
            </h3>
          </div>
          <ScrollArea className="h-full">
            <StoicConversationList />
          </ScrollArea>
        </div>

        <Separator className="bg-amber-200 dark:bg-amber-700" />

        {/* Footer */}
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600">
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
          
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Stoic Corner
          </Button>
        </div>
      </div>

      <NewStoicConversationModal
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
      />

      <RoundTableModal
        open={isRoundTableOpen}
        onOpenChange={setIsRoundTableOpen}
      />
    </>
  )
}
