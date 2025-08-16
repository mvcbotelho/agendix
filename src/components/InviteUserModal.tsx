import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { inviteUser } from '@/services/userService'
import { Role } from '@/types/Permissions'
import { useTenant } from '@/hooks/useTenant'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: Role.STAFF,
  })
  
  const toast = useToast()
  const { tenantId } = useTenant()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não encontrado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!formData.email || !formData.displayName) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    
    try {
      const result = await inviteUser(
        formData.email,
        formData.displayName,
        formData.role,
        tenantId
      )

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Usuário convidado com sucesso! Um email foi enviado para verificação.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Limpar formulário
        setFormData({
          email: '',
          displayName: '',
          role: Role.STAFF,
        })
        
        onClose()
        onSuccess?.()
      } else {
        toast({
          title: 'Erro',
          description: result.error?.userMessage || 'Erro ao convidar usuário',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao convidar usuário',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: '',
        displayName: '',
        role: Role.STAFF,
      })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <ModalHeader color={textColor}>Convidar Usuário</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    email: e.target.value 
                  }))}
                  placeholder="usuario@exemplo.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Nome</FormLabel>
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    displayName: e.target.value 
                  }))}
                  placeholder="Nome completo"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    role: e.target.value as Role 
                  }))}
                >
                  <option value={Role.STAFF}>Staff - Funcionário</option>
                  <option value={Role.MANAGER}>Manager - Gerente</option>
                  <option value={Role.ADMIN}>Admin - Administrador</option>
                  <option value={Role.VIEWER}>Viewer - Visualizador</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isLoading}
              loadingText="Convidando..."
            >
              Convidar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
