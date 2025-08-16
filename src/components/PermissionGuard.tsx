import React, { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/Permissions'
import { Box, Spinner, Text, Center } from '@chakra-ui/react'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
  loadingFallback,
  errorFallback,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, error } = usePermissions()

  // Loading state
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>
    }
    return (
      <Center p={4}>
        <Spinner size="sm" />
        <Text ml={2} fontSize="sm" color="gray.500">
          Verificando permissões...
        </Text>
      </Center>
    )
  }

  // Error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>
    }
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500" fontSize="sm">
          Erro ao verificar permissões
        </Text>
      </Box>
    )
  }

  // Check permissions
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  } else {
    // Se não especificou permissões, permite acesso
    hasAccess = true
  }

  // Render children if user has access
  if (hasAccess) {
    return <>{children}</>
  }

  // Render fallback if user doesn't have access
  if (fallback) {
    return <>{fallback}</>
  }

  // Default fallback
  return (
    <Box p={4} textAlign="center">
      <Text color="gray.500" fontSize="sm">
        Você não tem permissão para acessar este recurso
      </Text>
    </Box>
  )
}

// Componente para verificar permissão específica
interface RequirePermissionProps {
  children: ReactNode
  permission: Permission
  fallback?: ReactNode
}

export function RequirePermission({ children, permission, fallback }: RequirePermissionProps) {
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Componente para verificar qualquer uma das permissões
interface RequireAnyPermissionProps {
  children: ReactNode
  permissions: Permission[]
  fallback?: ReactNode
}

export function RequireAnyPermission({ children, permissions, fallback }: RequireAnyPermissionProps) {
  return (
    <PermissionGuard permissions={permissions} requireAll={false} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Componente para verificar todas as permissões
interface RequireAllPermissionsProps {
  children: ReactNode
  permissions: Permission[]
  fallback?: ReactNode
}

export function RequireAllPermissions({ children, permissions, fallback }: RequireAllPermissionsProps) {
  return (
    <PermissionGuard permissions={permissions} requireAll={true} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Componente para verificar se é admin
interface RequireAdminProps {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  const { isAdmin } = usePermissions()

  if (!isAdmin()) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500" fontSize="sm">
          Acesso restrito a administradores
        </Text>
      </Box>
    )
  }

  return <>{children}</>
}

// Componente para verificar se é owner
interface RequireOwnerProps {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireOwner({ children, fallback }: RequireOwnerProps) {
  const { isOwner } = usePermissions()

  if (!isOwner()) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500" fontSize="sm">
          Acesso restrito ao proprietário
        </Text>
      </Box>
    )
  }

  return <>{children}</>
} 