import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  HStack,
  Icon,
  useToast,
} from "@chakra-ui/react"

import { Client } from "@/types/Client"
import { Appointment } from "@/types/Appointment"
import { useAuthContext } from "@/hooks/useAuthContext"
import { Menu } from "@/components/Menu"
import { getAppointments } from "@/services/appointmentService"
import { getClients } from "@/services/clientService"
import { isSuccessResponse } from "@/types/Error"

// Ícones para os cards
const UserIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </Icon>
)

const UsersIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A3.01 3.01 0 0 0 12 12c-1.66 0-3 1.34-3 3v5h2v-5c0-.55.45-1 1-1s1 .45 1 1v5h2v-5c0-.55.45-1 1-1s1 .45 1 1v5h2z" />
  </Icon>
)

const ChartIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </Icon>
)

const CalendarIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </Icon>
)

const ClockIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </Icon>
)



const CancelIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Icon>
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    // Estatísticas de Clientes
    totalClients: 0,
    clientsWithChildren: 0,
    clientsWithSpecialNeeds: 0,
    
    // Estatísticas de Agendamentos
    totalAppointments: 0,
    scheduledAppointments: 0,
    inProgressAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    
    // Agendamentos por Período
    todayAppointments: 0,
    thisWeekAppointments: 0,
    thisMonthAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  const toast = useToast()
  const { user } = useAuthContext()
  
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")

  // Função para calcular se uma data está em um período específico
  const isDateInPeriod = (dateStr: string, period: 'today' | 'week' | 'month'): boolean => {
    const date = new Date(dateStr)
    const today = new Date()
    
    switch (period) {
      case 'today': {
        return date.toDateString() === today.toDateString()
      }
      case 'week': {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return date >= weekAgo && date <= today
      }
      case 'month': {
        const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)
        return date >= monthAgo && date <= today
      }
      default:
        return false
    }
  }

  const fetchStats = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Buscar clientes
      const clientsResult = await getClients(user?.uid)
      const clients: Client[] = isSuccessResponse(clientsResult) ? clientsResult.data : []
      
      // Buscar agendamentos
      const appointmentsResult = await getAppointments()
      const appointments: Appointment[] = isSuccessResponse(appointmentsResult) ? appointmentsResult.data : []
      
      // Calcular estatísticas de clientes
      const totalClients = clients.length
      const clientsWithChildren = clients.filter(client => client.hasChildren).length
      const clientsWithSpecialNeeds = clients.filter(client => 
        client.children?.some(child => child.hasSpecialConditions)
      ).length
      
      // Calcular estatísticas de agendamentos
      const totalAppointments = appointments.length
      const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length
      const inProgressAppointments = appointments.filter(apt => apt.status === 'in_progress').length
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length
      const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length
      
      // Calcular agendamentos por período
      const todayAppointments = appointments.filter(apt => isDateInPeriod(apt.date, 'today')).length
      const thisWeekAppointments = appointments.filter(apt => isDateInPeriod(apt.date, 'week')).length
      const thisMonthAppointments = appointments.filter(apt => isDateInPeriod(apt.date, 'month')).length
      
      setStats({
        // Estatísticas de Clientes
        totalClients,
        clientsWithChildren,
        clientsWithSpecialNeeds,
        
        // Estatísticas de Agendamentos
        totalAppointments,
        scheduledAppointments,
        inProgressAppointments,
        completedAppointments,
        cancelledAppointments,
        
        // Agendamentos por Período
        todayAppointments,
        thisWeekAppointments,
        thisMonthAppointments,
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      toast({
        title: 'Erro ao carregar estatísticas',
        description: 'Ocorreu um erro ao carregar os dados do dashboard.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, fetchStats])



  return (
    <Menu>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color={textColor} mb={2}>
              Dashboard
            </Heading>
            <Text color={mutedColor}>
              Bem-vindo ao painel de controle do Agendix
            </Text>
          </Box>

          {/* Estatísticas de Clientes */}
          <Box>
            <Heading size="md" color={textColor} mb={4}>
              Estatísticas de Clientes
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <UserIcon />
                      <Text>Total de Clientes</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.totalClients}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <UsersIcon />
                      <Text>Com Filhos</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.clientsWithChildren}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <ChartIcon />
                      <Text>Necessidades Especiais</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.clientsWithSpecialNeeds}
                  </StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Estatísticas de Agendamentos */}
          <Box>
            <Heading size="md" color={textColor} mb={4}>
              Estatísticas de Agendamentos
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <CalendarIcon />
                      <Text>Total de Agendamentos</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.totalAppointments}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <ClockIcon />
                      <Text>Agendados</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.scheduledAppointments}
                  </StatNumber>
                </Stat>
              </Box>

                             <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <CancelIcon />
                      <Text>Cancelados</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.cancelledAppointments}
                  </StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Agendamentos por Período */}
          <Box>
            <Heading size="md" color={textColor} mb={4}>
              Agendamentos por Período
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <CalendarIcon />
                      <Text>Hoje</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.todayAppointments}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <CalendarIcon />
                      <Text>Esta Semana</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.thisWeekAppointments}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel color={mutedColor}>
                    <HStack spacing={2}>
                      <CalendarIcon />
                      <Text>Este Mês</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textColor}>
                    {isLoading ? "..." : stats.thisMonthAppointments}
                  </StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>
          </Box>

          
        </VStack>
      </Container>
    </Menu>
  )
} 