import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  CheckboxGroup,
  useToast,
  Spinner,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Menu as MenuComponent } from '@/components/Menu'
import { RequirePermission } from '@/components/PermissionGuard'
import { InviteUserModal } from '@/components/InviteUserModal'
import { Permission, Role, ROLE_PERMISSIONS, PERMISSION_GROUPS } from '@/types/Permissions'
import { getTenantUsers as getTenantUsersService } from '@/services/tenantService'
import { updateUserPermissions, deleteUserPermissions } from '@/services/permissionsService'
import { getUsersInfo } from '@/services/userService'
import { isSuccessResponse, isErrorResponse } from '@/types/Error'
import { useTenant } from '@/hooks/useTenant'

interface UserWithPermissions {
  userId: string
  tenantId: string
  role: Role
  permissions: Permission[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Campos adicionais que podem vir do Firebase Auth
  email?: string
  displayName?: string
}

/**
 * Tenant users management page — displays, edits and invites users for the current tenant.
 *
 * Renders a permission-guarded UI that lists tenant users (merged with Firebase Auth info),
 * provides an invite flow, and supports editing roles/permissions and removing users.
 *
 * Side effects:
 * - Fetches tenant users and enriches them with Firebase Auth data when `tenantId` becomes available.
 * - Persists permission changes and deletions via backend services and updates the local list on success.
 * - Synchronizes available permissions when the selected role changes.
 *
 * @returns The Users page component as JSX.
 */
export default function Users() {
  const [users, setUsers] = useState<UserWithPermissions[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null)
  const [formData, setFormData] = useState({
    role: Role.STAFF,
    permissions: [] as Permission[],
  })
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isInviteModalOpen, 
    onOpen: onInviteModalOpen, 
    onClose: onInviteModalClose 
  } = useDisclosure()
  const toast = useToast()
  const { tenantId } = useTenant()
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  // Carregar usuários
  const loadUsers = async () => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não encontrado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await getTenantUsersService(tenantId)
      
             if (isSuccessResponse(result)) {
         // Buscar informações dos usuários do Firebase Auth
         const userIds = result.data.map(tenantUser => tenantUser.userId)
         const usersInfoResult = await getUsersInfo(userIds)
         
         // Criar mapa de informações dos usuários
         const usersInfoMap = new Map()
         if (isSuccessResponse(usersInfoResult)) {
           usersInfoResult.data.forEach(userInfo => {
             usersInfoMap.set(userInfo.uid, userInfo)
           })
         }
         
         // Converter TenantUser para UserWithPermissions
         const usersWithPermissions: UserWithPermissions[] = result.data.map(tenantUser => {
           const userInfo = usersInfoMap.get(tenantUser.userId)
           return {
             userId: tenantUser.userId,
             tenantId: tenantUser.tenantId,
             role: tenantUser.role,
             permissions: tenantUser.permissions,
             isActive: tenantUser.isActive,
             createdAt: tenantUser.createdAt,
             updatedAt: tenantUser.updatedAt,
             email: userInfo?.email || undefined,
             displayName: userInfo?.displayName || undefined,
           }
         })
         
         setUsers(usersWithPermissions)
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao carregar usuários',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir modal de edição
  const openEditModal = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setFormData({
      role: user.role,
      permissions: user.permissions,
    })
    onOpen()
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!selectedUser) return

