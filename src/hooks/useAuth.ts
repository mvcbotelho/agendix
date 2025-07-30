import { useState, useEffect } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getSecureErrorMessage, rateLimiter, validateEmail, validatePassword, sanitizeInput, securityLog } from '@/lib/security'
import { isDevelopment } from '@/lib/config'
import { 
  createAuthError, 
  createNetworkError, 
  createValidationError,
  ApiResponse,
  SuccessResponse,
  ErrorResponse
} from '@/types/Error'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      securityLog('Auth state changed', { userId: user?.uid, email: user?.email })
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    try {
      // Validação de entrada
      if (!validateEmail(email)) {
        const error = createValidationError('Email inválido', 'email')
        return {
          success: false,
          error
        } as ErrorResponse
      }

      if (!validatePassword(password)) {
        const error = createValidationError('Senha deve ter pelo menos 6 caracteres', 'password')
        return {
          success: false,
          error
        } as ErrorResponse
      }

      // Sanitização
      const sanitizedEmail = sanitizeInput(email)
      const sanitizedPassword = sanitizeInput(password)

      // Rate limiting
      const identifier = `login:${sanitizedEmail}`
      if (!rateLimiter.isAllowed(identifier)) {
        const error = createNetworkError('Muitas tentativas. Tente novamente em 15 minutos')
        return {
          success: false,
          error
        } as ErrorResponse
      }

      securityLog('Login attempt', { email: sanitizedEmail })

      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword)
      
      // Reset rate limiter em caso de sucesso
      rateLimiter.reset(identifier)
      
      securityLog('Login successful', { userId: userCredential.user.uid })
      
      return {
        success: true,
        data: { user: userCredential.user }
      } as SuccessResponse<{ user: User }>
    } catch (error: unknown) {
      const authError = error as AuthError
      const secureMessage = getSecureErrorMessage(authError, isDevelopment)
      
      securityLog('Login failed', { error: authError.code, message: secureMessage })
      
      const appError = createAuthError(secureMessage, authError)
      return {
        success: false,
        error: appError
      } as ErrorResponse
    }
  }

  const loginWithGoogle = async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      securityLog('Google login attempt')

      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      securityLog('Google login successful', { userId: userCredential.user.uid })
      
      return {
        success: true,
        data: { user: userCredential.user }
      } as SuccessResponse<{ user: User }>
    } catch (error: unknown) {
      const authError = error as AuthError
      const secureMessage = getSecureErrorMessage(authError, isDevelopment)
      
      securityLog('Google login failed', { error: authError.code, message: secureMessage })
      
      const appError = createAuthError(secureMessage, authError)
      return {
        success: false,
        error: appError
      } as ErrorResponse
    }
  }

  const logout = async (): Promise<ApiResponse<void>> => {
    try {
      securityLog('Logout attempt', { userId: user?.uid })
      
      await signOut(auth)
      
      securityLog('Logout successful')
      
      return {
        success: true,
        data: undefined
      } as SuccessResponse<void>
    } catch (error: unknown) {
      const authError = error as AuthError
      const secureMessage = getSecureErrorMessage(authError, isDevelopment)
      
      securityLog('Logout failed', { error: authError.code, message: secureMessage })
      
      const appError = createAuthError(secureMessage, authError)
      return {
        success: false,
        error: appError
      } as ErrorResponse
    }
  }

  const resetPassword = async (email: string): Promise<ApiResponse<void>> => {
    try {
      // Validação de entrada
      if (!validateEmail(email)) {
        const error = createValidationError('Email inválido', 'email')
        return {
          success: false,
          error
        } as ErrorResponse
      }

      // Sanitização
      const sanitizedEmail = sanitizeInput(email)

      // Rate limiting
      const identifier = `reset:${sanitizedEmail}`
      if (!rateLimiter.isAllowed(identifier)) {
        const error = createNetworkError('Muitas tentativas. Tente novamente em 15 minutos')
        return {
          success: false,
          error
        } as ErrorResponse
      }

      securityLog('Password reset attempt', { email: sanitizedEmail })

      await sendPasswordResetEmail(auth, sanitizedEmail)
      
      securityLog('Password reset email sent')
      
      return {
        success: true,
        data: undefined
      } as SuccessResponse<void>
    } catch (error: unknown) {
      const authError = error as AuthError
      const secureMessage = getSecureErrorMessage(authError, isDevelopment)
      
      securityLog('Password reset failed', { error: authError.code, message: secureMessage })
      
      const appError = createAuthError(secureMessage, authError)
      return {
        success: false,
        error: appError
      } as ErrorResponse
    }
  }

  return {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    isAuthenticated: !!user
  }
} 