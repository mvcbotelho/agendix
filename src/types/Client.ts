export interface Client {
  id: string
  name: string
  email: string
  phone: string
  cpf?: string
  birthDate?: string
  hasChildren?: boolean
  children?: {
    name: string
    birthDate: string
    hasSpecialConditions?: boolean
    specialConditions?: string
  }[]
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  name: string
  email: string
  phone: string
  cpf?: string
  birthDate?: string
  hasChildren?: boolean
  children?: {
    name: string
    birthDate: string
    hasSpecialConditions?: boolean
    specialConditions?: string
  }[]
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  notes?: string
}

export type UpdateClientData = Partial<CreateClientData> 