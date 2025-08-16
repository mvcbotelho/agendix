import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData,
  Service,
  Professional,
  AppointmentFilters,
  TimeSlot
} from '@/types/Appointment'
import { ApiResponse } from '@/types/Error'
import { createNotFoundError, createInternalError } from '@/types/Error'

// Interface para conflitos de agendamento
interface AppointmentConflict {
  message: string
  appointmentId: string
  date: string
  time: string
  professionalName: string
  conflictType: string
}

// Serviços padrão
const DEFAULT_SERVICES: Service[] = [
  { id: '1', name: 'Corte', duration: 40, price: 30, description: 'Corte de cabelo', isActive: true },
  { id: '2', name: 'Barba', duration: 30, price: 25, description: 'Barba e bigode', isActive: true },
  { id: '3', name: 'Corte + Barba', duration: 60, price: 45, description: 'Corte completo', isActive: true },
  { id: '4', name: 'Hidratação', duration: 45, price: 35, description: 'Hidratação capilar', isActive: true },
  { id: '5', name: 'Coloração', duration: 90, price: 80, description: 'Coloração de cabelo', isActive: true },
]

// Profissionais padrão
const DEFAULT_PROFESSIONALS: Professional[] = [
  { id: '1', name: 'João Silva', specialties: ['Corte', 'Barba'], isActive: true },
  { id: '2', name: 'Maria Santos', specialties: ['Hidratação', 'Coloração'], isActive: true },
]

// Buscar todos os agendamentos
export async function getAppointments(filters?: AppointmentFilters): Promise<ApiResponse<Appointment[]>> {
  try {
    const appointmentsRef = collection(db, 'appointments')
    let q = query(appointmentsRef)
    
    // Aplicar filtros
    if (filters?.date) {
      q = query(q, where('date', '==', filters.date))
    }
    if (filters?.clientId) {
      q = query(q, where('clientId', '==', filters.clientId))
    }
    if (filters?.professionalId) {
      q = query(q, where('professionalId', '==', filters.professionalId))
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters?.service) {
      q = query(q, where('service', '==', filters.service))
    }
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })
    
    // Ordenar por data e hora no lado do cliente
    appointments.sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date)
      if (dateComparison !== 0) return dateComparison
      return a.time.localeCompare(b.time)
    })
    
    return {
      success: true,
      data: appointments
    }
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    
    // Verificar se é erro de índice
    if (error instanceof Error && error.message.includes('index')) {
      return {
        success: false,
        error: createInternalError('Erro de configuração do banco de dados. Entre em contato com o suporte.')
      }
    }
    
    return {
      success: false,
      error: createInternalError('Erro ao buscar agendamentos')
    }
  }
}

// Buscar agendamento por ID
export async function getAppointment(id: string): Promise<ApiResponse<Appointment>> {
  try {
    const appointmentRef = doc(db, 'appointments', id)
    const appointmentSnap = await getDoc(appointmentRef)
    
    if (!appointmentSnap.exists()) {
      return {
        success: false,
        error: createNotFoundError('Agendamento')
      }
    }
    
    return {
      success: true,
      data: { id: appointmentSnap.id, ...appointmentSnap.data() } as Appointment
    }
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar agendamento')
    }
  }
}

// Função para limpar dados removendo valores undefined
function cleanAppointmentData(data: any): any {
  if (data === undefined || data === null) {
    return {}
  }
  
  const cleaned: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    // Pular valores undefined completamente
    if (value === undefined) {
      continue
    }
    
    // Tratar valores null
    if (value === null) {
      // Para campos opcionais, usar string vazia em vez de null
      if (key === 'observations' || key === 'professionalName' || key === 'professionalId') {
        cleaned[key] = ''
      }
      continue
    }
    
    // Tratar arrays
    if (Array.isArray(value)) {
      // Limpar arrays também
      const cleanArray = value.filter(item => item !== undefined && item !== null)
      if (cleanArray.length > 0) {
        cleaned[key] = cleanArray
      }
    } 
    // Tratar objetos (recursivamente)
    else if (typeof value === 'object' && value !== null) {
      const cleanObject = cleanAppointmentData(value)
      if (Object.keys(cleanObject).length > 0) {
        cleaned[key] = cleanObject
      }
    } 
    // Tratar valores primitivos
    else {
      cleaned[key] = value
    }
  }
  
  return cleaned
}

