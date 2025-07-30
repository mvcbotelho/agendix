import { z } from 'zod'

// Schema para filhos do cliente
export const childSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 18
    }, 'Data de nascimento inválida'),
  hasSpecialConditions: z.boolean().optional(),
  specialConditions: z.string()
    .max(200, 'Condições especiais devem ter no máximo 200 caracteres')
    .optional()
})

// Schema para endereço
export const addressSchema = z.object({
  street: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  number: z.string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número deve ter no máximo 10 caracteres'),
  complement: z.string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional(),
  neighborhood: z.string()
    .min(2, 'Bairro deve ter pelo menos 2 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  city: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(50, 'Cidade deve ter no máximo 50 caracteres'),
  state: z.string()
    .length(2, 'Estado deve ter exatamente 2 caracteres')
    .toUpperCase(),
  zipCode: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000')
})

// Schema base para cliente
export const clientSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[\d\s\-()]+$/, 'Telefone deve conter apenas números, espaços, hífens e parênteses'),
  
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve ter exatamente 11 dígitos')
    .optional(),
  
  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 120
    }, 'Data de nascimento inválida')
    .optional(),
  
  hasChildren: z.boolean().optional(),
  
  children: z.array(childSchema).optional(),
  
  address: addressSchema.optional(),
  
  notes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
})

// Schema para criação de cliente (sem ID)
export const createClientSchema = clientSchema.omit({ id: true })

// Schema para atualização de cliente (todos os campos opcionais)
export const updateClientSchema = clientSchema.partial()

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),

  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
})

// Schema para reset de senha
export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres')
})

// Schema para busca de clientes
export const searchClientSchema = z.object({
  query: z.string()
    .min(1, 'Termo de busca é obrigatório')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres'),
  
  filters: z.object({
    hasChildren: z.boolean().optional(),
    hasSpecialNeeds: z.boolean().optional(),
    ageGroup: z.string().optional()
  }).optional()
})

// Tipos derivados dos schemas
export type ClientFormData = z.infer<typeof clientSchema>
export type CreateClientData = z.infer<typeof createClientSchema>
export type UpdateClientData = z.infer<typeof updateClientSchema>
export type LoginData = z.infer<typeof loginSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type SearchClientData = z.infer<typeof searchClientSchema>

// Interfaces para validação
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

// Utilitários de validação
export const formatZodErrors = (zodError: z.ZodError): ValidationError[] => {
  return zodError.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }))
}

export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error)
      }
    }
    
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Erro de validação desconhecido'
      }]
    }
  }
}

export const safeValidateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    return validateWithSchema(schema, data)
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: error instanceof Error ? error.message : 'Erro de validação desconhecido'
      }]
    }
  }
} 