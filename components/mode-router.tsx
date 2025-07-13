
'use client'

import { useAuth } from '@/components/auth-provider'
import { RegularLayout } from '@/components/layouts/regular-layout'
import { StoicLayout } from '@/components/layouts/stoic-layout'

interface ModeRouterProps {
  children: React.ReactNode
}

export function ModeRouter({ children }: ModeRouterProps) {
  const { session } = useAuth()

  // If not authenticated, show the auth layout (handled by AuthWrapper)
  if (!session?.isAuthenticated) {
    return <>{children}</>
  }

  // Route to appropriate layout based on application mode
  if (session.applicationMode === 'STOIC') {
    return <StoicLayout>{children}</StoicLayout>
  }

  // Default to regular layout
  return <RegularLayout>{children}</RegularLayout>
}
