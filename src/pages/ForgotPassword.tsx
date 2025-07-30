import { useState } from "react"
import {
  Box,
  Button,
  Container,
  VStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  Divider,
  HStack,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react"
import { ArrowBackIcon, EmailIcon } from "@chakra-ui/icons"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"
import { resetPasswordSchema } from "@/types/validation"


export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const toast = useToast()
  const navigate = useNavigate()
  const { resetPassword } = useAuthContext()
  
  const bgColor = useColorModeValue("blue.50", "blue.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.100", "gray.600")

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({ email })
      setErrors({})
      return true
    } catch (error) {
      const newErrors: Record<string, string> = {}
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[], message: string }> }
        zodError.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message
          }
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await resetPassword(email)
      
      if (result.success) {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        setIsSubmitted(true)
      } else {
        toast({
          title: "Erro ao enviar email",
          description: typeof result.error === 'string' ? result.error : "Erro desconhecido",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar o email de recuperação. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/")
  }

  const handleResendEmail = () => {
    setIsSubmitted(false)
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <Box
          bg={cardBg}
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <HStack mb={4}>
                <IconButton
                  aria-label="Voltar ao login"
                  icon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={handleBackToLogin}
                  color={mutedColor}
                  _hover={{
                    bg: hoverBg,
                  }}
                />
                <Heading size="lg" color={textColor} fontWeight="extrabold">
                  Esqueceu sua senha?
                </Heading>
              </HStack>
              <Text color={mutedColor} fontSize="sm">
                Digite seu email e enviaremos um link para redefinir sua senha
              </Text>
            </Box>

            <Divider />

            {/* Formulário */}
            {!isSubmitted ? (
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.email} isRequired>
                    <FormLabel>E-mail</FormLabel>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                    />
                    {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Enviando..."
                  >
                    Enviar link de recuperação
                  </Button>
                </VStack>
              </Box>
            ) : (
              /* Tela de sucesso */
              <VStack spacing={6} align="stretch">
                <Box textAlign="center" py={4}>
                  <Box
                    w={16}
                    h={16}
                    bg="green.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <EmailIcon w={8} h={8} color="green.500" />
                  </Box>
                  <Heading size="md" color={textColor} mb={2}>
                    Email enviado!
                  </Heading>
                  <Text color={mutedColor} fontSize="sm">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </Text>
                </Box>

                <VStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    onClick={handleResendEmail}
                    variant="outline"
                  >
                    Enviar novamente
                  </Button>
                  <Button
                    colorScheme="gray"
                    size="lg"
                    w="full"
                    onClick={handleBackToLogin}
                    variant="ghost"
                  >
                    Voltar ao login
                  </Button>
                </VStack>
              </VStack>
            )}

            {/* Footer */}
            <Divider />
            
            <Box textAlign="center">
              <Text fontSize="xs" color={mutedColor}>
                © 2025 Agendix. Todos os direitos reservados.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
} 