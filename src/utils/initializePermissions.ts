import { Role, getRolePermissions } from '@/types/Permissions'
import { createUserPermissions } from '@/services/permissionsService'
import { TenantUser } from '@/types/Tenant'

/**
 * Inicializa as permissões do usuário baseado no seu role no TenantUser
 * Se o usuário já tem permissões, não faz nada
 */
export async function initializeUserPermissions(
  userId: string, 
  tenantUser: TenantUser
): Promise<boolean> {
  try {
    // Se o tenantUser já tem permissões definidas, usar elas
    if (tenantUser.permissions && tenantUser.permissions.length > 0) {
      await createUserPermissions({
        userId,
        tenantId: tenantUser.tenantId,
        role: tenantUser.role,
        permissions: tenantUser.permissions,
      })
    } else {
      // Caso contrário, usar as permissões padrão do role
      const defaultPermissions = getRolePermissions(tenantUser.role)
      await createUserPermissions({
        userId,
        tenantId: tenantUser.tenantId,
        role: tenantUser.role,
        permissions: defaultPermissions,
      })
    }
    
    return true
  } catch (error) {
    console.error('Erro ao inicializar permissões do usuário:', error)
    return false
  }
}

/**
 * Verifica se o usuário precisa ter suas permissões inicializadas
 * Retorna true se o usuário é owner ou admin (roles que devem ter acesso total)
 */
export function shouldInitializePermissions(role: Role): boolean {
  return role === Role.OWNER || role === Role.ADMIN
} 