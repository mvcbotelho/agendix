// 🚨 Sistema Centralizado de Tratamento de Erros

import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  createError,
  isAppError
} from '@/types/Error'
import { isDevelopment } from '@/lib/config'
import { securityLog } from '@/lib/security'

// 📊 Error Logger
class ErrorLogger {
  private errors: AppError[] = []
  private maxErrors = 100

  log(error: AppError): void {
    // Adicionar à lista local
    this.errors.push(error)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log baseado na severidade
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', error)
        this.reportToExternalService(error)
        break
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH ERROR:', error)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM ERROR:', error)
        break
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW ERROR:', error)
        break
    }

    // Log de segurança
    securityLog('Error logged', {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message
    })
  }

  private reportToExternalService(error: AppError): void {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    if (isDevelopment) {
      console.log('📤 Would report to external service:', error)
    }
  }

  getErrors(): AppError[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
  }
}

export const errorLogger = new ErrorLogger()

// 🔧 Error Handler Principal
export class ErrorHandler {
  static handle(
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError {
    let appError: AppError

    // Se já é um AppError, apenas adicionar contexto
    if (isAppError(error)) {
      appError = {
        ...error,
        context: { ...error.context, ...context }
      }
    } else {
      // Converter erro desconhecido para AppError
      appError = this.convertToAppError(error)
    }

    // Log do erro
    errorLogger.log(appError)

    return appError
  }

  private static convertToAppError(
    error: unknown
  ): AppError {
    const errorMessage = this.extractErrorMessage(error)
    const errorCode = this.extractErrorCode(error)

    // Determinar tipo baseado no erro
    const type = this.determineErrorType(error, errorCode)
    const severity = this.determineErrorSeverity(type)

    return createError(
      type,
      errorMessage,
      this.getUserFriendlyMessage(type),
      severity,
      { originalError: error },
      error
    )
  }

  private static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      return (errorObj.message as string) || (errorObj.error as string) || 'Erro desconhecido'
    }
    return 'Erro desconhecido'
  }

  private static extractErrorCode(error: unknown): string | undefined {
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      return errorObj.code as string
    }
    return undefined
  }

  private static determineErrorType(error: unknown, code?: string): ErrorType {
    // Firebase Auth Errors
    if (code?.startsWith('auth/')) {
      switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return ErrorType.AUTHENTICATION
        case 'auth/too-many-requests':
          return ErrorType.NETWORK
        case 'auth/network-request-failed':
          return ErrorType.NETWORK
        default:
          return ErrorType.AUTHENTICATION
      }
    }

    // Network Errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return ErrorType.NETWORK
    }

    // Validation Errors
    if (code?.includes('validation') || error instanceof TypeError) {
      return ErrorType.VALIDATION
    }

    // Firestore Errors
    if (code?.startsWith('firestore/')) {
      switch (code) {
        case 'firestore/not-found':
          return ErrorType.NOT_FOUND
        case 'firestore/permission-denied':
          return ErrorType.AUTHORIZATION
        default:
          return ErrorType.INTERNAL
      }
    }

    return ErrorType.UNKNOWN
  }

  private static determineErrorSeverity(type: ErrorType): ErrorSeverity {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return ErrorSeverity.HIGH
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH
      case ErrorType.NETWORK:
        return ErrorSeverity.MEDIUM
      case ErrorType.VALIDATION:
        return ErrorSeverity.LOW
      case ErrorType.INTERNAL:
        return ErrorSeverity.HIGH
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  private static getUserFriendlyMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Erro de autenticação. Verifique suas credenciais.'
      case ErrorType.AUTHORIZATION:
        return 'Você não tem permissão para realizar esta ação.'
      case ErrorType.NETWORK:
        return 'Erro de conexão. Verifique sua internet e tente novamente.'
      case ErrorType.VALIDATION:
        return 'Dados inválidos. Verifique as informações fornecidas.'
      case ErrorType.NOT_FOUND:
        return 'Recurso não encontrado.'
      case ErrorType.INTERNAL:
        return 'Erro interno do sistema. Tente novamente mais tarde.'
      case ErrorType.TIMEOUT:
        return 'Tempo limite excedido. Tente novamente.'
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.'
    }
  }
}

// 🎯 Error Boundary Hook
export const useErrorHandler = () => {
  const handleError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError => {
    return ErrorHandler.handle(error, context)
  }

  const handleAsyncError = async <T>(
    promise: Promise<T>,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): Promise<{ success: true; data: T } | { success: false; error: AppError }> => {
    try {
      const data = await promise
      return { success: true, data }
    } catch (error) {
      const appError = ErrorHandler.handle(error, context)
      return { success: false, error: appError }
    }
  }

  return {
    handleError,
    handleAsyncError
  }
}

// 🔄 Error Recovery
export const canRecoverFromError = (error: AppError): boolean => {
  switch (error.type) {
    case ErrorType.VALIDATION:
    case ErrorType.INVALID_INPUT:
      return true
    case ErrorType.NETWORK:
      return true
    case ErrorType.AUTHENTICATION:
      return false
    case ErrorType.AUTHORIZATION:
      return false
    case ErrorType.INTERNAL:
      return false
    default:
      return false
  }
}

// 📊 Error Analytics
export const trackError = (error: AppError): void => {
  if (isDevelopment) {
    console.log('📊 Error tracked:', {
      id: error.id,
      type: error.type,
      severity: error.severity,
      component: error.context?.component,
      action: error.context?.action
    })
  }
  // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
} 