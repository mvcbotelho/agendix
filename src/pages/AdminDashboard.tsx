import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  useToast,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Spinner,
  Flex,
} from '@chakra-ui/react'
import { 
  ChevronDownIcon, 
  ViewIcon
} from '@chakra-ui/icons'
import { Tenant, TenantStatus, TenantPlan, UpdateTenantData } from '@/types/Tenant'
import { getTenants, updateTenant } from '@/services/tenantService'
import { isSuccessResponse } from '@/types/Error'
import { Menu as MenuComponent } from '@/components/Menu'

interface TenantStats {
  total: number
  active: number
  inactive: number
  suspended: number
  pending: number
  byPlan: {
    free: number
    basic: number
    premium: number
    enterprise: number
  }
}

/**
 * Admin dashboard page that lists and manages tenants.
 *
 * Renders a dashboard with tenant statistics, a searchable/filterable tenant table,
 * and controls to update tenant status or open an edit modal. On mount it loads
 * tenants from the API, computes aggregate statistics (total, counts by status and plan),
 * and keeps a filtered view in sync with search, status and plan filters.
 *
 * Side effects:
 * - Fetches tenant data from the backend on mount and when explicitly refreshed.
 * - Calls the tenant update service to change status or save edits.
 * - Displays success/error toasts for API operations.
 *
 * @returns The dashboard React element.
 */
