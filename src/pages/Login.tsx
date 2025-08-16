import { useState } from "react"
import {
  Box,
  Button,
  Container,
  VStack,
  Text,
  useToast,
  Divider,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"
import { LogoXLarge } from "@/components/Logo"
/**
 * Renders the login page UI and manages authentication flows (email/password and Google).
 *
 * The component maintains local form state, field-level errors, and a loading flag. On submit it validates the form (note: the schema-based validation is currently disabled), calls the authentication functions from the auth context, displays success/error toasts, and navigates to "/app" on successful sign-in. Errors returned by the auth calls are shown in toasts; unexpected exceptions render a generic error toast. Loading state is managed and reset for both authentication flows.
 *
 * @returns The login page React element.
 */


export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const toast = useToast()
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuthContext()
  
  const bgColor = useColorModeValue("blue.50", "blue.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")

  const validateForm = () => {
    try {
      // loginSchema.parse({ email, password })
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
      const result = await login(email, password)
      
      if (result.success) {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao Agendix",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        navigate("/app")
      } else {
        toast({
          title: "Erro no login",
          description: typeof result.error === 'string' ? result.error : "Credenciais inválidas",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    
    try {
      const result = await loginWithGoogle()
      
      if (result.success) {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao Agendix",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        navigate("/app")
      } else {
        toast({
          title: "Erro no login",
          description: typeof result.error === 'string' ? result.error : "Erro ao fazer login com Google",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login com Google. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
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
        <VStack spacing={8}>
          {/* Logo */}
          <LogoXLarge />

          {/* Card de Login */}
          <Box
            w="full"
            bg={cardBg}
            borderRadius="xl"
            p={8}
            boxShadow="xl"
            border="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <VStack spacing={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  Bem-vindo de volta
                </Text>
                <Text color={mutedColor} textAlign="center">
                  Faça login para acessar sua conta
                </Text>
              </VStack>

              {/* Formulário */}
              <Box as="form" onSubmit={handleSubmit} w="full">
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.email} isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                    />
                    {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                  </FormControl>

                  <FormControl isInvalid={!!errors.password} isRequired>
                    <FormLabel>Senha</FormLabel>
                    <Input
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                    />
                    {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Entrando..."
                  >
                    Entrar
                  </Button>
                </VStack>
              </Box>

              <Divider />

              {/* Login com Google */}
              <Button
                variant="outline"
                size="lg"
                w="full"
                onClick={handleGoogleLogin}
                isLoading={isLoading}
                loadingText="Entrando..."
                leftIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              >
                Continuar com Google
              </Button>

              {/* Links */}
              <VStack spacing={2}>
                <Button
                  variant="link"
                  color={mutedColor}
                  onClick={() => navigate("/forgot-password")}
                  size="sm"
                >
                  Esqueceu sua senha?
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Footer */}
          <Text fontSize="sm" color={mutedColor} textAlign="center">
            © 2025 Agendix. Todos os direitos reservados.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