// Criar novo agendamento
export async function createAppointment(data: CreateAppointmentData, userId: string): Promise<ApiResponse<Appointment>> {
  try {
    // Verificar conflitos
    const conflicts = await checkAppointmentConflicts(data)
    if (conflicts.length > 0) {
      return {
        success: false,
        error: createInternalError(conflicts[0].message)
      }
    }
    
    // Garantir que os arrays estejam definidos e limpos
    const cleanAttendingClients = (data.attendingClients || []).filter(client => 
      client && 
      client.clientId && 
      client.clientName && 
      client.clientId !== undefined && 
      client.clientName !== undefined
    ).map(client => ({
      clientId: client.clientId || '',
      clientName: client.clientName || '',
      isMainClient: client.isMainClient || false
    }))
    
    const cleanAttendingChildren = (data.attendingChildren || []).filter(child => 
      child && 
      child.childName && 
      child.childName !== undefined
    ).map(child => ({
      childName: child.childName || '',
      childAge: child.childAge || '',
      specialConditions: child.specialConditions || ''
    }))
    
    const appointmentData = cleanAppointmentData({
      ...data,
      status: 'scheduled' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
      // Garantir que os campos de clientes e filhos estejam presentes
      attendingClients: cleanAttendingClients,
      attendingChildren: cleanAttendingChildren
    })
    
    // Verificar se ainda há valores undefined
    for (const [key, value] of Object.entries(appointmentData)) {
      if (value === undefined) {
        console.error(`Campo com valor undefined encontrado: ${key}`)
      }
    }
    
    // Verificar recursivamente objetos aninhados
    function checkForUndefined(obj: any, path: string = ''): void {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        if (value === undefined) {
          console.error(`Campo undefined encontrado em: ${currentPath}`)
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          checkForUndefined(value, currentPath)
        }
      }
    }
    
    checkForUndefined(appointmentData)
    
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData)
    
    return {
      success: true,
      data: {
        id: docRef.id,
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Appointment
    }
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return {
      success: false,
      error: createInternalError('Erro ao criar agendamento')
    }
  }
}

// Atualizar agendamento
export async function updateAppointment(id: string, data: UpdateAppointmentData): Promise<ApiResponse<Appointment>> {
  try {
    const appointmentRef = doc(db, 'appointments', id)
    
    // Se estiver alterando data/hora/profissional, verificar conflitos
    if (data.date || data.time || data.professionalId) {
      const currentAppointment = await getAppointment(id)
      if (!currentAppointment.success) {
        return currentAppointment
      }
      
      const checkData = {
        ...currentAppointment.data,
        ...data
      }
      
      const conflicts = await checkAppointmentConflicts(checkData, id)
      if (conflicts.length > 0) {
        return {
          success: false,
          error: createInternalError(conflicts[0].message)
        }
      }
    }
    
    // Garantir que os arrays estejam definidos e limpos
    const cleanAttendingClients = (data.attendingClients || []).filter(client => 
      client && 
      client.clientId && 
      client.clientName && 
      client.clientId !== undefined && 
      client.clientName !== undefined
    ).map(client => ({
      clientId: client.clientId || '',
      clientName: client.clientName || '',
      isMainClient: client.isMainClient || false
    }))
    
    const cleanAttendingChildren = (data.attendingChildren || []).filter(child => 
      child && 
      child.childName && 
      child.childName !== undefined
    ).map(child => ({
      childName: child.childName || '',
      childAge: child.childAge || '',
      specialConditions: child.specialConditions || ''
    }))
    
    const updateData = cleanAppointmentData({
      ...data,
      updatedAt: serverTimestamp(),
      // Garantir que os campos de clientes e filhos estejam presentes
      attendingClients: cleanAttendingClients,
      attendingChildren: cleanAttendingChildren
    })
    
    await updateDoc(appointmentRef, updateData)
    
    return {
      success: true,
      data: { id, ...updateData } as Appointment
    }
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return {
      success: false,
      error: createInternalError('Erro ao atualizar agendamento')
    }
  }
}

