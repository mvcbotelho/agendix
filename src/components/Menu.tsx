import {
  Box,
  Flex,
  HStack,
  Button,
  useColorModeValue,
  useDisclosure,
  useColorMode,
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useToast,
  IconButton,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from './Logo'

interface MenuProps {
  children: React.ReactNode
}

export function Menu({ children }: MenuProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

  const bg = useColorModeValue('white', 'gray.800')
  const color = useColorModeValue('gray.600', 'gray.200')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.100', 'gray.700')

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        toast({
          title: 'Logout realizado',
          description: 'Você foi desconectado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate('/')
      } else {
        toast({
          title: 'Erro no logout',
          description: 'Ocorreu um erro ao fazer logout',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const menuItems = [
    { name: 'Dashboard', href: '/app' },
    { name: 'Clientes', href: '/app/clients' },
    { name: 'Agendamentos', href: '/app/appointments' },
  ]

  const adminMenuItems = [
    { name: 'Painel Admin', href: '/admin' },
    { name: 'Usuários', href: '/users' },
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box bg={bg} px={4} shadow="sm" borderBottom="1px" borderColor={borderColor}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack spacing={8} alignItems="center">
            <Box 
              cursor="pointer" 
              onClick={() => navigate('/app')}
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              <Logo size="sm" />
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  color={color}
                  _hover={{
                    bg: hoverBg,
                  }}
                >
                  {item.name}
                </Button>
              ))}
              {adminMenuItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  color={color}
                  _hover={{
                    bg: hoverBg,
                  }}
                  colorScheme="purple"
                >
                  {item.name}
                </Button>
              ))}
            </HStack>
          </HStack>

          <Flex alignItems="center">
            <Button
              variant="ghost"
              size="md"
              mr={4}
              onClick={toggleColorMode}
              color={color}
            >
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>

            <ChakraMenu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar size="sm" name={user?.displayName || user?.email || 'Usuário'} />
                <ChevronDownIcon />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate('/app')}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate('/app/clients')}>
                  Clientes
                </MenuItem>
                <MenuItem onClick={() => navigate('/app/appointments')}>
                  Agendamentos
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => navigate('/admin')}>
                  Painel Admin
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>
                  Sair
                </MenuItem>
              </MenuList>
            </ChakraMenu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <HStack as="nav" spacing={4}>
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.href)
                    onClose()
                  }}
                  color={color}
                  _hover={{
                    bg: hoverBg,
                  }}
                >
                  {item.name}
                </Button>
              ))}
              {adminMenuItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.href)
                    onClose()
                  }}
                  color={color}
                  _hover={{
                    bg: hoverBg,
                  }}
                  colorScheme="purple"
                >
                  {item.name}
                </Button>
              ))}
            </HStack>
          </Box>
        ) : null}
      </Box>

      <Box p={4}>
        {children}
      </Box>
    </Box>
  )
} 