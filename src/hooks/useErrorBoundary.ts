import { useState } from 'react'
import { AppError } from '@/types/Error'

// 🎯 Hook para usar Error Boundary
export const useErrorBoundary = () => {
  const [error, setError] = useState<AppError | null>(null)

  const handleError = (error: AppError) => {
    setError(error)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    handleError,
    clearError
  }
} 