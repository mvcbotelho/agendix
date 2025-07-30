import { createContext } from 'react'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined) 