
'use client'

import { useState } from 'react'
import { StoicSidebar } from '@/components/stoic/stoic-sidebar'
import { StoicPage } from '@/components/stoic/stoic-page'

type StoicSection = 'conversations' | 'texts' | 'wisdom'

interface StoicLayoutProps {
  children?: React.ReactNode
}

export function StoicLayout({ children }: StoicLayoutProps) {
  const [currentSection, setCurrentSection] = useState<StoicSection>('conversations')

  const handleNavigate = (section: StoicSection) => {
    setCurrentSection(section)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 dark:from-stone-900 dark:via-amber-950 dark:to-stone-900">
      {/* Stoic Sidebar - Hidden on small screens, visible on medium and up */}
      <div className="hidden md:block">
        <StoicSidebar onNavigate={handleNavigate} />
      </div>
      <main className="flex-1 overflow-hidden w-full md:w-auto">
        <StoicPage 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection}
        />
      </main>
    </div>
  )
}
