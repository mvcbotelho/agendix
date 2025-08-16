import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/Permissions'
import { Box, Spinner, Center, Text } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  requireAdmin?: boolean
  requireOwner?: boolean
}

export function ProtectedRoute({ 
  children, 
  permission,
  permissions,
  requireAll = false,
  requireAdmin = false,
  requireOwner = false
}: ProtectedRouteProps) {
  const { user, tenant, loading, isTenantLoaded } = useAuth()
  
  // Temporariamente desabilitando permissões para debug
  const permissionsLoading = false
  const hasPermission = () => true
  const hasAnyPermission = () => true
  const hasAllPermissions = () => true
  const isAdmin = () => true
  const isOwner = () => true

  // Aguardar carregamento do usuário e tenant
  if (loading || !isTenantLoaded) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Carregando...</Text>
        </Box>
      </Center>
    )
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se há usuário mas não há tenant, redirecionar para cadastro de empresa
  if (!tenant) {
    return <Navigate to="/tenant-registration" replace />
  }

  // Temporariamente permitindo acesso a todos
  const hasAccess = true

  // Se não tem acesso, redirecionar para dashboard
  if (!hasAccess) {
    return <Navigate to="/app" replace />
  }

  // Se há usuário, tenant e permissões adequadas, renderizar o conteúdo protegido
  return <>{children}</>
} 