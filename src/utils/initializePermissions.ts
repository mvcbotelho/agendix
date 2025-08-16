import { Role, getRolePermissions } from '@/types/Permissions'
import { createUserPermissions } from '@/services/permissionsService'
import { TenantUser } from '@/types/Tenant'

/**
 * Initialize a user's permissions for a tenant.
 *
 * If `tenantUser.permissions` is present and non-empty those permissions are used;
 * otherwise the role's default permissions (from `getRolePermissions`) are applied.
 *
 * @param userId - ID of the user whose permissions will be initialized
 * @param tenantUser - TenantUser object containing `tenantId`, `role`, and optional `permissions`
 * @returns `true` if permissions were created successfully, `false` if an error occurred
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
 * Return whether permissions should be initialized for a given role.
 *
 * Only OWNER and ADMIN roles require initializing user permissions.
 *
 * @param role - The user's role to evaluate.
 * @returns True if permissions should be initialized (OWNER or ADMIN); otherwise false.
 */
export function shouldInitializePermissions(role: Role): boolean {
  return role === Role.OWNER || role === Role.ADMIN
} 