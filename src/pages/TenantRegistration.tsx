import React, { useState } from 'react'
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Grid,
  GridItem,
  useColorModeValue,
  Center,
  Spinner
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { createTenant } from '@/services/tenantService'
import { CreateTenantData } from '@/types/Tenant'
import { getAddressByCep } from '@/services/cepService'
import { formatCEP } from '@/utils/formatters'

/**
 * Tenant registration page component.
 *
 * Renders a gated company registration form for an authenticated user. The form collects basic company info (name, email, phone, optional CNPJ) and optional address fields (CEP, street, number, complement, neighborhood, city, state). CEP input triggers an automatic address lookup that can auto-fill address fields. The component validates required fields (including phone and CEP formats), shows inline field errors, and submits the collected data to the tenant creation service. On successful creation it navigates to "/app"; if the user is not authenticated it redirects to "/".
 *
 * Side effects:
 * - Uses authentication state to gate access and may redirect to the root path when unauthenticated.
 * - Calls an address lookup service when a valid 8-digit CEP is entered and populates address fields on success.
 * - Calls the tenant creation service on form submit and shows success or error toasts.
 *
 * @returns The rendered JSX element for the tenant registration page.
 */
export default function TenantRegistration() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const toast = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Estados do formulário
  const [formData, setFormData] = useState<CreateTenantData>({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    plan: 'free'
  })

  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")

  // Função para formatar telefone
  const formatPhone = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara baseada no número de dígitos
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }



  // Função para validar telefone
  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length >= 10 && numbers.length <= 11
  }

  // Função para validar CEP
  const validateCEP = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '')
    return numbers.length === 8
  }

  // Se ainda está carregando, mostrar spinner
  if (loading) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Carregando...</Text>
        </Box>
      </Center>
    )
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    navigate('/')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    // Aplicar máscaras específicas
    if (field === 'phone') {
      formattedValue = formatPhone(value)
    } else if (field === 'address.zipCode') {
      formattedValue = formatCEP(value)
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address!,
            [child]: formattedValue
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }))
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Buscar endereço automaticamente se for CEP
    if (field === 'address.zipCode') {
      handleCepSearch(formattedValue)
    }
  }

  const handleCepSearch = async (cep: string) => {
    // Remove caracteres não numéricos para validação
    const cleanCep = cep.replace(/\D/g, '')
    
    // Só busca se o CEP tiver 8 dígitos
    if (cleanCep.length === 8) {
      setIsLoadingCep(true)
      
      try {
        const response = await getAddressByCep(cleanCep)
        
        if (response.success && response.data) {
          const addressData = response.data
          
          // Preenche automaticamente os campos do endereço
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address!,
              street: addressData.street,
              complement: addressData.complement,
              neighborhood: addressData.neighborhood,
              city: addressData.city,
              state: addressData.state,
              zipCode: addressData.zipCode
            }
          }))
          
          // Limpa erros relacionados ao endereço
          setErrors(prev => ({
            ...prev,
            'address.street': '',
            'address.neighborhood': '',
            'address.city': '',
            'address.state': '',
            'address.zipCode': ''
          }))
          
          toast({
            title: 'Endereço encontrado',
            description: 'Os campos foram preenchidos automaticamente',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else if (!response.success) {
          toast({
            title: 'Erro ao buscar CEP',
            description: response.error.userMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      } catch (error) {
        toast({
          title: 'Erro ao buscar CEP',
          description: 'Ocorreu um erro inesperado. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos'
    }

    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
    }

    // Validar endereço se pelo menos um campo foi preenchido
    const hasAddressData = Object.values(formData.address || {}).some(value => value.trim())
    if (hasAddressData) {
      if (!formData.address?.street?.trim()) {
        newErrors['address.street'] = 'Rua é obrigatória'
      }
      if (!formData.address?.number?.trim()) {
        newErrors['address.number'] = 'Número é obrigatório'
      }
      if (!formData.address?.neighborhood?.trim()) {
        newErrors['address.neighborhood'] = 'Bairro é obrigatório'
      }
      if (!formData.address?.city?.trim()) {
        newErrors['address.city'] = 'Cidade é obrigatória'
      }
      if (!formData.address?.state?.trim()) {
        newErrors['address.state'] = 'Estado é obrigatório'
      }
      if (!formData.address?.zipCode?.trim()) {
        newErrors['address.zipCode'] = 'CEP é obrigatório'
      } else if (!validateCEP(formData.address.zipCode)) {
        newErrors['address.zipCode'] = 'CEP deve ter 8 dígitos'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await createTenant(formData, user.uid)
      
      if (response.success) {
        toast({
          title: 'Sucesso!',
          description: 'Sua empresa foi cadastrada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate('/app')
      } else {
        toast({
          title: 'Erro',
          description: response.error?.userMessage || 'Erro ao cadastrar empresa',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error)
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao cadastrar empresa',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <VStack spacing={8} maxW="2xl" mx="auto" px={4}>
        <Heading size="lg" textAlign="center">
          Cadastro da Empresa
        </Heading>
        
        <Text textAlign="center" color="gray.600">
          Olá {user?.email}! Para continuar, precisamos de algumas informações sobre sua empresa.
        </Text>

        <Box w="full" bg={cardBg} p={8} borderRadius="lg" shadow="md">
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {/* Informações Básicas */}
              <VStack spacing={4} w="full">
                <Heading size="md" w="full" textAlign="left">
                  Informações Básicas
                </Heading>
                
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome da sua empresa"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <GridItem>
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email *</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contato@empresa.com"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isInvalid={!!errors.phone}>
                      <FormLabel>Telefone *</FormLabel>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl isInvalid={!!errors.cnpj}>
                  <FormLabel>CNPJ (opcional)</FormLabel>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                  />
                  <FormErrorMessage>{errors.cnpj}</FormErrorMessage>
                </FormControl>
              </VStack>

              {/* Endereço */}
              <VStack spacing={4} w="full">
                <Heading size="md" w="full" textAlign="left">
                  Endereço (opcional)
                </Heading>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <GridItem colSpan={2}>
                    <FormControl isInvalid={!!errors['address.zipCode']}>
                      <FormLabel>CEP</FormLabel>
                      <Input
                        value={formData.address?.zipCode || ''}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {isLoadingCep && (
                        <FormHelperText>
                          <Spinner size="xs" mr={2} />
                          Buscando endereço...
                        </FormHelperText>
                      )}
                      <FormErrorMessage>{errors['address.zipCode']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem colSpan={2}>
                    <FormControl isInvalid={!!errors['address.street']}>
                      <FormLabel>Rua</FormLabel>
                      <Input
                        value={formData.address?.street || ''}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="Rua das Flores"
                      />
                      <FormErrorMessage>{errors['address.street']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isInvalid={!!errors['address.number']}>
                      <FormLabel>Número</FormLabel>
                      <Input
                        value={formData.address?.number || ''}
                        onChange={(e) => handleInputChange('address.number', e.target.value)}
                        placeholder="123"
                      />
                      <FormErrorMessage>{errors['address.number']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Complemento</FormLabel>
                      <Input
                        value={formData.address?.complement || ''}
                        onChange={(e) => handleInputChange('address.complement', e.target.value)}
                        placeholder="Sala 1"
                      />
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isInvalid={!!errors['address.neighborhood']}>
                      <FormLabel>Bairro</FormLabel>
                      <Input
                        value={formData.address?.neighborhood || ''}
                        onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                        placeholder="Centro"
                      />
                      <FormErrorMessage>{errors['address.neighborhood']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isInvalid={!!errors['address.city']}>
                      <FormLabel>Cidade</FormLabel>
                      <Input
                        value={formData.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="São Paulo"
                      />
                      <FormErrorMessage>{errors['address.city']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isInvalid={!!errors['address.state']}>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        value={formData.address?.state || ''}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="Selecione o estado"
                      >
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </Select>
                      <FormErrorMessage>{errors['address.state']}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>

              <Button 
                type="submit"
                colorScheme="blue" 
                w="full"
                size="lg"
                isLoading={isLoading}
                loadingText="Cadastrando..."
              >
                Cadastrar Empresa
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Box>
  )
} 