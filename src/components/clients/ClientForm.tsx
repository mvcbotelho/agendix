import {
  Box,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Collapse,
  IconButton,
  Text,
  Grid,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  useToast
} from '@chakra-ui/react'
import { AddIcon, MinusIcon, EditIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { Client, CreateClientData, UpdateClientData } from '@/types/Client'
import { calculateAge } from '@/utils/ageCalculator'
import { formatPhone, unformatPhone } from '@/utils/formatters'

interface ClientFormProps {
  client?: Client
  onSubmit: (data: CreateClientData | UpdateClientData) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  birthDate?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  notes?: string
}

export function ClientForm({ client, onSubmit, onCancel, isLoading = false }: ClientFormProps) {
  const [showAddress, setShowAddress] = useState(!!client?.address)
  const [showChildren, setShowChildren] = useState(!!client?.hasChildren)
  const [children, setChildren] = useState(client?.children || [])
  const [newChild, setNewChild] = useState({ name: '', birthDate: '', hasSpecialConditions: false, specialConditions: '' })
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null)
  const [editingChild, setEditingChild] = useState({ name: '', birthDate: '', hasSpecialConditions: false, specialConditions: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    cpf: client?.cpf || '',
    birthDate: client?.birthDate || '',
    address: client?.address ? {
      street: client.address.street || '',
      number: client.address.number || '',
      complement: client.address.complement || '',
      neighborhood: client.address.neighborhood || '',
      city: client.address.city || '',
      state: client.address.state || '',
      zipCode: client.address.zipCode || ''
    } : {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: client?.notes || ''
  })
  
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const toast = useToast()

  // Funções para formatar campos durante a digitação
  const handlePhoneChange = (value: string) => {
    return formatPhone(value)
  }

  const handleCPFChange = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara do CPF: 000.000.000-00
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }
  }

  const unformatCPF = (value: string) => {
    return value.replace(/\D/g, '')
  }

  const validateCPF = (cpf: string): boolean => {
    const numbers = unformatCPF(cpf)
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Calcula os dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[9])) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers[10])) return false
    
    return true
  }

  const handleBirthDateChange = (value: string) => {
    // Se não há valor, retorna vazio
    if (!value) return ''
    
    // Verifica se o ano tem mais de 4 dígitos
    const parts = value.split('-')
    if (parts.length === 3 && parts[0].length > 4) {
      // Limita o ano a 4 dígitos
      parts[0] = parts[0].slice(0, 4)
      return parts.join('-')
    }
    
    return value
  }

  // Funções de validação específicas para cada campo
  const validateName = (): string | undefined => {
    if (!formData.name.trim()) {
      return 'Nome é obrigatório'
    } else if (formData.name.length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres'
    }
    return undefined
  }

  const validateEmail = (): string | undefined => {
    if (!formData.email.trim()) {
      return 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Email inválido'
    }
    return undefined
  }

  const validatePhone = (): string | undefined => {
    if (!formData.phone.trim()) {
      return 'Telefone é obrigatório'
    } else if (unformatPhone(formData.phone).length < 10) {
      return 'Telefone deve ter pelo menos 10 dígitos'
    }
    return undefined
  }

  const validateCPFField = (): string | undefined => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      return 'CPF inválido'
    }
    return undefined
  }

  const validateBirthDate = (): string | undefined => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      // Verifica se a data é válida
      if (isNaN(birthDate.getTime())) {
        return 'Data de nascimento inválida'
      }
      // Verifica se não é uma data futura
      else if (birthDate > today) {
        return 'Data de nascimento não pode ser no futuro'
      }
      // Verifica se a idade está em um intervalo razoável (0-120 anos)
      else if (age < 0 || age > 120) {
        return 'Idade deve estar entre 0 e 120 anos'
      }
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validação do nome
    const nameError = validateName()
    if (nameError) newErrors.name = nameError

    // Validação do email
    const emailError = validateEmail()
    if (emailError) newErrors.email = emailError

    // Validação do telefone
    const phoneError = validatePhone()
    if (phoneError) newErrors.phone = phoneError

    // Validação do CPF (se preenchido)
    const cpfError = validateCPFField()
    if (cpfError) newErrors.cpf = cpfError

    // Validação da data de nascimento (se preenchida)
    const birthDateError = validateBirthDate()
    if (birthDateError) newErrors.birthDate = birthDateError

    // Validação do endereço (se preenchido)
    if (showAddress) {
      const addressErrors: {
        street?: string
        number?: string
        complement?: string
        neighborhood?: string
        city?: string
        state?: string
        zipCode?: string
      } = {}
      
      if (!formData.address.street.trim()) {
        addressErrors.street = 'Rua é obrigatória'
      }
      if (!formData.address.number.trim()) {
        addressErrors.number = 'Número é obrigatório'
      }
      if (!formData.address.neighborhood.trim()) {
        addressErrors.neighborhood = 'Bairro é obrigatório'
      }
      if (!formData.address.city.trim()) {
        addressErrors.city = 'Cidade é obrigatória'
      }
      if (!formData.address.state.trim()) {
        addressErrors.state = 'Estado é obrigatório'
      } else if (formData.address.state.length !== 2) {
        addressErrors.state = 'Estado deve ter 2 caracteres'
      }
      if (!formData.address.zipCode.trim()) {
        addressErrors.zipCode = 'CEP é obrigatório'
      } else if (!/^\d{5}-?\d{3}$/.test(formData.address.zipCode)) {
        addressErrors.zipCode = 'CEP deve estar no formato 00000-000'
      }
      
      if (Object.keys(addressErrors).length > 0) {
        newErrors.address = addressErrors
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async () => {
    console.log('🔍 ClientForm - handleFormSubmit chamado')
    
    if (!validateForm()) {
      console.log('❌ ClientForm - validação falhou')
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os erros no formulário',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: unformatPhone(formData.phone),
        cpf: formData.cpf ? unformatCPF(formData.cpf) : undefined,
        birthDate: formData.birthDate || undefined,
        hasChildren: showChildren,
        children: showChildren ? children : undefined,
        address: showAddress ? {
          street: formData.address.street.trim(),
          number: formData.address.number.trim(),
          complement: formData.address.complement || undefined,
          neighborhood: formData.address.neighborhood.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim().toUpperCase(),
          zipCode: formData.address.zipCode.trim()
        } : undefined,
        notes: formData.notes.trim() || undefined
      }

      console.log('🔍 ClientForm - dados limpos:', cleanedData)
      console.log('🔍 ClientForm - client existe?', !!client)
      
      if (client) {
        console.log('🔍 ClientForm - atualizando cliente existente')
        await onSubmit(cleanedData as UpdateClientData)
        console.log('✅ ClientForm - cliente atualizado com sucesso')
      } else {
        console.log('🔍 ClientForm - criando novo cliente')
        await onSubmit(cleanedData as CreateClientData)
        console.log('✅ ClientForm - cliente criado com sucesso')
      }
    } catch (error) {
      console.error('❌ ClientForm - Erro ao salvar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cliente. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleAddChild = () => {
    if (newChild.name.trim() && newChild.birthDate) {
      // Valida a data de nascimento do filho
      const birthDate = new Date(newChild.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      // Verifica se a data é válida e está no intervalo razoável
      if (isNaN(birthDate.getTime()) || birthDate > today || age < 0 || age > 120) {
        toast({
          title: 'Data inválida',
          description: 'A data de nascimento do filho deve ser válida e estar entre 0 e 120 anos',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      setChildren([...children, { ...newChild, name: newChild.name.trim() }])
      setNewChild({ name: '', birthDate: '', hasSpecialConditions: false, specialConditions: '' })
    }
  }

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const handleEditChild = (index: number) => {
    const child = children[index]
    setEditingChildIndex(index)
    setEditingChild({
      name: child.name,
      birthDate: child.birthDate,
      hasSpecialConditions: child.hasSpecialConditions || false,
      specialConditions: child.specialConditions || ''
    })
  }

  const handleSaveChildEdit = () => {
    if (editingChild.name.trim() && editingChild.birthDate && editingChildIndex !== null) {
      // Valida a data de nascimento do filho
      const birthDate = new Date(editingChild.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      // Verifica se a data é válida e está no intervalo razoável
      if (isNaN(birthDate.getTime()) || birthDate > today || age < 0 || age > 120) {
        toast({
          title: 'Data inválida',
          description: 'A data de nascimento do filho deve ser válida e estar entre 0 e 120 anos',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      const updatedChildren = [...children]
      updatedChildren[editingChildIndex] = { ...editingChild, name: editingChild.name.trim() }
      setChildren(updatedChildren)
      setEditingChildIndex(null)
      setEditingChild({ name: '', birthDate: '', hasSpecialConditions: false, specialConditions: '' })
    }
  }

  const handleCancelChildEdit = () => {
    setEditingChildIndex(null)
    setEditingChild({ name: '', birthDate: '', hasSpecialConditions: false, specialConditions: '' })
  }

  const handleChildKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChild()
    }
  }

  const updateFormData = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {/* Informações Básicas */}
        <Box>
          <Text fontSize="md" fontWeight="medium" color={textColor} mb={4}>
            Informações Básicas
          </Text>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nome Completo</FormLabel>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                onBlur={() => {
                  const error = validateName()
                  setErrors(prev => ({ ...prev, name: error }))
                }}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                onBlur={() => {
                  const error = validateEmail()
                  setErrors(prev => ({ ...prev, email: error }))
                }}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Telefone</FormLabel>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', handlePhoneChange(e.target.value))}
                  onBlur={() => {
                    const error = validatePhone()
                    setErrors(prev => ({ ...prev, phone: error }))
                  }}
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.cpf}>
                <FormLabel>CPF</FormLabel>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => updateFormData('cpf', handleCPFChange(e.target.value))}
                  onBlur={() => {
                    const error = validateCPFField()
                    setErrors(prev => ({ ...prev, cpf: error }))
                  }}
                  maxLength={14}
                />
                <FormErrorMessage>{errors.cpf}</FormErrorMessage>
              </FormControl>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <FormControl isInvalid={!!errors.birthDate}>
                <FormLabel>Data de Nascimento</FormLabel>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData('birthDate', handleBirthDateChange(e.target.value))}
                  onBlur={() => {
                    const error = validateBirthDate()
                    setErrors(prev => ({ ...prev, birthDate: error }))
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                />
                <FormErrorMessage>{errors.birthDate}</FormErrorMessage>
                <FormHelperText>
                  Idade: {formData.birthDate ? calculateAge(formData.birthDate) : ''}
                </FormHelperText>
              </FormControl>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                  Possui Filhos
                </Text>
                <Checkbox
                  isChecked={showChildren}
                  onChange={(e) => setShowChildren(e.target.checked)}
                  colorScheme="blue"
                >
                  Sim, possui filhos
                </Checkbox>
              </Box>
            </Grid>
          </VStack>
        </Box>

        {/* Filhos */}
        {showChildren && (
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <Text fontSize="md" fontWeight="medium" color={textColor}>
                Filhos
              </Text>
              <IconButton
                aria-label={showChildren ? "Ocultar filhos" : "Mostrar filhos"}
                icon={showChildren ? <MinusIcon /> : <AddIcon />}
                size="sm"
                variant="ghost"
                onClick={() => setShowChildren(!showChildren)}
              />
            </HStack>
            
            <Collapse in={showChildren} animateOpacity>
              <VStack spacing={4} align="stretch">
                {/* Lista de filhos existentes */}
                {children.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                      Filhos Cadastrados
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {children.map((child, index) => (
                        <Box key={index} p={3} border="1px" borderColor={borderColor} borderRadius="md">
                          {editingChildIndex === index ? (
                            // Modo de edição
                            <VStack spacing={3} align="stretch">
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                Editando: {child.name}
                              </Text>
                              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                                <Input
                                  placeholder="Nome do filho"
                                  value={editingChild.name}
                                  onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                                />
                                <Input
                                  type="date"
                                  value={editingChild.birthDate}
                                  onChange={(e) => setEditingChild({ ...editingChild, birthDate: handleBirthDateChange(e.target.value) })}
                                  max={new Date().toISOString().split('T')[0]}
                                  min="1900-01-01"
                                />
                              </Grid>
                              
                              {editingChild.birthDate && (
                                <Text fontSize="xs" color={mutedColor}>
                                  Idade: {calculateAge(editingChild.birthDate)}
                                </Text>
                              )}
                              
                              <Checkbox
                                isChecked={editingChild.hasSpecialConditions}
                                onChange={(e) => setEditingChild({ ...editingChild, hasSpecialConditions: e.target.checked })}
                                colorScheme="blue"
                              >
                                Possui condições especiais
                              </Checkbox>
                              
                              {editingChild.hasSpecialConditions && (
                                <Input
                                  placeholder="Descreva as condições especiais"
                                  value={editingChild.specialConditions}
                                  onChange={(e) => setEditingChild({ ...editingChild, specialConditions: e.target.value })}
                                />
                              )}
                              
                              <HStack justify="flex-end" spacing={2}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelChildEdit}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveChildEdit}
                                  isDisabled={!editingChild.name.trim() || !editingChild.birthDate}
                                  colorScheme="blue"
                                >
                                  Salvar
                                </Button>
                              </HStack>
                            </VStack>
                          ) : (
                            // Modo de visualização
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium">{child.name}</Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Nascimento: {child.birthDate}
                                  {child.hasSpecialConditions && ' (Condições especiais)'}
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                  Idade: {calculateAge(child.birthDate)}
                                </Text>
                              </VStack>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Editar filho"
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditChild(index)}
                                />
                                <IconButton
                                  aria-label="Remover filho"
                                  icon={<MinusIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveChild(index)}
                                />
                              </HStack>
                            </HStack>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Adicionar novo filho */}
                <Box p={3} border="1px" borderColor={borderColor} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={3}>
                    Adicionar Filho
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                      <Input
                        placeholder="Nome do filho"
                        value={newChild.name}
                        onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                        onKeyPress={handleChildKeyPress}
                      />
                      <Input
                        type="date"
                        value={newChild.birthDate}
                        onChange={(e) => setNewChild({ ...newChild, birthDate: handleBirthDateChange(e.target.value) })}
                        onKeyPress={handleChildKeyPress}
                        max={new Date().toISOString().split('T')[0]}
                        min="1900-01-01"
                      />
                    </Grid>
                    
                    {newChild.birthDate && (
                      <Text fontSize="xs" color={mutedColor}>
                        Idade: {calculateAge(newChild.birthDate)}
                      </Text>
                    )}
                    
                    <Checkbox
                      isChecked={newChild.hasSpecialConditions}
                      onChange={(e) => setNewChild({ ...newChild, hasSpecialConditions: e.target.checked })}
                      colorScheme="blue"
                    >
                      Possui condições especiais
                    </Checkbox>
                    
                    {newChild.hasSpecialConditions && (
                      <Input
                        placeholder="Descreva as condições especiais"
                        value={newChild.specialConditions}
                        onChange={(e) => setNewChild({ ...newChild, specialConditions: e.target.value })}
                        onKeyPress={handleChildKeyPress}
                      />
                    )}
                    
                    <Button
                      size="sm"
                      onClick={handleAddChild}
                      isDisabled={!newChild.name.trim() || !newChild.birthDate}
                      leftIcon={<AddIcon />}
                    >
                      Adicionar Filho
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Collapse>
          </Box>
        )}

        {/* Endereço */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontSize="md" fontWeight="medium" color={textColor}>
              Endereço
            </Text>
            <IconButton
              aria-label={showAddress ? "Ocultar endereço" : "Mostrar endereço"}
              icon={showAddress ? <MinusIcon /> : <AddIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setShowAddress(!showAddress)}
            />
          </HStack>
          
          <Collapse in={showAddress} animateOpacity>
            <VStack spacing={4} align="stretch">
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                <FormControl isInvalid={!!errors.address?.street}>
                  <FormLabel>Rua</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.street}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.address?.number}>
                  <FormLabel>Número</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.number}
                    onChange={(e) => updateFormData('address.number', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.number}</FormErrorMessage>
                </FormControl>
              </Grid>

              <FormControl isInvalid={!!errors.address?.complement}>
                <FormLabel>Complemento</FormLabel>
                <Input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) => updateFormData('address.complement', e.target.value)}
                  onBlur={() => validateForm()}
                />
                <FormErrorMessage>{errors.address?.complement}</FormErrorMessage>
              </FormControl>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                <FormControl isInvalid={!!errors.address?.neighborhood}>
                  <FormLabel>Bairro</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.neighborhood}
                    onChange={(e) => updateFormData('address.neighborhood', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.neighborhood}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.address?.city}>
                  <FormLabel>Cidade</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.city}</FormErrorMessage>
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                <FormControl isInvalid={!!errors.address?.state}>
                  <FormLabel>Estado</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => updateFormData('address.state', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.state}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.address?.zipCode}>
                  <FormLabel>CEP</FormLabel>
                  <Input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                    onBlur={() => validateForm()}
                  />
                  <FormErrorMessage>{errors.address?.zipCode}</FormErrorMessage>
                </FormControl>
              </Grid>
            </VStack>
          </Collapse>
        </Box>

        {/* Observações */}
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Observações</FormLabel>
          <Textarea
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            onBlur={() => validateForm()}
            rows={3}
          />
          <FormErrorMessage>{errors.notes}</FormErrorMessage>
        </FormControl>

        <HStack justify="flex-end" spacing={4}>
          <Button variant="outline" onClick={onCancel} isDisabled={isLoading}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleFormSubmit}
            isLoading={isLoading}
            isDisabled={isLoading || Object.keys(errors).length > 0}
          >
            {client ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
} 