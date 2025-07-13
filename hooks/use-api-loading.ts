
'use client'

import { useState, useCallback } from 'react'
import { useLoading } from '@/lib/loading-context'

interface ApiLoadingOptions {
  key: string
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onFinally?: () => void
}

export function useApiLoading() {
  const { startLoading, stopLoading, setError, isLoading, getMessage, getError } = useLoading()
  const [data, setData] = useState<any>(null)

  const executeWithLoading = useCallback(async (
    apiCall: () => Promise<any>,
    options: ApiLoadingOptions
  ) => {
    const { 
      key, 
      loadingMessage = 'Processing...', 
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      onFinally
    } = options

    try {
      startLoading(key, loadingMessage)
      const result = await apiCall()
      
      setData(result)
      if (onSuccess) onSuccess(result)
      
      if (successMessage) {
        // You could integrate with a toast system here
        console.log(successMessage)
      }
      
      return result
    } catch (error) {
      console.error(`API Error (${key}):`, error)
      const errorMsg = errorMessage || `Operation failed: ${error}`
      setError(key, errorMsg)
      
      if (onError) onError(error)
      
      throw error
    } finally {
      stopLoading(key)
      if (onFinally) onFinally()
    }
  }, [startLoading, stopLoading, setError])

  return {
    executeWithLoading,
    data,
    isLoading,
    getMessage,
    getError
  }
}
