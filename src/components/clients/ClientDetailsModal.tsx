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
  Box,
  Badge,
  useColorModeValue,
  Divider,
  Avatar,
} from '@chakra-ui/react'
import { PhoneIcon, EmailIcon, CalendarIcon } from '@chakra-ui/icons'
import { Client } from '@/types/Client'
import { calculateAge } from '@/utils/ageCalculator'
import { formatPhone, formatCPF } from '@/utils/formatters'
import { formatDateForDisplay } from '@/utils/dateFormatter'

interface ClientDetailsModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export function ClientDetailsModal({ client, isOpen, onClose }: ClientDetailsModalProps) {
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const cardBg = useColorModeValue("gray.50", "gray.700")

  if (!client) return null

  const formatAddress = (address: Client['address']) => {
    if (!address) return 'Endereço não informado'
    
    const parts = [
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Avatar size="sm" name={client.name} bg="blue.500" />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                {client.name}
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                Detalhes do Cliente
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Informações Básicas */}
            <Box>
              <Text fontSize="md" fontWeight="medium" color={textColor} mb={3}>
                Informações Básicas
              </Text>
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <EmailIcon color={mutedColor} />
                  <Text fontSize="sm" color={mutedColor}>
                    {client.email}
                  </Text>
                </HStack>
                
                <HStack spacing={3}>
                  <PhoneIcon color={mutedColor} />
                  <Text fontSize="sm" color={mutedColor}>
                    {formatPhone(client.phone)}
                  </Text>
                </HStack>

                {client.cpf && (
                  <HStack spacing={3}>
                    <Text fontSize="sm" fontWeight="medium" color={mutedColor} minW="60px">
                      CPF:
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      {formatCPF(client.cpf)}
                    </Text>
                  </HStack>
                )}

                {client.birthDate && (
                  <HStack spacing={3}>
                    <CalendarIcon color={mutedColor} />
                    <Text fontSize="sm" color={mutedColor}>
                      {formatDateForDisplay(client.birthDate)} 
                      <Text as="span" color="blue.500" ml={2}>
                        ({calculateAge(client.birthDate)})
                      </Text>
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Informações dos Filhos */}
            <Box>
              <Text fontSize="md" fontWeight="medium" color={textColor} mb={3}>
                Informações dos Filhos
              </Text>
              
              {client.hasChildren ? (
                client.children && client.children.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Quantidade de Filhos
                      </Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {client.children.length} filho(s)
                      </Badge>
                    </HStack>

                    <VStack spacing={3} align="stretch">
                      {client.children.map((child, index) => (
                                                 <Box 
                           key={index} 
                           p={3} 
                           border="1px" 
                           borderColor={borderColor} 
                           borderRadius="md"
                           bg={cardBg}
                         >
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                {child.name}
                              </Text>
                              {child.hasSpecialConditions && (
                                <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                  Necessidades Especiais
                                </Badge>
                              )}
                            </HStack>

                                                         {child.birthDate && (
                               <HStack spacing={3}>
                                 <CalendarIcon color={mutedColor} />
                                 <Text fontSize="sm" color={mutedColor}>
                                   {formatDateForDisplay(child.birthDate)}
                                   <Text as="span" color="blue.500" ml={2}>
                                     ({calculateAge(child.birthDate)})
                                   </Text>
                                 </Text>
                               </HStack>
                             )}

                            {child.hasSpecialConditions && child.specialConditions && (
                              <Box>
                                <Text fontSize="xs" fontWeight="medium" color="orange.500" mb={1}>
                                  Condições Especiais:
                                </Text>
                                <Text fontSize="xs" color={mutedColor} fontStyle="italic">
                                  {child.specialConditions}
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={mutedColor}>
                    Possui filhos, mas não há detalhes cadastrados.
                  </Text>
                )
              ) : (
                <Text fontSize="sm" color={mutedColor}>
                  Não possui filhos.
                </Text>
              )}
            </Box>

            <Divider />

            {/* Endereço */}
            {client.address && (
              <Box>
                <Text fontSize="md" fontWeight="medium" color={textColor} mb={3}>
                  Endereço
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {formatAddress(client.address)}
                </Text>
              </Box>
            )}

            {/* Observações */}
            {client.notes && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="md" fontWeight="medium" color={textColor} mb={3}>
                    Observações
                  </Text>
                  <Text fontSize="sm" color={mutedColor} fontStyle="italic">
                    {client.notes}
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 