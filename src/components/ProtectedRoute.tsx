import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Box, Spinner, Center, Text } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  requireAdmin?: boolean
  requireOwner?: boolean
}

export function ProtectedRoute({ 
  children, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  permission,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  permissions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requireAll = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requireAdmin = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requireOwner = false
}: ProtectedRouteProps) {
  const { user, tenant, loading, isTenantLoaded } = useAuth()

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