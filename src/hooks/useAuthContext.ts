import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContextDef'

/**
 * Returns the current authentication context value.
 *
 * Throws an error when the hook is called outside of an AuthProvider.
 *
 * @returns The current AuthContext value.
 * @throws Error if the hook is used outside an AuthProvider.
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
} 