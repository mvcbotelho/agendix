// 🚨 Tipos de Erro Padronizados

export enum ErrorType {
  // Erros de Autenticação
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  
  // Erros de Rede
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  
  // Erros de Validação
  VALIDATION = 'VALIDATION',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Erros de Dados
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  
  // Erros de Sistema
  INTERNAL = 'INTERNAL',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  
  // Erros de UI
  UI = 'UI',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage: string
  code?: string
  details?: Record<string, unknown>
  timestamp: Date
  context?: {
    component?: string
    action?: string
    userId?: string
    url?: string
  }
  originalError?: unknown
}

export interface ErrorResponse {
  success: false
  error: AppError
}

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

// 🎯 Criadores de Erro
export const createError = (
  type: ErrorType,
  message: string,
  userMessage: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  details?: Record<string, unknown>,
  originalError?: unknown
): AppError => ({
  id: generateErrorId(),
  type,
  severity,
  message,
  userMessage,
  details,
  timestamp: new Date(),
  originalError
})

export const createAuthError = (message: string, originalError?: unknown): AppError =>
  createError(
    ErrorType.AUTHENTICATION,
    message,
    'Erro de autenticação. Verifique suas credenciais.',
    ErrorSeverity.HIGH,
    undefined,
    originalError
  )

export const createNetworkError = (message: string, originalError?: unknown): AppError =>
  createError(
    ErrorType.NETWORK,
    message,
    'Erro de conexão. Verifique sua internet e tente novamente.',
    ErrorSeverity.MEDIUM,
    undefined,
    originalError
  )

export const createValidationError = (message: string, field?: string): AppError =>
  createError(
    ErrorType.VALIDATION,
    message,
    'Dados inválidos. Verifique as informações fornecidas.',
    ErrorSeverity.LOW,
    field ? { field } : undefined
  )

export const createNotFoundError = (resource: string): AppError =>
  createError(
    ErrorType.NOT_FOUND,
    `${resource} não encontrado`,
    `${resource} não foi encontrado.`,
    ErrorSeverity.MEDIUM,
    { resource }
  )

export const createInternalError = (message: string, originalError?: unknown): AppError =>
  createError(
    ErrorType.INTERNAL,
    message,
    'Erro interno do sistema. Tente novamente mais tarde.',
    ErrorSeverity.HIGH,
    undefined,
    originalError
  )

// 🔧 Utilitários
export const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'userMessage' in error
  )
}

export const isErrorResponse = <T>(response: ApiResponse<T>): response is ErrorResponse => {
  return !response.success
}

export const isSuccessResponse = <T>(response: ApiResponse<T>): response is SuccessResponse<T> => {
  return response.success
} 