import { createContext } from 'react'
import { User } from 'firebase/auth'
import { Tenant, TenantUser, CreateTenantData } from '@/types/Tenant'
import { ApiResponse } from '@/types/Error'

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  tenantUser: TenantUser | null
  loading: boolean
  isAuthenticated: boolean
  isTenantLoaded: boolean
  login: (email: string, password: string) => Promise<ApiResponse<{ user: User }>>
  loginWithGoogle: () => Promise<ApiResponse<{ user: User }>>
  logout: () => Promise<ApiResponse<void>>
  resetPassword: (email: string) => Promise<ApiResponse<void>>
  createTenant: (tenantData: CreateTenantData) => Promise<ApiResponse<{ tenant: Tenant }>>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined) 