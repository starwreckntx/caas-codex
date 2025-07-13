
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthSession } from '@/lib/types'

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  login: (passphrase: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      
      if (response.ok) {
        const data = await response.json()
        setSession({
          isAuthenticated: true,
          ipAddress: data.ipAddress,
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          applicationMode: data.applicationMode
        })
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (passphrase: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passphrase })
      })

      if (response.ok) {
        const data = await response.json()
        setSession({
          isAuthenticated: true,
          ipAddress: 'current',
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          applicationMode: data.applicationMode
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error logging in:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      setSession(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      session,
      isLoading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}
