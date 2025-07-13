
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingState {
  [key: string]: {
    isLoading: boolean
    message?: string
    progress?: number
    error?: string
  }
}

interface LoadingContextType {
  loadingStates: LoadingState
  startLoading: (key: string, message?: string) => void
  updateLoading: (key: string, progress?: number, message?: string) => void
  stopLoading: (key: string) => void
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  isLoading: (key: string) => boolean
  getProgress: (key: string) => number
  getMessage: (key: string) => string | undefined
  getError: (key: string) => string | undefined
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  const startLoading = useCallback((key: string, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        message,
        progress: 0,
        error: undefined
      }
    }))
  }, [])

  const updateLoading = useCallback((key: string, progress?: number, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: progress ?? prev[key]?.progress ?? 0,
        message: message ?? prev[key]?.message
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        progress: 100
      }
    }))
    
    // Clean up after a delay
    setTimeout(() => {
      setLoadingStates(prev => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
    }, 1000)
  }, [])

  const setError = useCallback((key: string, error: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error
      }
    }))
  }, [])

  const clearError = useCallback((key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error: undefined
      }
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key]?.isLoading ?? false
  }, [loadingStates])

  const getProgress = useCallback((key: string) => {
    return loadingStates[key]?.progress ?? 0
  }, [loadingStates])

  const getMessage = useCallback((key: string) => {
    return loadingStates[key]?.message
  }, [loadingStates])

  const getError = useCallback((key: string) => {
    return loadingStates[key]?.error
  }, [loadingStates])

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      startLoading,
      updateLoading,
      stopLoading,
      setError,
      clearError,
      isLoading,
      getProgress,
      getMessage,
      getError
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
