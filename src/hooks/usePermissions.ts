import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  UserPermissions, 
  Permission, 
  Role,
  getRolePermissions,
  getRoleDescription
} from '@/types/Permissions'
import { 
  getUserPermissions, 
  createUserPermissions,
  updateUserPermissions,
  checkUserPermission,
  checkUserAnyPermission,
  checkUserAllPermissions
} from '@/services/permissionsService'
import { isSuccessResponse } from '@/types/Error'
import { initializeUserPermissions } from '@/utils/initializePermissions'

/**
 * React hook that manages and checks per-tenant user permissions.
 *
 * Loads the current user's permissions for the active tenant, offers actions to create/update permissions,
 * synchronous checks (hasPermission, hasAnyPermission, hasAllPermissions), asynchronous server-backed checks
 * (checkPermission, checkAnyPermission, checkAllPermissions), and helpers for role information and role checks.
 *
 * The hook automatically attempts to initialize permissions when none are found and the tenantUser has OWNER or ADMIN role.
 * It exposes loading and error state for UI feedback.
 *
 * @returns An object with:
 *  - userPermissions: Current UserPermissions or null
 *  - isLoading: Whether permissions are being loaded
 *  - error: Error message or null
 *  - loadUserPermissions: Async function to reload permissions
 *  - createPermissions: Async function to create permissions for a user
 *  - updatePermissions: Async function to update a user's permissions
 *  - hasPermission, hasAnyPermission, hasAllPermissions: Synchronous local checks (support wildcard `*`)
 *  - checkPermission, checkAnyPermission, checkAllPermissions: Async server checks
 *  - getCurrentRolePermissions: Returns permissions for the current role
 *  - getCurrentRoleDescription: Returns the description for the current role
 *  - isOwner, isAdmin, isManagerOrHigher, isStaffOrHigher: Boolean role checks
 */
