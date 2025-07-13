'use client'

import { useState } from 'react'
import { ConversationProvider, useConversation } from '@/components/conversation-provider'
import { ConversationList } from '@/components/conversation-list'
import { DialogueView } from '@/components/dialogue-view'
import { ControlPanel } from '@/components/control-panel'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { StoicPage } from '@/components/stoic/stoic-page'

function DashboardContent() {
  const { selectedConversation, selectConversation, refreshSelectedConversation, approveAndAdvance, intervene, enhancedIntervene, pauseResume } = useConversation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleConversationSelect = (conversation: any) => {
    selectConversation(conversation)
    setIsMobileMenuOpen(false) // Close mobile menu when conversation is selected
  }

  return (
    <div className="flex h-screen relative">
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Column - Conversation List */}
      <div className={`
        w-80 border-r border-slate-700 bg-slate-900 z-40
        ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
        fixed md:relative h-full
      `}>
        <ConversationList 
          onSelectConversation={handleConversationSelect}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Center Column - Dialogue View */}
      <div className="flex-1 bg-slate-900 min-w-0 lg:flex-[2]">
        <DialogueView 
          conversation={selectedConversation}
          onRefreshConversation={refreshSelectedConversation}
        />
      </div>

      {/* Right Column - Control Panel */}
      <div className="w-80 border-l border-slate-700 bg-slate-900 hidden sm:block lg:w-80">
        <ControlPanel 
          conversation={selectedConversation}
          onApproveAndAdvance={approveAndAdvance}
          onIntervene={intervene}
          onEnhancedIntervene={enhancedIntervene}
          onPauseResume={pauseResume}
        />
      </div>

      {/* Mobile Control Panel - Bottom Sheet */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 max-h-64 overflow-y-auto z-30">
        <ControlPanel 
          conversation={selectedConversation}
          onApproveAndAdvance={approveAndAdvance}
          onIntervene={intervene}
          onEnhancedIntervene={enhancedIntervene}
          onPauseResume={pauseResume}
        />
      </div>
    </div>
  )
}

function AppContent() {
  const { session } = useAuth()

  // If in stoic mode, render the StoicPage
  if (session?.applicationMode === 'STOIC') {
    return <StoicPage />
  }

  // Default to regular dashboard
  return <DashboardContent />
}

export default function Home() {
  return (
    <ConversationProvider>
      <AppContent />
    </ConversationProvider>
  )
}