// Excluir agendamento
export async function deleteAppointment(id: string): Promise<ApiResponse<void>> {
  try {
    await deleteDoc(doc(db, 'appointments', id))
    return {
      success: true,
      data: undefined
    }
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return {
      success: false,
      error: createInternalError('Erro ao excluir agendamento')
    }
  }
}

// Verificar conflitos de agendamento
async function checkAppointmentConflicts(
  data: CreateAppointmentData | UpdateAppointmentData, 
  excludeId?: string
): Promise<AppointmentConflict[]> {
  const conflicts: AppointmentConflict[] = []
  
  try {
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef, 
      where('date', '==', data.date),
      where('status', 'in', ['scheduled', 'in_progress'])
    )
    
    if (data.professionalId) {
      q = query(q, where('professionalId', '==', data.professionalId))
    }
    
    const querySnapshot = await getDocs(q)
    
    querySnapshot.forEach((doc) => {
      if (excludeId && doc.id === excludeId) return
      
      const existingAppointment = { id: doc.id, ...doc.data() } as Appointment
      
      // Verificar sobreposição de horários
      if (hasTimeOverlap(existingAppointment, data)) {
        conflicts.push({
          appointmentId: existingAppointment.id,
          conflictType: 'time_overlap',
          message: `Conflito de horário com agendamento existente (${existingAppointment.time})`,
          date: existingAppointment.date,
          time: existingAppointment.time,
          professionalName: existingAppointment.professionalName || ''
        })
      }
    })
    
    return conflicts
  } catch (error) {
    console.error('Erro ao verificar conflitos:', error)
    return []
  }
}

// Verificar sobreposição de horários
function hasTimeOverlap(existing: Appointment, newData: CreateAppointmentData | UpdateAppointmentData): boolean {
  const existingStart = parseTimeToMinutes(existing.time)
  const existingEnd = existingStart + existing.duration
  
  const newStart = parseTimeToMinutes(newData.time!)
  const newEnd = newStart + (newData.duration || 0)
  
  return (existingStart < newEnd && newStart < existingEnd)
}

// Converter horário para minutos
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Buscar serviços
export async function getServices(): Promise<ApiResponse<Service[]>> {
  try {
    // Por enquanto, retornar serviços padrão
    // No futuro, pode ser implementado com Firebase
    return {
      success: true,
      data: DEFAULT_SERVICES
    }
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar serviços')
    }
  }
}

// Buscar profissionais
export async function getProfessionals(): Promise<ApiResponse<Professional[]>> {
  try {
    // Por enquanto, retornar profissionais padrão
    // No futuro, pode ser implementado com Firebase
    return {
      success: true,
      data: DEFAULT_PROFESSIONALS
    }
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar profissionais')
    }
  }
}

// Gerar horários disponíveis para uma data
export async function getAvailableTimeSlots(
  date: string, 
  professionalId?: string
): Promise<ApiResponse<TimeSlot[]>> {
  try {
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('date', '==', date),
      where('status', 'in', ['scheduled', 'in_progress'])
    )
    
    if (professionalId) {
      q = query(q, where('professionalId', '==', professionalId))
    }
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })
    
    // Gerar horários das 8h às 18h, intervalos de 30 minutos
    const timeSlots: TimeSlot[] = []
    const startHour = 8
    const endHour = 18
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isAvailable = !appointments.some(appointment => 
          appointment.time === time
        )
        
        const appointment = appointments.find(appointment => appointment.time === time)
        
        timeSlots.push({
          time,
          isAvailable,
          appointment
        })
      }
    }
    
    return {
      success: true,
      data: timeSlots
    }
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar horários disponíveis')
    }
  }
} 