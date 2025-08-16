import { getFunctions, httpsCallable } from 'firebase/functions'
import { ApiResponse, ErrorResponse, createInternalError } from '@/types/Error'

// Interface para informações do usuário
export interface UserInfo {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  disabled: boolean
  createdAt: string
  lastSignInTime: string | null
}

// Inicializar Firebase Functions
let functions: ReturnType<typeof getFunctions> | null = null

try {
  functions = getFunctions()
} catch (error) {
  console.warn('⚠️ Firebase Functions não disponível:', error)
  // Em desenvolvimento, podemos usar mocks ou fallbacks
}

// Função para buscar informações de um usuário
export const getUserInfo = async (userId: string): Promise<ApiResponse<UserInfo | null>> => {
  if (!functions) {
    return {
      success: false,
      error: createInternalError('Firebase Functions não disponível'),
    } as ErrorResponse
  }

  try {
    const getUserInfoFunction = httpsCallable(functions, 'getUserInfo')
    const result = await getUserInfoFunction({ userId })
    
    return result.data as ApiResponse<UserInfo | null>
  } catch (error: unknown) {
    console.error('Erro ao buscar informações do usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar informações do usuário', error),
    } as ErrorResponse
  }
}

// Função para buscar informações de múltiplos usuários
export const getUsersInfo = async (userIds: string[]): Promise<ApiResponse<UserInfo[]>> => {
  if (!functions) {
    return {
      success: false,
      error: createInternalError('Firebase Functions não disponível'),
    } as ErrorResponse
  }

  try {
    const getUsersInfoFunction = httpsCallable(functions, 'getUsersInfo')
    const result = await getUsersInfoFunction({ userIds })
    
    return result.data as ApiResponse<UserInfo[]>
  } catch (error: unknown) {
    console.error('Erro ao buscar informações dos usuários:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar informações dos usuários', error),
    } as ErrorResponse
  }
}

// Função para verificar se um email existe
export const checkEmailExists = async (email: string): Promise<ApiResponse<boolean>> => {
  if (!functions) {
    return {
      success: false,
      error: createInternalError('Firebase Functions não disponível'),
    } as ErrorResponse
  }

  try {
    const checkEmailExistsFunction = httpsCallable(functions, 'checkEmailExists')
    const result = await checkEmailExistsFunction({ email })
    
    return result.data as ApiResponse<boolean>
  } catch (error: unknown) {
    console.error('Erro ao verificar email:', error)
    return {
      success: false,
      error: createInternalError('Erro ao verificar email', error),
    } as ErrorResponse
  }
}

// Função para convidar um usuário
export const inviteUser = async (
  email: string, 
  displayName: string, 
  role: string, 
  tenantId: string
): Promise<ApiResponse<UserInfo>> => {
  if (!functions) {
    return {
      success: false,
      error: createInternalError('Firebase Functions não disponível'),
    } as ErrorResponse
  }

  try {
    const inviteUserFunction = httpsCallable(functions, 'inviteUser')
    const result = await inviteUserFunction({ 
      email, 
      displayName, 
      role, 
      tenantId 
    })
    
    return result.data as ApiResponse<UserInfo>
  } catch (error: unknown) {
    console.error('Erro ao convidar usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao convidar usuário', error),
    } as ErrorResponse
  }
}
