import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { Spinner, Center } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
} 