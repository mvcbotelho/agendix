import {
  Container,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Box,
  useColorModeValue,
  Text,
  HStack,
  IconButton,
  Flex,
  Spacer,
  Badge,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  AddIcon,
  SearchIcon,
  CalendarIcon,
  ViewIcon,
  EditIcon,
  DeleteIcon,
  Avatar,
} from '@chakra-ui/icons'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentStatus } from '@/types/Appointment'
import { AppointmentForm, AppointmentDetailsModal } from '@/components/appointments'
import { Menu } from '@/components/Menu'

import { 
  getAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '@/services/appointmentService'
import { isSuccessResponse, isErrorResponse } from '@/types/Error'
import { useAuthContext } from '@/hooks/useAuthContext'
import { formatDateForDisplay } from '@/utils/dateFormatter'

const STATUS_COLORS = {
  scheduled: 'blue',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
}

const STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [appointmentToView, setAppointmentToView] = useState<Appointment | null>(null)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const { user } = useAuthContext()

  // Cores responsivas
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')


  // Breakpoints responsivos
  const isMobile = useBreakpointValue({ base: true, md: false })
  const containerMaxW = useBreakpointValue({ base: '100%', md: 'container.xl' })
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  const loadAppointments = useCallback(async () => {
    try {
      const result = await getAppointments()
      
      if (isSuccessResponse(result)) {
        setAppointments(result.data)
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao carregar agendamentos',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro ao carregar agendamentos',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [toast])

  // Carregar agendamentos do Firebase
  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleAddAppointment = () => {
    setSelectedAppointment(undefined)
    onOpen()
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    onOpen()
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setAppointmentToView(appointment)
    onDetailsOpen()
  }

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment)
    onDeleteOpen()
  }

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return

    setIsLoading(true)
    try {
      const result = await deleteAppointment(appointmentToDelete.id)
      
      if (isSuccessResponse(result)) {
        toast({
          title: 'Agendamento excluído',
          description: 'Agendamento excluído com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        loadAppointments()
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao excluir agendamento',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro ao excluir agendamento',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
      onDeleteClose()
      setAppointmentToDelete(null)
    }
  }

  const handleStatusChange = async (appointment: Appointment, status: AppointmentStatus) => {
    setIsLoading(true)
    try {
      const result = await updateAppointment(appointment.id, { status })
      
      if (isSuccessResponse(result)) {
        toast({
          title: 'Status atualizado',
          description: `Status alterado para ${STATUS_LABELS[status]}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        loadAppointments()
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao atualizar status',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAppointment = async (data: CreateAppointmentData | UpdateAppointmentData) => {
    setIsLoading(true)
    try {
      let result
      
      if (selectedAppointment) {
        // Atualizar agendamento existente
        result = await updateAppointment(selectedAppointment.id, data as UpdateAppointmentData)
      } else {
        // Criar novo agendamento
        if (!user?.uid) {
          toast({
            title: 'Erro',
            description: 'Usuário não autenticado',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          return
        }
        result = await createAppointment(data as CreateAppointmentData, user.uid)
      }
      
      if (isSuccessResponse(result)) {
        toast({
          title: selectedAppointment ? 'Agendamento atualizado' : 'Agendamento criado',
          description: selectedAppointment 
            ? 'Agendamento atualizado com sucesso.' 
            : 'Agendamento criado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        loadAppointments()
        onClose()
        setSelectedAppointment(undefined)
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
    setSelectedAppointment(undefined)
  }

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDate = !dateFilter || appointment.date === dateFilter
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const today = new Date().toISOString().split('T')[0]

  const handleTodayClick = () => {
    setDateFilter(today)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('')
  }

  return (
    <Box>
      <Menu>
        <Container maxW={containerMaxW} py={4}>
          <VStack spacing={6} align="stretch">
            {/* Header Mobile */}
            <Box>
              <Flex align="center" mb={4}>
                <Heading size="lg" color={textColor}>
                  Agendamentos
                </Heading>
                <Spacer />
                <IconButton
                  aria-label="Adicionar agendamento"
                  icon={<AddIcon />}
                  colorScheme="blue"
                  size={isMobile ? "md" : "lg"}
                  onClick={handleAddAppointment}
                  isRound
                />
              </Flex>
            </Box>

            {/* Filtros Mobile */}
            <VStack spacing={3} align="stretch">
              {/* Busca */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={mutedColor} />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por cliente ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={isMobile ? "md" : "lg"}
                />
              </InputGroup>

              {/* Filtros Rápidos */}
              <SimpleGrid columns={isMobile ? 2 : 3} spacing={3}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size={isMobile ? "md" : "lg"}
                >
                  <option value="all">Todos os status</option>
                  <option value="scheduled">Agendado</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </Select>

                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  size={isMobile ? "md" : "lg"}
                />

                {!isMobile && (
                  <Button
                    onClick={handleTodayClick}
                    leftIcon={<CalendarIcon boxSize={4} />}
                    variant="outline"
                    size="lg"
                  >
                    Hoje
                  </Button>
                )}
              </SimpleGrid>

              {/* Botões de Filtro Mobile */}
              {isMobile && (
                <HStack spacing={2}>
                  <Button
                    onClick={handleTodayClick}
                    leftIcon={<CalendarIcon boxSize={4} />}
                    variant="outline"
                    size="sm"
                    flex={1}
                  >
                    Hoje
                  </Button>
                  <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    flex={1}
                  >
                    Limpar
                  </Button>
                </HStack>
              )}
            </VStack>

            {/* Lista de Agendamentos Mobile */}
            <VStack spacing={3} align="stretch">
              {filteredAppointments.length === 0 ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody textAlign="center" py={8}>
                    <Text color={mutedColor}>
                      {searchTerm || statusFilter !== 'all' || dateFilter
                        ? 'Nenhum agendamento encontrado com os filtros aplicados.'
                        : 'Nenhum agendamento encontrado.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={cardColumns} spacing={4}>
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader pb={2}>
                        <Flex align="center" justify="space-between">
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={1}>
                              {appointment.clientName}
                            </Text>
                            <Text fontSize="sm" color={mutedColor} noOfLines={1}>
                              {appointment.service}
                            </Text>
                          </VStack>
                          <Badge colorScheme={STATUS_COLORS[appointment.status]} size="sm">
                            {STATUS_LABELS[appointment.status]}
                          </Badge>
                        </Flex>
                      </CardHeader>

                      <CardBody pt={0}>
                        <VStack spacing={2} align="stretch">
                          {/* Data e Hora */}
                          <HStack spacing={2} align="center">
                            <CalendarIcon color={mutedColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {formatDateForDisplay(appointment.date)} às {appointment.time}
                            </Text>
                          </HStack>

                                                     {/* Profissional */}
                           {appointment.professionalName && (
                             <HStack spacing={2} align="center">
                               <Avatar color={mutedColor} boxSize={4} />
                               <Text fontSize="sm" color={mutedColor} noOfLines={1}>
                                 {appointment.professionalName}
                               </Text>
                             </HStack>
                           )}

                          

                          <Divider />

                          {/* Ações */}
                          <HStack spacing={2} justify="space-between">
                            <IconButton
                              aria-label="Ver detalhes"
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewAppointment(appointment)}
                            />
                            <IconButton
                              aria-label="Editar"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAppointment(appointment)}
                            />
                            <IconButton
                              aria-label="Excluir"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteAppointment(appointment)}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </VStack>
        </Container>
      </Menu>

      {/* Modal de Formulário */}
      <Modal isOpen={isOpen} onClose={handleCancel} size={isMobile ? "full" : "xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleSubmitAppointment}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

             {/* Modal de Detalhes */}
       {appointmentToView && (
         <AppointmentDetailsModal
           appointment={appointmentToView}
           isOpen={isDetailsOpen}
           onClose={onDetailsClose}
           onEdit={() => {
             onDetailsClose()
             handleEditAppointment(appointmentToView)
           }}
           onStatusChange={handleStatusChange}
         />
       )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Agendamento
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3} isLoading={isLoading}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
} 