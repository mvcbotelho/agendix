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
  createInternalError,
  ApiResponse,
  SuccessResponse,
  ErrorResponse
} from '@/types/Error'
import { Tenant, TenantUser, CreateTenantData } from '@/types/Tenant'
import { getTenantByUser, createTenant as createTenantService, getTenantUserByUserId } from '@/services/tenantService'

/**
 * React hook that manages authentication state and tenant context using Firebase.
 *
 * Subscribes to Firebase auth state changes, keeps the current Firebase `user` and derived flags,
 * and when authenticated concurrently loads the associated `tenant` and `tenantUser`. Exposes
 * helpers to sign in (email/password and Google), sign out, request a password reset, and create a tenant.
 *
 * The hook sets `isTenantLoaded` after attempting to load tenant-related data (success or failure).
 * On sign-in/sign-out the auth listener updates `user`, clears or populates `tenant`/`tenantUser`, and
 * updates `loading` accordingly.
 *
 * @returns An object containing:
 *  - user: The current Firebase `User` or `null`.
 *  - tenant: The current `Tenant` associated with the user, or `null`.
 *  - tenantUser: The `TenantUser` mapping for the current user, or `null`.
 *  - loading: `true` while the initial auth/tenant load is in progress.
 *  - isAuthenticated: `true` when `user` is non-null.
 *  - isTenantLoaded: `true` once tenant-related data has finished loading after an auth state change.
 *  - hasTenant: `true` when `tenant` is non-null.
 *  - hasTenantUser: `true` when `tenantUser` is non-null.
 *  - login(email, password): Attempts email/password sign-in. Returns an `ApiResponse` with the signed `user` on success.
 *  - loginWithGoogle(): Attempts Google sign-in via popup. Returns an `ApiResponse` with the signed `user` on success.
 *  - logout(): Signs out the current user. Returns an `ApiResponse<void>`.
 *  - resetPassword(email): Sends a password reset email. Returns an `ApiResponse<void>`.
 *  - createTenant(tenantData): Creates a tenant for the authenticated user and updates local tenant state.
 *    Returns an `ApiResponse` with the created `tenant` on success.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTenantLoaded, setIsTenantLoaded] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Buscar tenant e tenantUser do usuário
        try {
          const [tenantResult, tenantUserResult] = await Promise.all([
            getTenantByUser(user.uid),
            getTenantUserByUserId(user.uid)
          ])
          
          if (tenantResult.success) {
            if (tenantResult.data) {
              setTenant(tenantResult.data)
            } else {
              setTenant(null)
            }
          } else {
            setTenant(null)
          }
          
          if (tenantUserResult.success) {
            if (tenantUserResult.data) {
              setTenantUser(tenantUserResult.data)
            } else {
              setTenantUser(null)
            }
          } else {
            setTenantUser(null)
          }
        } catch (error) {
          console.error('useAuth: Erro ao buscar tenant/tenantUser:', error)
          setTenant(null)
          setTenantUser(null)
        }
      } else {
        setTenant(null)
        setTenantUser(null)
      }
      
      setIsTenantLoaded(true)
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
      
      securityLog('Login successful', { userId: userCredential.user.uid, email: sanitizedEmail })
      
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

  const createTenant = async (tenantData: CreateTenantData): Promise<ApiResponse<{ tenant: Tenant }>> => {
    if (!user) {
      return {
        success: false,
        error: createAuthError('Usuário não autenticado')
      } as ErrorResponse
    }

    try {
      const result = await createTenantService(tenantData, user.uid)
      
      if (result.success && result.data) {
        setTenant(result.data)
        return {
          success: true,
          data: { tenant: result.data }
        } as SuccessResponse<{ tenant: Tenant }>
      } else {
        return result as ErrorResponse
      }
    } catch (error) {
      console.error('Erro ao criar tenant:', error)
      return {
        success: false,
        error: createInternalError('Erro ao criar tenant', error)
      } as ErrorResponse
    }
  }

  
  return {
    user,
    tenant,
    tenantUser,
    loading,
    isAuthenticated: !!user,
    isTenantLoaded,
    hasTenant: !!tenant,
    hasTenantUser: !!tenantUser,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    createTenant
  }
} 