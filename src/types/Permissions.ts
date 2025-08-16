// 🎯 Sistema de Permissões e Roles

export enum Permission {
  // Permissões de Clientes
  CLIENTS_VIEW = 'clients:view',
  CLIENTS_CREATE = 'clients:create',
  CLIENTS_EDIT = 'clients:edit',
  CLIENTS_DELETE = 'clients:delete',
  
  // Permissões de Agendamentos
  APPOINTMENTS_VIEW = 'appointments:view',
  APPOINTMENTS_CREATE = 'appointments:create',
  APPOINTMENTS_EDIT = 'appointments:edit',
  APPOINTMENTS_DELETE = 'appointments:delete',
  APPOINTMENTS_CANCEL = 'appointments:cancel',
  
  // Permissões de Dashboard
  DASHBOARD_VIEW = 'dashboard:view',
  DASHBOARD_ANALYTICS = 'dashboard:analytics',
  
  // Permissões de Administração
  ADMIN_TENANTS_VIEW = 'admin:tenants:view',
  ADMIN_TENANTS_EDIT = 'admin:tenants:edit',
  ADMIN_TENANTS_DELETE = 'admin:tenants:delete',
  ADMIN_USERS_VIEW = 'admin:users:view',
  ADMIN_USERS_EDIT = 'admin:users:edit',
  ADMIN_USERS_DELETE = 'admin:users:delete',
  ADMIN_SETTINGS_VIEW = 'admin:settings:view',
  ADMIN_SETTINGS_EDIT = 'admin:settings:edit',
  
  // Permissões de Configurações
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  SETTINGS_BRANDING = 'settings:branding',
  SETTINGS_NOTIFICATIONS = 'settings:notifications',
  
  // Permissões de Relatórios
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',
  
  // Permissões de Usuários do Tenant
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',
  USERS_PERMISSIONS = 'users:permissions',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  VIEWER = 'viewer',
}

export interface RolePermissions {
  role: Role
  permissions: Permission[]
  description: string
}

export interface UserPermissions {
  userId: string
  tenantId: string
  role: Role
  permissions: Permission[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserPermissionsData {
  userId: string
  tenantId: string
  role: Role
  permissions?: Permission[]
}

export type UpdateUserPermissionsData = Partial<CreateUserPermissionsData>

// 🎯 Configurações de Roles por Padrão
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [Role.OWNER]: {
    role: Role.OWNER,
    permissions: Object.values(Permission), // Todas as permissões
    description: 'Proprietário com acesso total ao sistema'
  },
  
  [Role.ADMIN]: {
    role: Role.ADMIN,
    permissions: [
      Permission.CLIENTS_VIEW,
      Permission.CLIENTS_CREATE,
      Permission.CLIENTS_EDIT,
      Permission.CLIENTS_DELETE,
      Permission.APPOINTMENTS_VIEW,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_EDIT,
      Permission.APPOINTMENTS_DELETE,
      Permission.APPOINTMENTS_CANCEL,
      Permission.DASHBOARD_VIEW,
      Permission.DASHBOARD_ANALYTICS,
      Permission.SETTINGS_VIEW,
      Permission.SETTINGS_EDIT,
      Permission.SETTINGS_BRANDING,
      Permission.SETTINGS_NOTIFICATIONS,
      Permission.REPORTS_VIEW,
      Permission.REPORTS_EXPORT,
      Permission.USERS_VIEW,
      Permission.USERS_CREATE,
      Permission.USERS_EDIT,
      Permission.USERS_DELETE,
      Permission.USERS_PERMISSIONS,
    ],
    description: 'Administrador com acesso completo às operações'
  },
  
  [Role.MANAGER]: {
    role: Role.MANAGER,
    permissions: [
      Permission.CLIENTS_VIEW,
      Permission.CLIENTS_CREATE,
      Permission.CLIENTS_EDIT,
      Permission.APPOINTMENTS_VIEW,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_EDIT,
      Permission.APPOINTMENTS_CANCEL,
      Permission.DASHBOARD_VIEW,
      Permission.DASHBOARD_ANALYTICS,
      Permission.SETTINGS_VIEW,
      Permission.REPORTS_VIEW,
      Permission.USERS_VIEW,
    ],
    description: 'Gerente com acesso a operações principais'
  },
  
  [Role.STAFF]: {
    role: Role.STAFF,
    permissions: [
      Permission.CLIENTS_VIEW,
      Permission.CLIENTS_CREATE,
      Permission.APPOINTMENTS_VIEW,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_EDIT,
      Permission.DASHBOARD_VIEW,
    ],
    description: 'Funcionário com acesso básico às operações'
  },
  
  [Role.VIEWER]: {
    role: Role.VIEWER,
    permissions: [
      Permission.CLIENTS_VIEW,
      Permission.APPOINTMENTS_VIEW,
      Permission.DASHBOARD_VIEW,
    ],
    description: 'Visualizador com acesso apenas de leitura'
  }
}

// 🎯 Utilitários de Permissões
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const hasAnyPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export const hasAllPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

export const getRolePermissions = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role]?.permissions || []
}

export const getRoleDescription = (role: Role): string => {
  return ROLE_PERMISSIONS[role]?.description || 'Descrição não disponível'
}

export const getAllRoles = (): Role[] => {
  return Object.values(Role)
}

export const getAllPermissions = (): Permission[] => {
  return Object.values(Permission)
}

// 🎯 Grupos de Permissões para Interface
export const PERMISSION_GROUPS = {
  'Clientes': [
    Permission.CLIENTS_VIEW,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_EDIT,
    Permission.CLIENTS_DELETE,
  ],
  'Agendamentos': [
    Permission.APPOINTMENTS_VIEW,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_EDIT,
    Permission.APPOINTMENTS_DELETE,
    Permission.APPOINTMENTS_CANCEL,
  ],
  'Dashboard': [
    Permission.DASHBOARD_VIEW,
    Permission.DASHBOARD_ANALYTICS,
  ],
  'Administração': [
    Permission.ADMIN_TENANTS_VIEW,
    Permission.ADMIN_TENANTS_EDIT,
    Permission.ADMIN_TENANTS_DELETE,
    Permission.ADMIN_USERS_VIEW,
    Permission.ADMIN_USERS_EDIT,
    Permission.ADMIN_USERS_DELETE,
    Permission.ADMIN_SETTINGS_VIEW,
    Permission.ADMIN_SETTINGS_EDIT,
  ],
  'Configurações': [
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.SETTINGS_BRANDING,
    Permission.SETTINGS_NOTIFICATIONS,
  ],
  'Relatórios': [
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
  ],
  'Usuários': [
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.USERS_PERMISSIONS,
  ],
} 