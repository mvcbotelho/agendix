export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  cnpj?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  plan: TenantPlan
  status: TenantStatus
  settings: TenantSettings
  createdAt: string
  updatedAt: string
}

export type TenantPlan = 'free' | 'basic' | 'premium' | 'enterprise'

export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface TenantSettings {
  maxClients: number
  maxAppointments: number
  features: {
    appointments: boolean
    clients: boolean
    dashboard: boolean
    reports: boolean
    notifications: boolean
    integrations: boolean
  }
  branding: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    customDomain?: string
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export interface CreateTenantData {
  name: string
  email: string
  phone: string
  cnpj?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  plan?: TenantPlan
  settings?: Partial<TenantSettings>
}

export type UpdateTenantData = Partial<CreateTenantData>

export interface TenantUser {
  id: string
  tenantId: string
  userId: string
  role: TenantUserRole
  permissions: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type TenantUserRole = 'owner' | 'admin' | 'manager' | 'staff'

export interface CreateTenantUserData {
  tenantId: string
  userId: string
  role: TenantUserRole
  permissions?: string[]
} 