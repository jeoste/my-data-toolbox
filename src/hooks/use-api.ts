/**
 * Custom hook for API calls with loading and error states
 */

import { useState, useCallback } from 'react'
import { apiClient, APIError } from '@/lib/api-client'

export function useAPI<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiCall()
        return result
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.details || err.message)
        } else {
          setError('An unexpected error occurred')
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { execute, loading, error, setError }
}

