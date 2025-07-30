export interface Appointment {
  id: string
  clientId: string
  clientName: string
  service: string
  professionalId?: string
  professionalName?: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // em minutos
  status: AppointmentStatus
  observations?: string
  // Novos campos para clientes e filhos atendidos
  attendingClients: {
    clientId: string
    clientName: string
    isMainClient: boolean // true se for o cliente principal
  }[]
  attendingChildren: {
    childName: string
    childAge?: string
    specialConditions?: string
  }[]
  createdAt: string
  updatedAt: string
  userId: string // ID do usuário que criou o agendamento
}

export type AppointmentStatus = 
  | 'scheduled'    // Agendado
  | 'in_progress'  // Em andamento
  | 'completed'    // Concluído
  | 'cancelled'    // Cancelado

export interface CreateAppointmentData {
  clientId: string
  clientName: string
  service: string
  professionalId?: string
  professionalName?: string
  date: string
  time: string
  duration: number
  observations?: string
  // Novos campos para clientes e filhos atendidos
  attendingClients: {
    clientId: string
    clientName: string
    isMainClient: boolean
  }[]
  attendingChildren: {
    childName: string
    childAge?: string
    specialConditions?: string
  }[]
}

export interface UpdateAppointmentData {
  clientId?: string
  clientName?: string
  service?: string
  professionalId?: string
  professionalName?: string
  date?: string
  time?: string
  duration?: number
  status?: AppointmentStatus
  observations?: string
  // Novos campos para clientes e filhos atendidos
  attendingClients?: {
    clientId: string
    clientName: string
    isMainClient: boolean
  }[]
  attendingChildren?: {
    childName: string
    childAge?: string
    specialConditions?: string
  }[]
}

export interface Service {
  id: string
  name: string
  duration: number // em minutos
  price?: number
  description?: string
  isActive: boolean
}

export interface Professional {
  id: string
  name: string
  specialties?: string[]
  isActive: boolean
}

export interface AppointmentFilters {
  date?: string
  clientId?: string
  professionalId?: string
  status?: AppointmentStatus
  service?: string
}

export interface TimeSlot {
  time: string
  isAvailable: boolean
  appointment?: Appointment
}

export interface DaySchedule {
  date: string
  timeSlots: TimeSlot[]
}

export interface AppointmentConflict {
  appointmentId: string
  conflictType: 'time_overlap' | 'professional_unavailable' | 'client_conflict'
  message: string
} 