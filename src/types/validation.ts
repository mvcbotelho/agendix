// Temporariamente comentado para resolver erros de compilação
/*
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

// Função para converter erros do Zod para formato padronizado
export function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }))
}

// Função para validar dados usando um schema
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
*/ 