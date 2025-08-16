import { z } from 'zod'
import { ValidationError } from '@/types/Error'

// Schema base para cliente
const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  hasChildren: z.boolean().default(false),
  children: z.array(z.object({
    name: z.string().min(2, 'Nome da criança deve ter pelo menos 2 caracteres'),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    hasSpecialConditions: z.boolean().default(false),
    specialConditions: z.string().optional()
  })).optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  notes: z.string().optional()
})

// Schema para criação de cliente (sem ID)
export const createClientSchema = clientSchema.omit({ id: true })

// Schema para atualização de cliente (todos os campos opcionais)
export const updateClientSchema = clientSchema.partial()

// Schema para agendamento
const appointmentSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  serviceName: z.string().min(1, 'Nome do serviço é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  professionalName: z.string().min(1, 'Nome do profissional é obrigatório'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().optional(),
  attendingClients: z.array(z.object({
    clientId: z.string(),
    clientName: z.string(),
    isMainClient: z.boolean().default(false)
  })).optional(),
  attendingChildren: z.array(z.object({
    childName: z.string(),
    childAge: z.string(),
    specialConditions: z.string().optional()
  })).optional()
})

// Schema para criação de agendamento
export const createAppointmentSchema = appointmentSchema.omit({ id: true })

// Schema para atualização de agendamento
export const updateAppointmentSchema = appointmentSchema.partial()

// Schema para tenant
const tenantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome da empresa deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cnpj: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional()
})

// Schema para criação de tenant
export const createTenantSchema = tenantSchema.omit({ id: true })

// Schema para atualização de tenant
export const updateTenantSchema = tenantSchema.partial()

/**
 * Convert a ZodError into an array of ValidationError objects.
 *
 * Each Zod issue is mapped to a ValidationError with:
 * - `field`: the error path joined by dots,
 * - `message`: the Zod issue message,
 * - `code`: the Zod issue code.
 *
 * @param zodError - The ZodError instance to convert.
 * @returns An array of ValidationError objects representing the Zod issues.
 */
export function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }))
}

/**
 * Validate arbitrary data against a Zod schema and return a typed result or formatted errors.
 *
 * Attempts to parse `data` with the provided Zod `schema`. On success returns `{ success: true, data }`
 * where `data` is the parsed and typed value. If validation fails with a ZodError, returns
 * `{ success: false, errors }` where `errors` is an array of `ValidationError` produced by
 * `formatZodErrors`. If an unexpected (non-Zod) error occurs, returns a single `ValidationError`
 * with `field: 'unknown'` and `code: 'UNKNOWN'`.
 *
 * @param schema - Zod schema used to validate and parse the input
 * @param data - The value to validate (typically unknown/raw input)
 * @returns On success: `{ success: true; data: T }`. On failure: `{ success: false; errors: ValidationError[] }`.
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodErrors(error) }
    }
    return { 
      success: false, 
      errors: [{ field: 'unknown', message: 'Erro de validação desconhecido', code: 'UNKNOWN' }] 
    }
  }
} 