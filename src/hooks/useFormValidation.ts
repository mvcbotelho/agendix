import { useState, useCallback, useRef } from 'react'
import { z } from 'zod'
import { ValidationError, ValidationResult } from '@/types/validation'
import { useFormErrorHandler } from '@/hooks/useErrorHandler'

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  initialData?: Partial<T>
  onSubmit?: (data: T) => Promise<void> | void
  onValidationError?: (errors: ValidationError[]) => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

interface FormState<T> {
  data: Partial<T>
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

export const useFormValidation = <T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
) => {
  const {
    schema,
    initialData = {},
    onSubmit,
    onValidationError,
    validateOnChange = false,
    validateOnBlur = true
  } = options

  const errorHandler = useFormErrorHandler()
  const initialDataRef = useRef(initialData)
  
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false
  })

  // Função para validar um campo específico
  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      try {
        // Cria um schema temporário apenas para o campo específico
        const fieldSchema = z.object({
          [field]: schema.shape[field as keyof typeof schema.shape]
        })
        
        fieldSchema.parse({ [field]: value })
        return null
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => 
            err.path.includes(field)
          )
          return fieldError?.message || null
        }
        return null
      }
    },
    [schema]
  )

  // Função para validar todos os campos
  const validateForm = useCallback(
    (data: Partial<T> = state.data): ValidationResult<T> => {
      try {
        console.log('🔍 useFormValidation - dados sendo validados:', data)
        console.log('🔍 useFormValidation - schema sendo usado:', schema)
        const validatedData = schema.parse(data)
        return {
          success: true,
          data: validatedData
        }
      } catch (error) {
        console.log('🔍 useFormValidation - erro capturado:', error)
        console.log('🔍 useFormValidation - tipo do erro:', error?.constructor?.name)
        
        if (error instanceof z.ZodError) {
          console.log('🔍 useFormValidation - é ZodError, errors:', error.errors)
          const errors: ValidationError[] = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
          
          return {
            success: false,
            errors
          }
        }
        
        console.log('🔍 useFormValidation - não é ZodError, erro:', error)
        return {
          success: false,
          errors: [{
            field: 'unknown',
            message: error instanceof Error ? error.message : 'Erro de validação desconhecido'
          }]
        }
      }
    },
    [schema, state.data]
  )

  // Função para atualizar um campo
  const setField = useCallback(
    (field: string, value: unknown) => {
      setState(prev => {
        const newData = { ...prev.data, [field]: value }
        const newErrors = { ...prev.errors }
        
        // Remove erro do campo se foi corrigido
        if (newErrors[field]) {
          const fieldError = validateField(field, value)
          if (!fieldError) {
            delete newErrors[field]
          } else {
            newErrors[field] = fieldError
          }
        }
        
        // Validação em tempo real se habilitada
        if (validateOnChange) {
          const fieldError = validateField(field, value)
          if (fieldError) {
            newErrors[field] = fieldError
          } else {
            delete newErrors[field]
          }
        }
        
        return {
          ...prev,
          data: newData,
          errors: newErrors,
          isDirty: true,
          isValid: Object.keys(newErrors).length === 0
        }
      })
    },
    [validateField, validateOnChange]
  )

  // Função para validar campo no blur
  const validateFieldOnBlur = useCallback(
    (field: string) => {
      if (!validateOnBlur) return
      
      const value = state.data[field as keyof typeof state.data]
      const fieldError = validateField(field, value)
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: fieldError || ''
        }
      }))
    },
    [validateField, validateOnBlur, state.data]
  )

  // Função para obter valor de um campo
  const getFieldValue = useCallback(
    (field: string) => {
      return state.data[field as keyof typeof state.data]
    },
    [state.data]
  )

  // Função para obter erro de um campo
  const getFieldError = useCallback(
    (field: string) => {
      return state.errors[field] || null
    },
    [state.errors]
  )

  // Função para resetar o formulário
  const reset = useCallback(() => {
    setState({
      data: initialDataRef.current,
      errors: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false
    })
  }, [])

  // Função para submeter o formulário
  const submit = useCallback(async () => {
    console.log('🔍 useFormValidation - submit chamado')
    
    try {
      const validationResult = validateForm()
      console.log('🔍 useFormValidation - resultado da validação:', validationResult)
      
      if (!validationResult.success) {
        console.log('❌ useFormValidation - validação falhou:', validationResult.errors)
        
        // Converter erros para o formato esperado
        const errors = validationResult.errors || []
        const errorMap: Record<string, string> = {}
        
        errors.forEach(error => {
          errorMap[error.field] = error.message
        })
        
        setState(prev => ({
          ...prev,
          errors: errorMap,
          isValid: false
        }))
        
        // Chamar callback de erro se fornecido
        if (onValidationError) {
          onValidationError(errors)
        }
        
        console.log('❌ useFormValidation - dados que falharam na validação:', state.data)
        console.log('❌ useFormValidation - erro no campo "unknown": Erro de validação desconhecido')
        
        return
      }
      
      if (!onSubmit) {
        console.warn('useFormValidation: onSubmit não fornecido')
        return
      }
      
      setState(prev => ({ ...prev, isSubmitting: true }))
      
      try {
        await onSubmit(validationResult.data!)
        
        // Resetar formulário após sucesso
        reset()
      } catch (error) {
        console.error('useFormValidation: Erro no onSubmit:', error)
        errorHandler.handleSubmitError(error)
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }))
      }
    } catch (error) {
      console.error('useFormValidation: Erro inesperado:', error)
      errorHandler.handleSubmitError(error)
    }
  }, [validateForm, onSubmit, onValidationError, reset, errorHandler, state.data])

  return {
    // Estado
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,
    
    // Ações
    setField,
    validateField,
    validateFieldOnBlur,
    validateForm,
    getFieldValue,
    getFieldError,
    reset,
    submit
  }
} 