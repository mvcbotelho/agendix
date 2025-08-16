import { useState } from 'react'
import { z } from 'zod'

interface ValidationError {
  [key: string]: string
}

interface UseFormValidationReturn {
  errors: ValidationError
  validateField: (field: string, value: any, schema: z.ZodSchema) => string | null
  validateForm: (data: any, schema: z.ZodSchema) => boolean
  clearErrors: () => void
  setFieldError: (field: string, error: string) => void
}

/**
 * Hook that manages Zod-driven form validation and a map of field-specific error messages.
 *
 * Provides helpers to validate a single field or an entire form against supplied Zod schemas,
 * and exposes functions to clear or programmatically set field errors.
 *
 * - validateField(field, value, schema): validates a single value with `schema`. Returns the error message for the field or `null` if valid; updates the internal error map.
 * - validateForm(data, schema): validates `data` with `schema`. Returns `true` if valid (and clears errors) or `false` on validation failure (and populates the error map).
 * - clearErrors(): clears all field errors.
 * - setFieldError(field, error): sets or replaces the error message for `field`.
 *
 * @returns An object containing:
 * - `errors`: a map of field paths to error messages.
 * - `validateField`: (field: string, value: any, schema: z.ZodSchema) => string | null
 * - `validateForm`: (data: any, schema: z.ZodSchema) => boolean
 * - `clearErrors`: () => void
 * - `setFieldError`: (field: string, error: string) => void
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationError>({})

  const validateField = (field: string, value: any, schema: z.ZodSchema): string | null => {
    try {
      schema.parse(value)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = (error as any).errors.find((e: any) => e.path.includes(field))
        const errorMessage = fieldError?.message || 'Campo inválido'
        setErrors(prev => ({ ...prev, [field]: errorMessage }))
        return errorMessage
      }
      return 'Erro de validação'
    }
  }

  const validateForm = (data: any, schema: z.ZodSchema): boolean => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationError = {}
        ;(error as any).errors.forEach((err: any) => {
          const field = err.path.join('.')
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const clearErrors = () => {
    setErrors({})
  }

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError
  }
} 