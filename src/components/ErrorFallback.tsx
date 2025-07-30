import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Code,
  Collapse,
  HStack,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from '@chakra-ui/icons'
import { AppError, ErrorType, ErrorSeverity } from '@/types/Error'

interface ErrorFallbackProps {
  error: AppError | null
  showDetails: boolean
  onRetry: () => void
  onToggleDetails: () => void
}

export function ErrorFallback({ error, showDetails, onRetry, onToggleDetails }: ErrorFallbackProps) {
  const bgColor = useColorModeValue('red.50', 'red.900')
  const borderColor = useColorModeValue('red.200', 'red.700')
  const textColor = useColorModeValue('red.800', 'red.100')

  if (!error) {
    return (
      <Box p={8} textAlign="center">
        <Text>Ocorreu um erro inesperado.</Text>
        <Button mt={4} onClick={onRetry}>
          Tentar Novamente
        </Button>
      </Box>
    )
  }

  const getSeverityColor = (severity: ErrorSeverity): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warning'
      case ErrorSeverity.LOW:
      default:
        return 'info'
    }
  }

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return '🔐'
      case ErrorType.NETWORK:
        return '🌐'
      case ErrorType.VALIDATION:
        return '📝'
      case ErrorType.INTERNAL:
        return '⚙️'
      default:
        return '❌'
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
      <Box
        maxW="600px"
        w="full"
        bg="white"
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        p={8}
        boxShadow="lg"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={3} align="center">
            <Text fontSize="4xl">{getErrorIcon(error.type)}</Text>
            <Heading size="lg" color={textColor}>
              Ops! Algo deu errado
            </Heading>
            <Text textAlign="center" color="gray.600">
              {error.userMessage}
            </Text>
          </VStack>

          {/* Error Info */}
          <Alert status={getSeverityColor(error.severity)} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>
                Erro {error.type} - {error.severity}
              </AlertTitle>
              <AlertDescription>
                ID: {error.id} • {error.timestamp.toLocaleString()}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Context Info */}
          {error.context && (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Contexto do Erro:
              </Text>
              <VStack spacing={1} align="start" fontSize="xs">
                {error.context.component && (
                  <Text>Componente: {error.context.component}</Text>
                )}
                {error.context.action && (
                  <Text>Ação: {error.context.action}</Text>
                )}
                {error.context.url && (
                  <Text>URL: {error.context.url}</Text>
                )}
              </VStack>
            </Box>
          )}

          {/* Details Toggle */}
          <HStack justify="space-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
            >
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
            </Button>
          </HStack>

          {/* Error Details */}
          <Collapse in={showDetails} animateOpacity>
            <Box p={4} bg="gray.100" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Detalhes Técnicos:
              </Text>
              <Code p={3} borderRadius="md" fontSize="xs" display="block" whiteSpace="pre-wrap">
                {error.message}
                {error.details && `\n\nDetalhes: ${JSON.stringify(error.details, null, 2)}`}
              </Code>
            </Box>
          </Collapse>

          {/* Actions */}
          <VStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              colorScheme="blue"
              onClick={onRetry}
              size="lg"
              w="full"
            >
              Tentar Novamente
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              size="md"
              w="full"
            >
              Voltar ao Início
            </Button>
          </VStack>

          {/* Help Text */}
          <Text fontSize="xs" textAlign="center" color="gray.500">
            Se o problema persistir, entre em contato com o suporte.
          </Text>
        </VStack>
      </Box>
    </Box>
  )
} 