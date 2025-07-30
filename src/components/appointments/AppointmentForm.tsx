import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Button,
  useColorModeValue,
  Text,
  SimpleGrid,
  Box,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Checkbox,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Appointment, CreateAppointmentData, UpdateAppointmentData, Service, Professional } from '@/types/Appointment'

// Tipo interno para filhos com seleção no formulário
interface ChildWithSelection {
  childName: string
  childAge?: string
  specialConditions?: string
  isSelected: boolean
}

import { Client } from '@/types/Client'
import { getServices, getProfessionals, getAvailableTimeSlots } from '@/services/appointmentService'
import { getClients } from '@/services/clientService'
import { isSuccessResponse } from '@/types/Error'
import { calculateAge } from '@/utils/ageCalculator'

interface AppointmentFormProps {
  appointment?: Appointment
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  isLoading = false,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<Omit<CreateAppointmentData, 'attendingChildren'> & { attendingChildren: ChildWithSelection[] }>({
    clientId: '',
    clientName: '',
    service: '',
    professionalId: '',
    professionalName: '',
    date: '',
    time: '',
    duration: 0,
    observations: '',
    attendingClients: [],
    attendingChildren: [],
  })

  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const clientBoxBg = useColorModeValue('blue.50', 'blue.900')
  const clientBoxBorder = useColorModeValue('blue.200', 'blue.700')
  const childBoxBg = useColorModeValue('green.50', 'green.900')
  const childBoxBorder = useColorModeValue('green.200', 'green.700')
  const unselectedChildBg = useColorModeValue('gray.50', 'gray.800')
  const unselectedChildBorder = useColorModeValue('gray.200', 'gray.700')
  const unselectedChildHoverBg = useColorModeValue('gray.100', 'gray.700')

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true)
      
      try {
        // Carregar clientes
        const clientsResult = await getClients()
        if (isSuccessResponse(clientsResult)) {
          setClients(clientsResult.data)
        }

        // Carregar serviços
        const servicesResult = await getServices()
        if (isSuccessResponse(servicesResult)) {
          setServices(servicesResult.data)
        }

        // Carregar profissionais
        const professionalsResult = await getProfessionals()
        if (isSuccessResponse(professionalsResult)) {
          setProfessionals(professionalsResult.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadInitialData()
  }, [])

  // Preencher formulário se for edição
  useEffect(() => {
    if (appointment) {
      setFormData({
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        service: appointment.service,
        professionalId: appointment.professionalId || '',
        professionalName: appointment.professionalName || '',
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        observations: appointment.observations || '',
        attendingClients: appointment.attendingClients || [],
        attendingChildren: (appointment.attendingChildren || []).map(child => ({
          ...child,
          isSelected: true // Filhos existentes são marcados como selecionados
        })),
      })
    }
  }, [appointment])

  // Carregar horários disponíveis quando data ou profissional mudar
  useEffect(() => {
    const loadAvailableTimeSlots = async () => {
      if (formData.date) {
        const result = await getAvailableTimeSlots(formData.date, formData.professionalId)
        if (isSuccessResponse(result)) {
          const availableTimes = result.data
            .filter(slot => slot.isAvailable)
            .map(slot => slot.time)
          setAvailableTimeSlots(availableTimes)
        }
      }
    }

    loadAvailableTimeSlots()
  }, [formData.date, formData.professionalId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Atualizar duração quando serviço mudar
    if (field === 'service') {
      const selectedService = services.find(s => s.name === value)
      if (selectedService) {
        setFormData(prev => ({ ...prev, duration: selectedService.duration }))
      }
    }

    // Atualizar nome do profissional quando profissional mudar
    if (field === 'professionalId') {
      const selectedProfessional = professionals.find(p => p.id === value)
      if (selectedProfessional) {
        setFormData(prev => ({ ...prev, professionalName: selectedProfessional.name }))
      } else {
        setFormData(prev => ({ ...prev, professionalName: '' }))
      }
    }

    // Atualizar nome do cliente quando cliente mudar
    if (field === 'clientId') {
      const selectedClient = clients.find(c => c.id === value)
      if (selectedClient) {
        setFormData(prev => ({ 
          ...prev, 
          clientName: selectedClient.name,
          // Adicionar cliente principal automaticamente
          attendingClients: [{
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            isMainClient: true
          }],
          // Adicionar todos os filhos do cliente (serão selecionáveis depois)
          attendingChildren: selectedClient.children?.map(child => ({
            childName: child.name,
            childAge: calculateAge(child.birthDate),
            specialConditions: child.specialConditions,
            isSelected: false // Inicialmente nenhum filho selecionado
          })) || []
        }))
      }
    }
  }

  const handleChildSelection = (childIndex: number, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      attendingChildren: prev.attendingChildren.map((child, index) => 
        index === childIndex 
          ? { ...child, isSelected }
          : child
      )
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório'
    }
    if (!formData.service) {
      newErrors.service = 'Serviço é obrigatório'
    }
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    }
    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório'
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Filtrar apenas os filhos selecionados
      const selectedChildren = formData.attendingChildren.filter(child => child.isSelected)
      
      // Limpar dados antes de enviar
      const cleanFormData = {
        ...formData,
        professionalId: formData.professionalId || '',
        professionalName: formData.professionalName || '',
        observations: formData.observations || '',
        attendingClients: formData.attendingClients || [],
        attendingChildren: selectedChildren.map(child => ({
          childName: child.childName,
          childAge: child.childAge,
          specialConditions: child.specialConditions
        }))
      }
      
      console.log('Dados do formulário antes de enviar:', cleanFormData)
      onSubmit(cleanFormData)
    }
  }

  if (isLoadingData) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" />
        <Text color={mutedColor}>Carregando dados...</Text>
      </VStack>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Cliente */}
        <FormControl isInvalid={!!errors.clientId}>
          <FormLabel>Cliente *</FormLabel>
          <Select
            placeholder="Selecione um cliente"
            value={formData.clientId}
            onChange={(e) => handleInputChange('clientId', e.target.value)}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.clientId}</FormErrorMessage>
        </FormControl>

        {/* Clientes que serão atendidos */}
        {formData.attendingClients.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Clientes que serão atendidos:</Text>
            <VStack spacing={2} align="stretch">
              {formData.attendingClients.map((client, index) => (
                <Box
                  key={index}
                  p={3}
                  bg={clientBoxBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={clientBoxBorder}
                >
                  <HStack justify="space-between">
                    <Text fontWeight="medium">
                      {client.clientName}
                      {client.isMainClient && (
                        <Badge ml={2} colorScheme="blue" size="sm">
                          Principal
                        </Badge>
                      )}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Filhos que serão atendidos */}
        {formData.attendingChildren.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Selecione quais filhos serão atendidos:</Text>
            <VStack spacing={2} align="stretch">
              {formData.attendingChildren.map((child, index) => (
                <Box
                  key={index}
                  p={3}
                  bg={child.isSelected ? childBoxBg : unselectedChildBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={child.isSelected ? childBoxBorder : unselectedChildBorder}
                  cursor="pointer"
                  onClick={() => handleChildSelection(index, !child.isSelected)}
                  _hover={{
                    bg: child.isSelected ? childBoxBg : unselectedChildHoverBg
                  }}
                >
                  <HStack spacing={3} align="center">
                    <Checkbox
                      isChecked={child.isSelected}
                      onChange={(e) => handleChildSelection(index, e.target.checked)}
                      colorScheme="green"
                      size="lg"
                    />
                    <VStack spacing={1} align="stretch" flex={1}>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={child.isSelected ? textColor : mutedColor}>
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
                  </HStack>
                </Box>
              ))}
            </VStack>
            <Text fontSize="sm" color={mutedColor} mt={2}>
              Clique nos checkboxes ou nos cards para selecionar/desselecionar os filhos
            </Text>
          </Box>
        )}

        {/* Serviço */}
        <FormControl isInvalid={!!errors.service}>
          <FormLabel>Serviço *</FormLabel>
          <Select
            placeholder="Selecione um serviço"
            value={formData.service}
            onChange={(e) => handleInputChange('service', e.target.value)}
          >
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name} ({service.duration}min)
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.service}</FormErrorMessage>
        </FormControl>

        {/* Profissional */}
        <FormControl>
          <FormLabel>Profissional</FormLabel>
          <Select
            placeholder="Selecione um profissional (opcional)"
            value={formData.professionalId}
            onChange={(e) => handleInputChange('professionalId', e.target.value)}
          >
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Data e Horário */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={!!errors.date}>
            <FormLabel>Data *</FormLabel>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.time}>
            <FormLabel>Horário *</FormLabel>
            <Select
              placeholder="Selecione um horário"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
            >
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.time}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        {/* Duração */}
        <FormControl isInvalid={!!errors.duration}>
          <FormLabel>Duração (minutos) *</FormLabel>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            min={1}
            max={480}
          />
          <FormErrorMessage>{errors.duration}</FormErrorMessage>
        </FormControl>

        {/* Observações */}
        <FormControl>
          <FormLabel>Observações</FormLabel>
          <Textarea
            placeholder="Observações especiais (ex: criança autista — precisa de paciência extra)"
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            rows={3}
          />
        </FormControl>

        {/* Informações do Agendamento */}
        {formData.date && formData.time && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                Resumo do Agendamento
              </Text>
              <Text fontSize="sm">
                {formData.clientName} - {formData.service} - {formData.date} às {formData.time} ({formData.duration}min)
                {formData.professionalName && ` - ${formData.professionalName}`}
              </Text>
            </Box>
          </Alert>
        )}

        {/* Botões */}
        <HStack spacing={4} justify="flex-end">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Salvando..."
          >
            {appointment ? 'Atualizar' : 'Criar'} Agendamento
          </Button>
        </HStack>
      </VStack>
    </form>
  )
} 