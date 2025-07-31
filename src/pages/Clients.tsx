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
  useToast
} from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { Client, CreateClientData, UpdateClientData } from '@/types/Client'
import { ClientList, ClientForm, ClientDetailsModal } from '@/components/clients'
import { Menu } from '@/components/Menu'

import { getClients, createClient, updateClient, deleteClient } from '@/services/clientService'
import { isSuccessResponse, isErrorResponse } from '@/types/Error'
import { useAuthContext } from '@/hooks/useAuthContext'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const [clientToView, setClientToView] = useState<Client | null>(null)
  const toast = useToast()
  const { user } = useAuthContext()


  const loadClients = useCallback(async () => {
    try {
      const result = await getClients(user?.uid)
      
      if (isSuccessResponse(result)) {
        setClients(result.data)
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao carregar clientes',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [toast, user?.uid])

  // Carregar clientes do Firebase
  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleAddClient = () => {
    setSelectedClient(undefined)
    onOpen()
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    onOpen()
  }

  const handleViewClient = (client: Client) => {
    setClientToView(client)
    onDetailsOpen()
  }

  const handleDeleteClient = async (client: Client) => {
    try {
      const result = await deleteClient(client.id)
      
      if (isSuccessResponse(result)) {
        setClients(clients.filter(c => c.id !== client.id))
        
        toast({
          title: 'Cliente excluído!',
          description: 'O cliente foi removido com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else if (isErrorResponse(result)) {
        toast({
          title: 'Erro ao excluir cliente',
          description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro ao excluir cliente',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleSubmitClient = async (data: CreateClientData | UpdateClientData) => {
    setIsLoading(true)
    
    try {
      if (selectedClient) {
        const result = await updateClient(selectedClient.id, data)
        
        if (isSuccessResponse(result)) {
          setClients(clients.map(client => 
            client.id === selectedClient.id ? result.data : client
          ))
          
          toast({
            title: 'Cliente atualizado!',
            description: 'As informações foram salvas com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          
          onClose()
        } else if (isErrorResponse(result)) {
          console.error('❌ Clients - erro ao atualizar cliente:', result.error)
          toast({
            title: 'Erro ao atualizar cliente',
            description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      } else {
        const result = await createClient(data as CreateClientData, user?.uid)
        
        if (isSuccessResponse(result)) {
          setClients([result.data, ...clients])
          
          toast({
            title: 'Cliente cadastrado!',
            description: 'O cliente foi adicionado com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          
          onClose()
        } else if (isErrorResponse(result)) {
          console.error('❌ Clients - erro ao criar cliente:', result.error)
          toast({
            title: 'Erro ao cadastrar cliente',
            description: typeof result.error === 'string' ? result.error : 'Erro desconhecido',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      }
    } catch {
      console.error('❌ Clients - erro inesperado')
      toast({
        title: 'Erro inesperado',
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
    setSelectedClient(undefined)
  }

  return (
    <Menu>
      <Container maxW="7xl" py={8} px={{ base: 2, md: 6 }}>
        <VStack spacing={8} align="stretch">
          <ClientList
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onViewClient={handleViewClient}
            onDeleteClient={handleDeleteClient}
          />
        </VStack>
      </Container>

      {/* Modal do Formulário */}
      <Modal isOpen={isOpen} onClose={handleCancel} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ClientForm
              client={selectedClient}
              onSubmit={handleSubmitClient}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Detalhes */}
      <ClientDetailsModal
        client={clientToView}
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
      />
    </Menu>
  )
} 