export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<TenantStats>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0,
    byPlan: {
      free: 0,
      basic: 0,
      premium: 0,
      enterprise: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all')
  const [planFilter, setPlanFilter] = useState<TenantPlan | 'all'>('all')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  // Carregar tenants
  const loadTenants = async () => {
    setIsLoading(true)
    try {
      const response = await getTenants()
      
      if (isSuccessResponse(response)) {
        setTenants(response.data)
        setFilteredTenants(response.data)
        calculateStats(response.data)
      } else {
        toast({
          title: 'Erro',
          description: response.error.userMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar tenants',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular estatísticas
  const calculateStats = (tenantList: Tenant[]) => {
    const newStats: TenantStats = {
      total: tenantList.length,
      active: tenantList.filter(t => t.status === 'active').length,
      inactive: tenantList.filter(t => t.status === 'inactive').length,
      suspended: tenantList.filter(t => t.status === 'suspended').length,
      pending: tenantList.filter(t => t.status === 'pending').length,
      byPlan: {
        free: tenantList.filter(t => t.plan === 'free').length,
        basic: tenantList.filter(t => t.plan === 'basic').length,
        premium: tenantList.filter(t => t.plan === 'premium').length,
        enterprise: tenantList.filter(t => t.plan === 'enterprise').length,
      },
    }
    setStats(newStats)
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = tenants

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter((tenant: Tenant) =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.cnpj?.includes(searchTerm)
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tenant: Tenant) => tenant.status === statusFilter)
    }

    // Filtro por plano
    if (planFilter !== 'all') {
      filtered = filtered.filter((tenant: Tenant) => tenant.plan === planFilter)
    }

    setFilteredTenants(filtered)
  }

  // Atualizar status do tenant
  const updateTenantStatus = async (tenantId: string, newStatus: TenantStatus) => {
    try {
      const response = await updateTenant(tenantId, { status: newStatus } as UpdateTenantData)
      
      if (isSuccessResponse(response)) {
        // Atualizar lista local
        setTenants((prev: Tenant[]) => 
          prev.map((tenant: Tenant) => 
            tenant.id === tenantId 
              ? { ...tenant, status: newStatus }
              : tenant
          )
        )
        
        toast({
          title: 'Sucesso',
          description: 'Status do tenant atualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Recarregar dados
        loadTenants()
      } else {
        toast({
          title: 'Erro',
          description: response.error.userMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Abrir modal de edição
  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    onOpen()
  }

  // Obter cor do badge de status
  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'gray'
      case 'suspended': return 'red'
      case 'pending': return 'yellow'
      default: return 'gray'
    }
  }

  // Obter cor do badge de plano
  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case 'free': return 'gray'
      case 'basic': return 'blue'
      case 'premium': return 'purple'
      case 'enterprise': return 'orange'
      default: return 'gray'
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, planFilter, tenants])

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
    <MenuComponent>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color={textColor}>
              Painel de Administração
            </Heading>
            <Text color={mutedColor} mt={2}>
              Gerencie todos os tenants do sistema
            </Text>
          </Box>

          {/* Estatísticas */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Stat bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Total de Tenants</StatLabel>
              <StatNumber color={textColor}>{stats.total}</StatNumber>
              <StatHelpText color={mutedColor}>Todos os registros</StatHelpText>
            </Stat>

            <Stat bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Ativos</StatLabel>
              <StatNumber color="green.500">{stats.active}</StatNumber>
              <StatHelpText color={mutedColor}>
                {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'}
              </StatHelpText>
            </Stat>

            <Stat bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Pendentes</StatLabel>
              <StatNumber color="yellow.500">{stats.pending}</StatNumber>
              <StatHelpText color={mutedColor}>
                Aguardando aprovação
              </StatHelpText>
            </Stat>

            <Stat bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Suspensos</StatLabel>
              <StatNumber color="red.500">{stats.suspended}</StatNumber>
              <StatHelpText color={mutedColor}>
                Contas bloqueadas
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Filtros */}
          <Box bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <Box flex={1}>
                  <Input
                    placeholder="Buscar por nome, email ou CNPJ..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </Box>
                <Select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as TenantStatus | 'all')}
                  w="200px"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="pending">Pendente</option>
                </Select>
                <Select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as TenantPlan | 'all')}
                  w="200px"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
                <Button
                  onClick={loadTenants}
                  variant="outline"
                >
                  Atualizar
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Tabela de Tenants */}
          <Box bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor} overflow="hidden">
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <Text fontWeight="medium" color={textColor}>
                  Tenants ({filteredTenants.length})
                </Text>
              </HStack>
            </Box>

            {filteredTenants.length === 0 ? (
              <Box p={8} textAlign="center">
                <Text color={mutedColor}>Nenhum tenant encontrado</Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Email</Th>
                      <Th>CNPJ</Th>
                      <Th>Plano</Th>
                      <Th>Status</Th>
                      <Th>Criado em</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTenants.map((tenant) => (
                      <Tr key={tenant.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" color={textColor}>
                              {tenant.name}
                            </Text>
                            <Text fontSize="sm" color={mutedColor}>
                              {tenant.phone}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text color={textColor}>{tenant.email}</Text>
                        </Td>
                        <Td>
                          <Text color={textColor}>{tenant.cnpj || '-'}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getPlanColor(tenant.plan)}>
                            {tenant.plan.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(tenant.status)}>
                            {tenant.status === 'active' && 'Ativo'}
                            {tenant.status === 'inactive' && 'Inativo'}
                            {tenant.status === 'suspended' && 'Suspenso'}
                            {tenant.status === 'pending' && 'Pendente'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text color={textColor}>{formatDate(tenant.createdAt)}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Ver detalhes"
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(tenant)}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Ações"
                                icon={<ChevronDownIcon />}
                                size="sm"
                                variant="ghost"
                              />
                              <MenuList>
                                <MenuItem onClick={() => updateTenantStatus(tenant.id, 'active')}>
                                  Ativar
                                </MenuItem>
                                <MenuItem onClick={() => updateTenantStatus(tenant.id, 'inactive')}>
                                  Desativar
                                </MenuItem>
                                <MenuItem onClick={() => updateTenantStatus(tenant.id, 'suspended')}>
                                  Suspender
                                </MenuItem>
                                <MenuItem onClick={() => openEditModal(tenant)}>
                                  Editar
                                </MenuItem>
                              </MenuList>
                            </Menu>
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
      {selectedTenant && (
        <TenantEditModal
          tenant={selectedTenant}
          isOpen={isOpen}
          onClose={onClose}
          onUpdate={loadTenants}
        />
      )}
    </MenuComponent>
  )
}

// Componente Modal de Edição
interface TenantEditModalProps {
  tenant: Tenant
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

/**
 * Modal dialog that allows editing a tenant's basic information (name, email, phone, CNPJ), plan, and status.
 *
 * The form is pre-filled from `tenant`. On save it calls the `updateTenant` service, shows success or error toasts,
 * invokes `onUpdate()` after a successful update to let the parent refresh data, and then closes the modal via `onClose()`.
 * Validation is limited to what the inputs provide; API errors are surfaced in toasts.
 *
 * @param tenant - Tenant object used to populate the form fields.
 * @param isOpen - Controls whether the modal is visible.
 * @param onClose - Callback invoked to close the modal.
 * @param onUpdate - Callback invoked after a successful update so the parent can refresh its data.
 */
function TenantEditModal({ tenant, isOpen, onClose, onUpdate }: TenantEditModalProps) {
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    cnpj: tenant.cnpj || '',
    plan: tenant.plan,
    status: tenant.status,
  })
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await updateTenant(tenant.id, formData)
      
      if (isSuccessResponse(response)) {
        toast({
          title: 'Sucesso',
          description: 'Tenant atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onUpdate()
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
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tenant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Tenant</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <GridItem>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <GridItem>
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>CNPJ</FormLabel>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <GridItem>
                <FormControl>
                  <FormLabel>Plano</FormLabel>
                  <Select
                    value={formData.plan}
                    onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as TenantPlan }))}
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </Select>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TenantStatus }))}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="pending">Pendente</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <HStack spacing={4} w="full" justify="flex-end">
              <Button onClick={onClose} variant="outline">
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Salvar
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 