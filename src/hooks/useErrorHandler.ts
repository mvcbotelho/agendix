import { useToast } from '@chakra-ui/react'
import { useErrorHandler as useBaseErrorHandler } from '@/lib/errorHandler'
import { AppError } from '@/types/Error'

interface UseErrorHandlerOptions {
  component?: string
  action?: string
  userId?: string
  url?: string
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const toast = useToast()
  const baseErrorHandler = useBaseErrorHandler()

  const handleError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError => {
    const appError = baseErrorHandler.handleError(error, { ...options, ...context })
    
    // Mostrar toast de erro
    toast({
      title: 'Erro',
      description: appError.userMessage || 'Ocorreu um erro inesperado',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
    
    return appError
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
      const appError = handleError(error, { ...options, ...context })
      return { success: false, error: appError }
    }
  }

  const handleValidationError = (
    field: string,
    message: string,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError => {
    const appError = baseErrorHandler.handleError(new Error(message), { 
      ...options, 
      ...context,
      action: `validation:${field}`
    })
    
    // Mostrar toast de erro de validação
    toast({
      title: 'Erro de validação',
      description: message,
      status: 'warning',
      duration: 3000,
      isClosable: true,
    })
    
    return appError
  }

  const handleNetworkError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError => {
    const appError = baseErrorHandler.handleError(error, { 
      ...options, 
      ...context,
      action: 'network'
    })
    
    // Mostrar toast de erro de rede
    toast({
      title: 'Erro de conexão',
      description: 'Verifique sua conexão com a internet e tente novamente',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
    
    return appError
  }

  const handleAuthError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ): AppError => {
    const appError = baseErrorHandler.handleError(error, { 
      ...options, 
      ...context,
      action: 'authentication'
    })
    
    // Mostrar toast de erro de autenticação
    toast({
      title: 'Erro de autenticação',
      description: 'Sua sessão expirou. Faça login novamente.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
    
    return appError
  }

  return {
    handleError,
    handleAsyncError,
    handleValidationError,
    handleNetworkError,
    handleAuthError
  }
}

export const useFormErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const errorHandler = useErrorHandler(options)
  
  const handleFormError = (
    field: string,
    message: string,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ) => {
    return errorHandler.handleValidationError(field, message, context)
  }

  const handleSubmitError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ) => {
    return errorHandler.handleError(error, { ...context, action: 'form-submit' })
  }

  return {
    ...errorHandler,
    handleFormError,
    handleSubmitError
  }
}

export const useDataErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const errorHandler = useErrorHandler(options)
  
  const handleFetchError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ) => {
    return errorHandler.handleNetworkError(error, { ...context, action: 'data-fetch' })
  }

  const handleSaveError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ) => {
    return errorHandler.handleError(error, { ...context, action: 'data-save' })
  }

  const handleDeleteError = (
    error: unknown,
    context?: {
      component?: string
      action?: string
      userId?: string
      url?: string
    }
  ) => {
    return errorHandler.handleError(error, { ...context, action: 'data-delete' })
  }

  return {
    ...errorHandler,
    handleFetchError,
    handleSaveError,
    handleDeleteError
  }
} 