import { describe, it, expect } from 'vitest'
import { Permission } from '@/types/Permissions'

// Função para testar se o wildcard "*" funciona
function hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
  // Se tem wildcard "*", tem todas as permissões
  if (userPermissions.includes('*')) {
    return true
  }
  return userPermissions.includes(requiredPermission)
}

describe('Permissions Wildcard', () => {
  it('should allow all permissions when user has wildcard "*"', () => {
    const userPermissions = ['*']
    
    expect(hasPermission(userPermissions, Permission.USERS_VIEW)).toBe(true)
    expect(hasPermission(userPermissions, Permission.CLIENTS_CREATE)).toBe(true)
    expect(hasPermission(userPermissions, Permission.ADMIN_TENANTS_EDIT)).toBe(true)
  })

  it('should work with specific permissions when no wildcard', () => {
    const userPermissions = [Permission.USERS_VIEW, Permission.CLIENTS_CREATE]
    
    expect(hasPermission(userPermissions, Permission.USERS_VIEW)).toBe(true)
    expect(hasPermission(userPermissions, Permission.CLIENTS_CREATE)).toBe(true)
    expect(hasPermission(userPermissions, Permission.ADMIN_TENANTS_EDIT)).toBe(false)
  })

  it('should deny permissions when user has no permissions', () => {
    const userPermissions: string[] = []
    
    expect(hasPermission(userPermissions, Permission.USERS_VIEW)).toBe(false)
    expect(hasPermission(userPermissions, Permission.CLIENTS_CREATE)).toBe(false)
  })
})