export function usePermissions() {
  const { user, tenant, tenantUser } = useAuth()
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar permissões do usuário
  const loadUserPermissions = async () => {
    if (!user || !tenant) {
      setUserPermissions(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getUserPermissions(user.uid, tenant.id)
      
      if (isSuccessResponse(response)) {
        setUserPermissions(response.data)
      } else {
        // Se não encontrou permissões e temos um tenantUser, tentar inicializar
        if (tenantUser && (tenantUser.role === Role.OWNER || tenantUser.role === Role.ADMIN)) {
          console.log('Inicializando permissões para usuário:', user.uid, 'role:', tenantUser.role)
          
          const initialized = await initializeUserPermissions(user.uid, tenantUser)
          if (initialized) {
            // Tentar carregar novamente
            const retryResponse = await getUserPermissions(user.uid, tenant.id)
            if (isSuccessResponse(retryResponse)) {
              setUserPermissions(retryResponse.data)
            } else {
              setError(retryResponse.error.userMessage)
              setUserPermissions(null)
            }
          } else {
            setError('Erro ao inicializar permissões')
            setUserPermissions(null)
          }
        } else {
          setError(response.error.userMessage)
          setUserPermissions(null)
        }
      }
    } catch (_err) {
      setError('Erro ao carregar permissões')
      setUserPermissions(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Criar permissões para um usuário
  const createPermissions = async (userId: string, role: Role, customPermissions?: Permission[]) => {
    if (!tenant) {
      throw new Error('Tenant não encontrado')
    }

    try {
      const response = await createUserPermissions({
        userId,
        tenantId: tenant.id,
        role,
        permissions: customPermissions,
      })

      if (isSuccessResponse(response)) {
        // Se for o usuário atual, atualizar o estado
        if (userId === user?.uid) {
          setUserPermissions(response.data)
        }
        return response.data
      } else {
        throw new Error(response.error.userMessage)
      }
    } catch (err) {
      throw err
    }
  }

  // Atualizar permissões de um usuário
  const updatePermissions = async (userId: string, role?: Role, permissions?: Permission[]) => {
    if (!tenant) {
      throw new Error('Tenant não encontrado')
    }

    try {
      const response = await updateUserPermissions(userId, tenant.id, {
        role,
        permissions,
      })

      if (isSuccessResponse(response)) {
        // Se for o usuário atual, atualizar o estado
        if (userId === user?.uid) {
          setUserPermissions(response.data)
        }
        return response.data
      } else {
        throw new Error(response.error.userMessage)
      }
    } catch (err) {
      throw err
    }
  }

  // Verificar se usuário tem uma permissão específica
  const hasPermission = (permission: Permission): boolean => {
    if (!userPermissions || !userPermissions.isActive) {
      return false
    }
    // Se tem wildcard "*", tem todas as permissões
    if (userPermissions.permissions.includes('*' as any)) {
      return true
    }
    return userPermissions.permissions.includes(permission)
  }

  // Verificar se usuário tem qualquer uma das permissões
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userPermissions || !userPermissions.isActive) {
      return false
    }
    // Se tem wildcard "*", tem todas as permissões
    if (userPermissions.permissions.includes('*' as any)) {
      return true
    }
    return permissions.some(permission => userPermissions.permissions.includes(permission))
  }

  // Verificar se usuário tem todas as permissões
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userPermissions || !userPermissions.isActive) {
      return false
    }
    // Se tem wildcard "*", tem todas as permissões
    if (userPermissions.permissions.includes('*' as any)) {
      return true
    }
    return permissions.every(permission => userPermissions.permissions.includes(permission))
  }

  // Verificar permissão de forma assíncrona (para casos onde as permissões não estão carregadas)
  const checkPermission = async (permission: Permission): Promise<boolean> => {
    if (!user || !tenant) {
      return false
    }

    try {
      const response = await checkUserPermission(user.uid, tenant.id, permission)
      return isSuccessResponse(response) ? response.data : false
    } catch {
      return false
    }
  }

  // Verificar qualquer permissão de forma assíncrona
  const checkAnyPermission = async (permissions: Permission[]): Promise<boolean> => {
    if (!user || !tenant) {
      return false
    }

    try {
      const response = await checkUserAnyPermission(user.uid, tenant.id, permissions)
      return isSuccessResponse(response) ? response.data : false
    } catch {
      return false
    }
  }

  // Verificar todas as permissões de forma assíncrona
  const checkAllPermissions = async (permissions: Permission[]): Promise<boolean> => {
    if (!user || !tenant) {
      return false
    }

    try {
      const response = await checkUserAllPermissions(user.uid, tenant.id, permissions)
      return isSuccessResponse(response) ? response.data : false
    } catch {
      return false
    }
  }

  // Obter permissões do role atual
  const getCurrentRolePermissions = (): Permission[] => {
    if (!userPermissions) {
      return []
    }
    return getRolePermissions(userPermissions.role)
  }

  // Obter descrição do role atual
  const getCurrentRoleDescription = (): string => {
    if (!userPermissions) {
      return 'Nenhum role definido'
    }
    return getRoleDescription(userPermissions.role)
  }

  // Verificar se é owner
  const isOwner = (): boolean => {
    return userPermissions?.role === Role.OWNER
  }

  // Verificar se é admin
  const isAdmin = (): boolean => {
    return userPermissions?.role === Role.ADMIN || userPermissions?.role === Role.OWNER
  }

  // Verificar se é manager ou superior
  const isManagerOrHigher = (): boolean => {
    return ['owner', 'admin', 'manager'].includes(userPermissions?.role || '')
  }

  // Verificar se é staff ou superior
  const isStaffOrHigher = (): boolean => {
    return ['owner', 'admin', 'manager', 'staff'].includes(userPermissions?.role || '')
  }

  // Carregar permissões quando usuário, tenant ou tenantUser mudar
  useEffect(() => {
    const loadPermissions = async () => {
      if (user && tenant) {
        await loadUserPermissions()
      } else {
        setUserPermissions(null)
        setIsLoading(false)
      }
    }
    
    loadPermissions()
  }, [user?.uid, tenant?.id, tenantUser?.userId])

  return {
    // Estado
    userPermissions,
    isLoading,
    error,
    
    // Ações
    loadUserPermissions,
    createPermissions,
    updatePermissions,
    
    // Verificações síncronas
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Verificações assíncronas
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    
    // Informações do role
    getCurrentRolePermissions,
    getCurrentRoleDescription,
    
    // Verificações de role
    isOwner,
    isAdmin,
    isManagerOrHigher,
    isStaffOrHigher,
  }
} 