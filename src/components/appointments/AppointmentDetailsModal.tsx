import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Button,
  useColorModeValue,
  Box,
  SimpleGrid,
} from '@chakra-ui/react'
import { Appointment, AppointmentStatus } from '@/types/Appointment'
import { formatDateForDisplay } from '@/utils/dateFormatter'

interface AppointmentDetailsModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onEdit: (appointment: Appointment) => void
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

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
}: AppointmentDetailsModalProps) {
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const clientBoxBg = useColorModeValue('blue.50', 'blue.900')
  const clientBoxBorder = useColorModeValue('blue.200', 'blue.700')
  const childBoxBg = useColorModeValue('green.50', 'green.900')
  const childBoxBorder = useColorModeValue('green.200', 'green.700')

  if (!appointment) return null

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    onStatusChange(appointment, newStatus)
  }

  const handleEdit = () => {
    onEdit(appointment)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>Detalhes do Agendamento</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Informações do Cliente */}
            <Box>
              <HStack justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold" color={textColor}>
                  Cliente
                </Text>
                <Badge colorScheme={STATUS_COLORS[appointment.status]} fontSize="sm">
                  {STATUS_LABELS[appointment.status]}
                </Badge>
              </HStack>
              <Text color={mutedColor}>
                {appointment.clientName}
              </Text>
            </Box>

            {/* Clientes que serão atendidos */}
            {appointment.attendingClients && appointment.attendingClients.length > 0 && (
              <>
                <Box>
                  <Text fontWeight="bold" color={textColor} mb={2}>
                    Clientes que serão atendidos
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {appointment.attendingClients.map((client, index) => (
                      <Box
                        key={index}
                        p={2}
                        bg={clientBoxBg}
                        borderRadius="md"
                        border="1px"
                        borderColor={clientBoxBorder}
                      >
                        <HStack justify="space-between">
                          <Text color={mutedColor}>
                            {client.clientName}
                          </Text>
                          {client.isMainClient && (
                            <Badge colorScheme="blue" size="sm">
                              Principal
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
                <Divider />
              </>
            )}

            {/* Filhos que serão atendidos */}
            {appointment.attendingChildren && appointment.attendingChildren.length > 0 && (
              <>
                <Box>
                  <Text fontWeight="bold" color={textColor} mb={2}>
                    Filhos que serão atendidos
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {appointment.attendingChildren.map((child, index) => (
                      <Box
                        key={index}
                        p={2}
                        bg={childBoxBg}
                        borderRadius="md"
                        border="1px"
                        borderColor={childBoxBorder}
                      >
                        <VStack spacing={1} align="stretch">
                          <HStack justify="space-between">
                            <Text color={mutedColor}>
                              {child.childName}
                            </Text>
                            {child.childAge && (
                              <Badge colorScheme="green" size="sm">
                                {child.childAge}
                              </Badge>
                            )}
                          </HStack>
                          {child.specialConditions && (
                            <Text fontSize="sm" color={mutedColor}>
                              <strong>Condições especiais:</strong> {child.specialConditions}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
                <Divider />
              </>
            )}

            <Divider />

            {/* Informações do Serviço */}
            <Box>
              <Text fontWeight="bold" color={textColor} mb={2}>
                Serviço
              </Text>
              <Text color={mutedColor}>
                {appointment.service}
              </Text>
            </Box>

            <Divider />

            {/* Data e Horário */}
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="bold" color={textColor} mb={2}>
                  Data
                </Text>
                <Text color={mutedColor}>
                  {formatDateForDisplay(appointment.date)}
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold" color={textColor} mb={2}>
                  Horário
                </Text>
                <Text color={mutedColor}>
                  {appointment.time} ({appointment.duration}min)
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Profissional */}
            {appointment.professionalName && (
              <>
                <Box>
                  <Text fontWeight="bold" color={textColor} mb={2}>
                    Profissional
                  </Text>
                  <Text color={mutedColor}>
                    {appointment.professionalName}
                  </Text>
                </Box>
                <Divider />
              </>
            )}

            {/* Observações */}
            {appointment.observations && (
              <>
                <Box>
                  <Text fontWeight="bold" color={textColor} mb={2}>
                    Observações
                  </Text>
                  <Text color={mutedColor}>
                    {appointment.observations}
                  </Text>
                </Box>
                <Divider />
              </>
            )}

            {/* Ações de Status */}
            <Box>
              <Text fontWeight="bold" color={textColor} mb={3}>
                Alterar Status
              </Text>
              <HStack spacing={2} wrap="wrap">
                {appointment.status !== 'scheduled' && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleStatusChange('scheduled')}
                  >
                    Agendado
                  </Button>
                )}
                
                {appointment.status !== 'in_progress' && (
                  <Button
                    size="sm"
                    colorScheme="orange"
                    onClick={() => handleStatusChange('in_progress')}
                  >
                    Em andamento
                  </Button>
                )}
                
                {appointment.status !== 'completed' && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Concluído
                  </Button>
                )}
                
                {appointment.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    Cancelado
                  </Button>
                )}
              </HStack>
            </Box>

            <Divider />

            {/* Ações */}
            <HStack spacing={3} justify="flex-end">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleEdit}
              >
                Editar
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 