import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContextDef'

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
