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

/**
 * Conditionally renders children based on the current user's permissions, with support for loading, error and fallback UIs.
 *
 * When permission checks are in progress the component renders `loadingFallback` (if provided) or a default spinner/message.
 * If the permission check failed it renders `errorFallback` (if provided) or a default error message.
 * Permission evaluation:
 * - If `permission` is provided, access is granted when that single permission is present.
 * - Else if `permissions` is provided, access is granted when any (default) or all (`requireAll = true`) of the listed permissions are present.
 * - If neither `permission` nor `permissions` is provided, access is granted.
 * When access is denied the component renders `fallback` (if provided) or a default "no permission" message.
 *
 * @param permission - A single permission key to check.
 * @param permissions - An array of permission keys to check.
 * @param requireAll - If true and `permissions` is provided, all permissions must be present; otherwise any matching permission grants access.
 * @param fallback - UI to show when the user lacks required permissions.
 * @param loadingFallback - UI to show while permission checks are in progress.
 * @param errorFallback - UI to show if permission checking fails.
 * @returns The guarded UI: either `children`, one of the provided fallbacks, or a default status message as JSX.
 */
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

/**
 * Renders `children` only if the current user has the specified permission.
 *
 * A thin convenience wrapper around `PermissionGuard` that checks a single
 * permission and renders an optional `fallback` when access is denied.
 *
 * @param permission - The permission string required to render `children`.
 * @param fallback - Optional element rendered when the user lacks the permission.
 * @returns The guarded content (`children`) when access is granted, otherwise the `fallback` or the default denial UI.
 */
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

/**
 * Renders `children` only if the current user has at least one of the provided permissions.
 *
 * Use this wrapper when access should be granted if any permission in the `permissions` array is present.
 *
 * @param permissions - Array of permission identifiers to check; access is granted if the user has any one of them.
 * @param fallback - Optional element to render when the user lacks the required permissions.
 */
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

/**
 * Renders children only if the current user has all of the specified permissions.
 *
 * Uses PermissionGuard with requireAll set to true. If the user lacks any of the listed
 * permissions, the provided `fallback` is rendered; if `fallback` is not provided a default
 * "permission denied" message is shown.
 *
 * @param permissions - Array of permission keys to check; all must be granted for access.
 * @param fallback - Optional React node to render when access is denied.
 * @returns A JSX element that conditionally renders `children` or the `fallback`.
 */
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

/**
 * Renders `children` only for users with the admin role; otherwise renders a fallback or a default message.
 *
 * Uses the `usePermissions().isAdmin()` check to determine access. If the user is not an admin and
 * a `fallback` is provided, that fallback is rendered. If no `fallback` is provided, a centered box
 * with the message "Acesso restrito a administradores" is shown.
 *
 * @param children - Content to render when the user is an admin.
 * @param fallback - Optional content to render when the user is not an admin. If omitted, a default message is shown.
 * @returns The children when admin, otherwise the fallback or a default access-restricted message.
 */
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

/**
 * Renders `children` only when the current user is the resource owner; otherwise renders a fallback or a default "access restricted" message.
 *
 * The component checks ownership via the application's permissions hook and conditionally returns content:
 * - If the user is the owner, `children` are rendered.
 * - If the user is not the owner and `fallback` is provided, `fallback` is rendered.
 * - If the user is not the owner and no `fallback` is provided, a default localized message "Acesso restrito ao proprietário" is shown.
 *
 * @param children - React nodes to render when the user is the owner.
 * @param fallback - Optional React node to render when the user is not the owner; if omitted a default message is displayed.
 * @returns A JSX element containing either `children`, the `fallback`, or the default restricted-access message.
 */
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