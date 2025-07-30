import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Badge,
  IconButton,
  useDisclosure,
  Input,
  Select,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Flex,
  Spacer,
  Tooltip,
} from '@chakra-ui/react'
import {
  AddIcon,
  SearchIcon,
  CalendarIcon,
  TimeIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
} from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { Appointment, AppointmentStatus } from '@/types/Appointment'
import { formatDateForDisplay } from '@/utils/dateFormatter'

interface AppointmentListProps {
  appointments: Appointment[]
  onAddAppointment: () => void
  onEditAppointment: (appointment: Appointment) => void
  onViewAppointment: (appointment: Appointment) => void
  onDeleteAppointment: (appointment: Appointment) => void
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void
}

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

export function AppointmentList({
  appointments,
  onAddAppointment,
  onEditAppointment,
  onViewAppointment,
  onDeleteAppointment,
  onStatusChange,
}: AppointmentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
      const matchesDate = !dateFilter || appointment.date === dateFilter
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [appointments, searchTerm, statusFilter, dateFilter])

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
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex align="center" justify="space-between">
        <Heading size="lg" color={textColor}>
          Agendamentos
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onAddAppointment}
        >
          Novo Agendamento
        </Button>
      </Flex>

      {/* Filtros */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box>
              <Text fontSize="sm" color={mutedColor} mb={2}>
                Buscar
              </Text>
              <Input
                placeholder="Cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            
            <Box>
              <Text fontSize="sm" color={mutedColor} mb={2}>
                Status
              </Text>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendado</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="sm" color={mutedColor} mb={2}>
                Data
              </Text>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Box>
            
            <Box>
              <Text fontSize="sm" color={mutedColor} mb={2}>
                Ações
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<CalendarIcon />}
                  onClick={handleTodayClick}
                  variant="outline"
                >
                  Hoje
                </Button>
                <Button
                  size="sm"
                  onClick={handleClearFilters}
                  variant="ghost"
                >
                  Limpar
                </Button>
              </HStack>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Lista de Agendamentos */}
      <VStack spacing={4} align="stretch">
        {filteredAppointments.length === 0 ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={8}>
              <Text color={mutedColor}>
                {appointments.length === 0 
                  ? 'Nenhum agendamento encontrado. Clique em "Novo Agendamento" para começar.'
                  : 'Nenhum agendamento encontrado com os filtros aplicados.'
                }
              </Text>
            </CardBody>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Flex align="center" justify="space-between">
                  <VStack align="start" spacing={2} flex={1}>
                    <HStack spacing={4}>
                      <Text fontWeight="bold" color={textColor}>
                        {appointment.clientName}
                      </Text>
                      <Badge colorScheme={STATUS_COLORS[appointment.status]}>
                        {STATUS_LABELS[appointment.status]}
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={6} color={mutedColor}>
                      <HStack spacing={1}>
                        <CalendarIcon />
                        <Text fontSize="sm">
                          {formatDateForDisplay(appointment.date)}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={1}>
                        <TimeIcon />
                        <Text fontSize="sm">
                          {appointment.time} ({appointment.duration}min)
                        </Text>
                      </HStack>
                      
                      <Text fontSize="sm">
                        {appointment.service}
                      </Text>
                      
                      {appointment.professionalName && (
                        <Text fontSize="sm">
                          {appointment.professionalName}
                        </Text>
                      )}
                    </HStack>
                    
                    {appointment.observations && (
                      <Text fontSize="sm" color={mutedColor}>
                        {appointment.observations}
                      </Text>
                    )}

                    {/* Clientes e filhos atendidos */}
                    {(appointment.attendingClients?.length > 0 || appointment.attendingChildren?.length > 0) && (
                      <VStack spacing={1} align="start">
                        {appointment.attendingClients && appointment.attendingClients.length > 0 && (
                          <HStack spacing={2} wrap="wrap">
                            <Text fontSize="xs" fontWeight="medium" color={mutedColor}>
                              Clientes:
                            </Text>
                            {appointment.attendingClients.map((client, index) => (
                              <Badge key={index} size="sm" colorScheme="blue" variant="subtle">
                                {client.clientName}
                                {client.isMainClient && ' (Principal)'}
                              </Badge>
                            ))}
                          </HStack>
                        )}
                        
                        {appointment.attendingChildren && appointment.attendingChildren.length > 0 && (
                          <HStack spacing={2} wrap="wrap">
                            <Text fontSize="xs" fontWeight="medium" color={mutedColor}>
                              Filhos:
                            </Text>
                            {appointment.attendingChildren.map((child, index) => (
                              <Badge key={index} size="sm" colorScheme="green" variant="subtle">
                                {child.childName}
                                {child.childAge && ` (${child.childAge})`}
                              </Badge>
                            ))}
                          </HStack>
                        )}
                      </VStack>
                    )}
                  </VStack>
                  
                  <HStack spacing={2}>
                    <Tooltip label="Ver detalhes">
                      <IconButton
                        aria-label="Ver detalhes"
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewAppointment(appointment)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Editar">
                      <IconButton
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditAppointment(appointment)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Excluir">
                      <IconButton
                        aria-label="Excluir"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onDeleteAppointment(appointment)}
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </VStack>
  )
} 