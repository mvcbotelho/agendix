import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContextDef'

/**
 * Hook that selects and returns tenant-related state from AuthContext.
 *
 * Returns a plain object exposing both raw context values and convenient derived fields:
 * - `tenant`: the current tenant object from context
 * - `tenantUser`: the current tenant user object from context
 * - `hasTenant`: boolean indicating whether a tenant is present
 * - `hasTenantUser`: boolean indicating whether a tenant user is present
 * - `isTenantLoaded`: boolean indicating whether tenant data has finished loading
 * - `tenantId`: derived tenant identifier (`tenant?.id`)
 * - `userRole`: derived tenant user role (`tenantUser?.role`)
 * - `userPermissions`: derived tenant user permissions (`tenantUser?.permissions`), defaults to `[]` when absent
 *
 * @returns An object containing tenant and tenant-user state and derived convenience fields.
 */
export function useTenant() {
  const auth = useContext(AuthContext)
  
  return {
    tenant: auth.tenant,
    tenantUser: auth.tenantUser,
    hasTenant: auth.hasTenant,
    hasTenantUser: auth.hasTenantUser,
    isTenantLoaded: auth.isTenantLoaded,
    tenantId: auth.tenant?.id,
    userRole: auth.tenantUser?.role,
    userPermissions: auth.tenantUser?.permissions || [],
  }
}
