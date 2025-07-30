import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Avatar,
  Tooltip,
  Collapse,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { EditIcon, ViewIcon, PhoneIcon, EmailIcon, DeleteIcon } from '@chakra-ui/icons'
import { useState, useRef } from 'react'
import { Client } from '@/types/Client'
import { formatDateForDisplay } from '@/utils/dateFormatter'

interface ClientCardProps {
  client: Client
  onEdit: (client: Client) => void
  onView: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientCard({ client, onEdit, onView, onDelete }: ClientCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleteAlertOpen(false)
    onDelete(client)
  }

  const handleCancelDelete = () => {
    setIsDeleteAlertOpen(false)
  }

  return (
    <Box
      bg={cardBg}
      p={{ base: 3, md: 4 }}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
      _hover={{ boxShadow: "md", bg: hoverBg }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Avatar 
              size="sm" 
              name={client.name}
              bg="blue.500"
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold" color={textColor}>
                {client.name}
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                {client.email}
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label="Ver detalhes">
              <IconButton
                aria-label="Ver detalhes"
                icon={<ViewIcon />}
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(client)
                }}
              />
            </Tooltip>
            <Tooltip label="Editar">
              <IconButton
                aria-label="Editar cliente"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(client)
                }}
              />
            </Tooltip>
            <Tooltip label="Excluir">
              <IconButton
                aria-label="Excluir cliente"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleDeleteClick}
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Informações Básicas */}
        <HStack spacing={4} fontSize="sm">
          <HStack spacing={1}>
            <PhoneIcon color={mutedColor} />
            <Text color={mutedColor}>{formatPhone(client.phone)}</Text>
          </HStack>
          <HStack spacing={1}>
            <EmailIcon color={mutedColor} />
            <Text color={mutedColor}>{client.email}</Text>
          </HStack>
        </HStack>

        {/* Detalhes Expandidos */}
        <Collapse in={showDetails} animateOpacity>
          <Divider my={3} />
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                CPF
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                {client.cpf ? formatCPF(client.cpf) : 'Não informado'}
              </Text>
            </Box>

            {client.birthDate && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                  Data de Nascimento
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {formatDateForDisplay(client.birthDate)}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                Endereço
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                {formatAddress(client.address)}
              </Text>
            </Box>

            {client.hasChildren !== undefined && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                  Filhos
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {client.hasChildren ? (
                    client.children && client.children.length > 0 ? (
                      `${client.children.length} filho(s): ${client.children.map(child => 
                        `${child.name}${child.hasSpecialConditions ? ' (condições especiais)' : ''}`
                      ).join(', ')}`
                    ) : (
                      'Sim (sem detalhes)'
                    )
                  ) : (
                    'Não possui filhos'
                  )}
                </Text>
              </Box>
            )}

            {client.notes && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                  Observações
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {client.notes}
                </Text>
              </Box>
            )}
          </VStack>
        </Collapse>
      </VStack>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Cliente
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>?
              </Text>
              <Text mt={2} color="red.500" fontSize="sm">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do cliente serão permanentemente removidos.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
} 