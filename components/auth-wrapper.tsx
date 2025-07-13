
'use client'

import { useAuth } from '@/components/auth-provider'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { session, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <div className="relative">
      {/* Logout button */}
      <Button
        onClick={logout}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
      
      {children}
    </div>
  )
}
