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
import { config } from '@/lib/config'
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

  // Teste de configuração do Firebase
  useEffect(() => {
    console.log('🔍 Clients - Testando configuração do Firebase:')
    console.log('🔍 Clients - Firebase config:', {
      apiKey: config.firebase.apiKey ? '✅ Configurado' : '❌ Não configurado',
      authDomain: config.firebase.authDomain ? '✅ Configurado' : '❌ Não configurado',
      projectId: config.firebase.projectId ? '✅ Configurado' : '❌ Não configurado',
      storageBucket: config.firebase.storageBucket ? '✅ Configurado' : '❌ Não configurado',
      messagingSenderId: config.firebase.messagingSenderId ? '✅ Configurado' : '❌ Não configurado',
      appId: config.firebase.appId ? '✅ Configurado' : '❌ Não configurado',
    })
    
    // Teste de conexão com Firebase
    const testFirebaseConnection = async () => {
      try {
        console.log('🔍 Clients - Testando conexão com Firebase...')
        const result = await getClients()
        console.log('🔍 Clients - Resultado do teste de conexão:', result)
        if (isSuccessResponse(result)) {
          console.log('✅ Clients - Firebase conectado com sucesso!')
        } else {
          console.error('❌ Clients - Erro na conexão com Firebase:', result.error)
        }
          } catch {
      console.error('❌ Clients - Erro ao testar conexão com Firebase')
    }
    }
    
    testFirebaseConnection()
  }, [])

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
    console.log('🔍 Clients - handleSubmitClient chamado com dados:', data)
    console.log('🔍 Clients - selectedClient:', selectedClient)
    console.log('🔍 Clients - isLoading antes:', isLoading)
    setIsLoading(true)
    console.log('🔍 Clients - isLoading depois:', true)
    
    try {
      if (selectedClient) {
        // Atualizar cliente existente
        console.log('🔍 Clients - atualizando cliente existente:', selectedClient.id)
        const result = await updateClient(selectedClient.id, data)
        console.log('🔍 Clients - resultado do updateClient:', result)
        
        if (isSuccessResponse(result)) {
          console.log('✅ Clients - cliente atualizado com sucesso')
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
        // Criar novo cliente
        console.log('🔍 Clients - criando novo cliente')
        const result = await createClient(data as CreateClientData, user?.uid)
        console.log('🔍 Clients - resultado do createClient:', result)
        
        if (isSuccessResponse(result)) {
          console.log('✅ Clients - cliente criado com sucesso:', result.data)
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
      console.log('🔍 Clients - finalizando, isLoading:', false)
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