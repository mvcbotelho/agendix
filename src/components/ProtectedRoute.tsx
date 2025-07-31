import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Box, Spinner, Center, Text } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  // Se há usuário e tenant, renderizar o conteúdo protegido
  return <>{children}</>
} 