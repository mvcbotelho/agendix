import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { initializeUserPermissions } from '@/utils/initializePermissions'
import { Role } from '@/types/Permissions'
import { Menu as MenuComponent } from '@/components/Menu'
import { createTenantUser, getTenantUserByUserId } from '@/services/tenantService'
import { isSuccessResponse } from '@/types/Error'

/**
 * Debug UI for inspecting and managing the current user's tenant and permission state.
 *
 * Renders user, tenant, TenantUser and user-permissions information with color-coded role/status badges,
 * a debug panel for raw Firestore responses, and action buttons to:
 * - initialize permissions (calls initializeUserPermissions and refreshes permissions on success),
 * - create a TenantUser if none exists (checks via getTenantUserByUserId, creates a temporary TenantUser with Role.ADMIN and reloads the page on success),
 * - fetch Firestore debug data (populates a JSON debug panel), and
 * - reload permissions (calls loadUserPermissions).
 *
 * The component relies on useAuth for user/tenant/tenantUser and usePermissions for userPermissions and loading state.
 * While permissions are loading, a centered spinner is shown. Action buttons reflect local loading states and are disabled
 * when the corresponding preconditions are not met (for example, "Inicializar Permissões" is disabled without a TenantUser).
 */
export default function DebugPermissions() {
  const { user, tenant, tenantUser } = useAuth()
  const { userPermissions, isLoading, loadUserPermissions } = usePermissions()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isCreatingTenantUser, setIsCreatingTenantUser] = useState(false)
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)
  const toast = useToast()

  const handleInitializePermissions = async () => {
    if (!user || !tenantUser) {
      toast({
        title: 'Erro',
        description: 'Usuário ou tenant não encontrado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsInitializing(true)
    try {
      const success = await initializeUserPermissions(user.uid, tenantUser)
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Permissões inicializadas com sucesso!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Recarregar permissões
        await loadUserPermissions()
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao inicializar permissões',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao inicializar permissões',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCreateTenantUser = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsCreatingTenantUser(true)
    try {
      // Primeiro, vamos verificar se já existe um TenantUser
      const existingTenantUser = await getTenantUserByUserId(user.uid)
      
      if (isSuccessResponse(existingTenantUser) && existingTenantUser.data) {
        toast({
          title: 'Info',
          description: 'TenantUser já existe!',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      // Se não existe, vamos criar um TenantUser temporário
      // Primeiro precisamos de um tenantId - vamos usar um ID temporário
      const tempTenantId = 'temp-tenant-' + Date.now()
      
      const result = await createTenantUser({
        userId: user.uid,
        tenantId: tempTenantId,
        role: Role.ADMIN,
        permissions: [],
      })

      if (isSuccessResponse(result)) {
        toast({
          title: 'Sucesso',
          description: 'TenantUser criado com sucesso!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Recarregar a página para atualizar os dados
        window.location.reload()
      } else {
        toast({
          title: 'Erro',
          description: result.error.userMessage || 'Erro ao criar TenantUser',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao criar TenantUser',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsCreatingTenantUser(false)
    }
  }

  const handleDebugFirestore = async () => {
    if (!user) return

    try {
      const tenantUserResult = await getTenantUserByUserId(user.uid)
      setDebugInfo({
        tenantUserResult,
        user: {
          uid: user.uid,
          email: user.email,
        },
        tenant,
        tenantUser,
        userPermissions,
      })
    } catch (error) {
      setDebugInfo({ error: error.message })
    }
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.OWNER: return 'purple'
      case Role.ADMIN: return 'blue'
      case Role.MANAGER: return 'green'
      case Role.STAFF: return 'orange'
      case Role.VIEWER: return 'gray'
      default: return 'gray'
    }
  }

  if (isLoading) {
    return (
      <MenuComponent>
        <Container maxW="4xl" py={8}>
          <Box textAlign="center">
            <Spinner size="xl" />
            <Text mt={4}>Carregando informações...</Text>
          </Box>
        </Container>
      </MenuComponent>
    )
  }

  return (
    <MenuComponent>
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Debug de Permissões</Heading>

          {/* Informações do Usuário */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Informações do Usuário</Heading>
                
                <Box>
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{user?.email || 'N/A'}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">UID:</Text>
                  <Text fontSize="sm" fontFamily="mono">{user?.uid || 'N/A'}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Tenant:</Text>
                  <Text>{tenant?.name || 'N/A'}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Tenant ID:</Text>
                  <Text fontSize="sm" fontFamily="mono">{tenant?.id || 'N/A'}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Informações do TenantUser */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">TenantUser</Heading>
                
                {tenantUser ? (
                  <>
                    <Box>
                      <Text fontWeight="bold">Role:</Text>
                      <Badge colorScheme={getRoleColor(tenantUser.role)}>
                        {tenantUser.role.toUpperCase()}
                      </Badge>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Status:</Text>
                      <Badge colorScheme={tenantUser.isActive ? 'green' : 'red'}>
                        {tenantUser.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Permissões no TenantUser:</Text>
                      <Text>{tenantUser.permissions?.length || 0} permissões</Text>
                    </Box>
                  </>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertTitle>TenantUser não encontrado!</AlertTitle>
                    <AlertDescription>
                      O usuário não tem um registro TenantUser associado.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Informações das Permissões */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Permissões do Usuário</Heading>
                
                {userPermissions ? (
                  <>
                    <Box>
                      <Text fontWeight="bold">Role nas Permissões:</Text>
                      <Badge colorScheme={getRoleColor(userPermissions.role)}>
                        {userPermissions.role.toUpperCase()}
                      </Badge>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Status:</Text>
                      <Badge colorScheme={userPermissions.isActive ? 'green' : 'red'}>
                        {userPermissions.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Permissões ({userPermissions.permissions.length}):</Text>
                      <VStack align="start" mt={2} spacing={1}>
                        {userPermissions.permissions.map((permission, index) => (
                          <Badge key={index} colorScheme="blue" variant="outline">
                            {permission}
                          </Badge>
                        ))}
                      </VStack>
                    </Box>
                  </>
                ) : (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Permissões não encontradas!</AlertTitle>
                    <AlertDescription>
                      O usuário não tem permissões definidas no sistema.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Ações */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Ações</Heading>
                
                <HStack spacing={4} wrap="wrap">
                  <Button
                    colorScheme="blue"
                    onClick={handleInitializePermissions}
                    isLoading={isInitializing}
                    loadingText="Inicializando..."
                    isDisabled={!tenantUser}
                  >
                    Inicializar Permissões
                  </Button>

                  <Button
                    colorScheme="green"
                    onClick={handleCreateTenantUser}
                    isLoading={isCreatingTenantUser}
                    loadingText="Criando..."
                    isDisabled={!!tenantUser}
                  >
                    Criar TenantUser
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDebugFirestore}
                    isDisabled={isLoading}
                  >
                    Debug Firestore
                  </Button>

                  <Button
                    variant="outline"
                    onClick={loadUserPermissions}
                    isDisabled={isLoading}
                  >
                    Recarregar Permissões
                  </Button>
                </HStack>

                <Text fontSize="sm" color="gray.600">
                  Use "Criar TenantUser" se você não tem um registro TenantUser. 
                  Use "Inicializar Permissões" se você já tem TenantUser mas não tem permissões.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Debug Info */}
          {debugInfo && (
            <Card>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Debug Info</Heading>
                  <Box 
                    bg="gray.50" 
                    p={4} 
                    borderRadius="md" 
                    w="full" 
                    maxH="400px" 
                    overflow="auto"
                    fontFamily="mono"
                    fontSize="sm"
                  >
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </MenuComponent>
  )
}