    try {
      const response = await updateUserPermissions(
        selectedUser.userId,
        selectedUser.tenantId,
        {
          role: formData.role,
          permissions: formData.permissions,
        }
      )

      if (isSuccessResponse(response)) {
        toast({
          title: 'Sucesso',
          description: 'Permissões atualizadas com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Atualizar lista local
        setUsers(prev => 
          prev.map(user => 
            user.userId === selectedUser.userId 
              ? { ...user, ...response.data }
              : user
          )
        )
        
        onClose()
      } else {
        toast({
          title: 'Erro',
          description: response.error.userMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar permissões',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Deletar usuário
  const handleDelete = async (userId: string) => {
    if (!selectedUser) return

    try {
      const response = await deleteUserPermissions(selectedUser.userId, selectedUser.tenantId)

      if (isSuccessResponse(response)) {
        toast({
          title: 'Sucesso',
          description: 'Usuário removido com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Remover da lista local
        setUsers(prev => prev.filter(user => user.userId !== userId))
        onClose()
      } else {
        toast({
          title: 'Erro',
          description: response.error.userMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Obter cor do badge de role
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

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Atualizar permissões quando role mudar
  useEffect(() => {
    if (formData.role) {
      setFormData(prev => ({
        ...prev,
        permissions: ROLE_PERMISSIONS[formData.role].permissions,
      }))
    }
  }, [formData.role])

  useEffect(() => {
    if (tenantId) {
      loadUsers()
    }
  }, [tenantId])

  if (isLoading) {
    return (
      <MenuComponent>
        <Container maxW="7xl" py={8}>
          <Flex justify="center" align="center" h="400px">
            <Spinner size="xl" />
          </Flex>
        </Container>
      </MenuComponent>
    )
  }

  return (
    <RequirePermission permission={Permission.USERS_VIEW}>
      <MenuComponent>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" color={textColor}>
                Gerenciar Usuários
              </Heading>
              <Text color={mutedColor} mt={2}>
                Gerencie usuários e permissões do seu tenant
              </Text>
            </Box>

            {/* Tabela de Usuários */}
            <Box bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor} overflow="hidden">
              <Box p={6} borderBottom="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                  <Text fontWeight="medium" color={textColor}>
                    Usuários ({users.length})
                  </Text>
                  <Button colorScheme="blue" size="sm" onClick={onInviteModalOpen}>
                    Adicionar Usuário
                  </Button>
                </HStack>
              </Box>

              {users.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color={mutedColor}>Nenhum usuário encontrado</Text>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Usuário</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Criado em</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((user) => (
                        <Tr key={user.userId}>
                          <Td>
                            <Text fontWeight="medium" color={textColor}>
                              {user.displayName || 'Usuário'}
                            </Text>
                          </Td>
                          <Td>
                            <Text color={textColor}>{user.email || '-'}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getRoleColor(user.role)}>
                              {user.role.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text color={textColor}>{formatDate(user.createdAt)}</Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Editar permissões"
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(user)}
                              />
                              {user.role !== Role.OWNER && (
                                <IconButton
                                  aria-label="Remover usuário"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDelete(user.userId)}
                                />
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </VStack>
        </Container>

        {/* Modal de Edição */}
        {selectedUser && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Editar Permissões</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={6}>
                  {/* Informações do usuário */}
                  <Box w="full">
                    <Text fontWeight="medium" mb={2}>
                      Usuário: {selectedUser.displayName || 'Usuário'}
                    </Text>
                    <Text color={mutedColor} fontSize="sm">
                      Email: {selectedUser.email || '-'}
                    </Text>
                  </Box>

                  {/* Role */}
                  <FormControl>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        role: e.target.value as Role 
                      }))}
                    >
                      {Object.values(Role).map((role) => (
                        <option key={role} value={role}>
                          {role.toUpperCase()} - {ROLE_PERMISSIONS[role].description}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Permissões */}
                  <Box w="full">
                    <FormLabel>Permissões</FormLabel>
                    <CheckboxGroup
                      value={formData.permissions}
                      onChange={(values) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: values as Permission[] 
                      }))}
                    >
                      <VStack align="start" spacing={4}>
                        {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => (
                          <Box key={groupName} w="full">
                            <Text fontWeight="medium" mb={2}>
                              {groupName}
                            </Text>
                            <VStack align="start" spacing={1}>
                              {groupPermissions.map((permission) => (
                                <Checkbox key={permission} value={permission}>
                                  {permission.replace(':', ' - ')}
                                </Checkbox>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </Box>

                  {/* Ações */}
                  <HStack spacing={4} w="full" justify="flex-end">
                    <Button onClick={onClose} variant="outline">
                      Cancelar
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                      Salvar
                    </Button>
                  </HStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {/* Modal de Convite */}
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={onInviteModalClose}
          onSuccess={loadUsers}
        />
      </MenuComponent>
    </RequirePermission>
  )
} 