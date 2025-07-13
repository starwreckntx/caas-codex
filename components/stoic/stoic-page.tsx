
'use client'

import { useState } from 'react'
import { useConversation } from '@/components/conversation-provider'
import { EnhancedDialogueView } from '@/components/stoic/enhanced-dialogue-view'
import { StoicWelcome } from '@/components/stoic/stoic-welcome'
import { TextsLibrary } from '@/components/stoic/texts-library'
import { WisdomCorner } from '@/components/stoic/wisdom-corner'

type StoicSection = 'conversations' | 'texts' | 'wisdom'

interface StoicPageProps {
  currentSection?: StoicSection
  onSectionChange?: (section: StoicSection) => void
}

export function StoicPage({ currentSection = 'conversations', onSectionChange }: StoicPageProps) {
  const { selectedConversation } = useConversation()

  // Handle section navigation
  const handleSectionChange = (section: StoicSection) => {
    onSectionChange?.(section)
  }

  // Render based on current section
  switch (currentSection) {
    case 'texts':
      return <TextsLibrary />
    
    case 'wisdom':
      return <WisdomCorner />
    
    case 'conversations':
    default:
      if (selectedConversation) {
        return <EnhancedDialogueView />
      }
      return <StoicWelcome onNavigate={handleSectionChange} />
  }
}
