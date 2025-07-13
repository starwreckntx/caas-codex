
'use client'

import { Sidebar } from '@/components/sidebar'

interface RegularLayoutProps {
  children: React.ReactNode
}

export function RegularLayout({ children }: RegularLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar - Hidden on small screens, visible on medium and up */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-hidden w-full md:w-auto">
        {children}
      </main>
    </div>
  )
}
