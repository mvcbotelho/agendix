import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Button,
  useColorModeValue,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useMemo } from "react";
import { Client } from "@/types/Client";
import { ClientCard } from "./ClientCard";
import { getChildAgeGroups } from "@/utils/childAgeGroups";


interface ClientListProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onViewClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export function ClientList({
  clients,
  onAddClient,
  onEditClient,
  onViewClient,
  onDeleteClient,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialNeedsFilter, setSpecialNeedsFilter] = useState<
    "all" | "yes" | "no"
  >("all");
  const [childAgeFilter, setChildAgeFilter] = useState<string>("all");

  const cardBg = useColorModeValue("white", "gray.800");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  // Obter grupos de idade disponíveis
  const availableAgeGroups = useMemo(() => {
    return getChildAgeGroups(clients);
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);

      // Filtro de necessidades especiais
      const hasSpecialNeeds = client.children?.some(
        (child) => child.hasSpecialConditions
      );
      const matchesSpecialNeeds =
        specialNeedsFilter === "all" ||
        (specialNeedsFilter === "yes" && hasSpecialNeeds) ||
        (specialNeedsFilter === "no" && !hasSpecialNeeds);

      // Filtro de idade das crianças
      const hasChildrenInAgeGroup = client.children?.some((child) => {
        if (!child.birthDate) return false;
        const childAgeGroup = getChildAgeGroups([
          { children: [child] } as Client,
        ])[0];
        return childAgeGroup === childAgeFilter;
      });
      const matchesChildAge = childAgeFilter === "all" || hasChildrenInAgeGroup;

      return matchesSearch && matchesSpecialNeeds && matchesChildAge;
    });
  }, [clients, searchTerm, specialNeedsFilter, childAgeFilter]);

  return (
    <VStack spacing={6} align="stretch" px={{ base: 0, md: 0 }}>
      {/* Controles de Filtro e Busca */}
              <VStack spacing={3} align="stretch">
          
          <VStack spacing={4} align="stretch">
            {/* Layout Desktop: Tudo na mesma linha */}
            <HStack
              spacing={4}
              justify="space-between"
              align="center"
              wrap="wrap"
              display={{ base: "none", md: "flex" }}
            >
              <HStack spacing={4} flex={1} minW="300px">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="blue.500" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderColor="blue.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ 
                      borderColor: "blue.500", 
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                      bg: "blue.50",
                    }}
                    bg={searchTerm ? "blue.50" : "white"}
                    fontWeight="medium"
                    pr={searchTerm ? "40px" : "12px"}
                  />
                  {searchTerm && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Limpar busca"
                        icon={<CloseIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={() => setSearchTerm("")}
                        _hover={{ bg: "gray.100" }}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
                
                <Select
                  value={specialNeedsFilter}
                  onChange={(e) =>
                    setSpecialNeedsFilter(e.target.value as "all" | "yes" | "no")
                  }
                  maxW="200px"
                  size="md"
                >
                  <option value="all">Observações</option>
                  <option value="yes">Atenção Especial</option>
                  <option value="no">Atendimento Padrão</option>
                </Select>

                <Select
                  value={childAgeFilter}
                  onChange={(e) => setChildAgeFilter(e.target.value)}
                  maxW="200px"
                  size="md"
                >
                  <option value="all">Idade Crianças</option>
                  {availableAgeGroups.map((ageGroup) => (
                    <option key={ageGroup} value={ageGroup}>
                      {ageGroup}
                    </option>
                  ))}
                </Select>
              </HStack>
              
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={onAddClient}
                size="md"
              >
                Novo Cliente
              </Button>
            </HStack>
            
            {/* Layout Mobile: Input e botão na primeira linha, filtros na segunda */}
            <VStack spacing={8} align="stretch" display={{ base: "block", md: "none" }}>
              <HStack
                spacing={4}
                justify="space-between"
                align="center"
                wrap="wrap"
              >
                <HStack spacing={4} flex={1} minW="auto">
                  <InputGroup maxW="100%">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="blue.500" />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      borderColor="blue.200"
                      _hover={{ borderColor: "blue.300" }}
                      _focus={{ 
                        borderColor: "blue.500", 
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        bg: "blue.50",
                      }}
                      bg={searchTerm ? "blue.50" : "white"}
                      fontWeight="medium"
                      pr={searchTerm ? "40px" : "12px"}
                    />
                    {searchTerm && (
                      <InputRightElement>
                        <IconButton
                          aria-label="Limpar busca"
                          icon={<CloseIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={() => setSearchTerm("")}
                          _hover={{ bg: "gray.100" }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </HStack>
                
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onAddClient}
                  size="sm"
                >
                  Novo Cliente
                </Button>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                  Filtros
                </Text>
                <HStack spacing={3} wrap="wrap">
                  <Select
                    value={specialNeedsFilter}
                    onChange={(e) =>
                      setSpecialNeedsFilter(e.target.value as "all" | "yes" | "no")
                    }
                    maxW="100%"
                    size="sm"
                  >
                    <option value="all">Observações</option>
                    <option value="yes">Atenção Especial</option>
                    <option value="no">Atendimento Padrão</option>
                  </Select>

                <Select
                  value={childAgeFilter}
                  onChange={(e) => setChildAgeFilter(e.target.value)}
                  maxW="100%"
                  size="sm"
                >
                  <option value="all">Idade Crianças</option>
                  {availableAgeGroups.map((ageGroup) => (
                    <option key={ageGroup} value={ageGroup}>
                      {ageGroup}
                    </option>
                  ))}
                </Select>
              </HStack>
            </VStack>
            </VStack>
          </VStack>
        </VStack>

      {/* Lista de Clientes */}
      {filteredClients.length === 0 ? (
        <Box
          bg={cardBg}
          p={8}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          textAlign="center"
        >
          <Text color={mutedColor} fontSize="lg">
            {searchTerm ||
            specialNeedsFilter !== "all" ||
            childAgeFilter !== "all"
              ? "Nenhum cliente encontrado com os filtros aplicados."
              : "Nenhum cliente cadastrado ainda."}
          </Text>
          {!searchTerm &&
            specialNeedsFilter === "all" &&
            childAgeFilter === "all" && (
              <Button
                mt={4}
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={onAddClient}
              >
                Cadastrar Primeiro Cliente
              </Button>
            )}
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={{ base: 3, md: 4 }}
        >
          {filteredClients.map((client) => (
            <GridItem key={client.id}>
              <ClientCard
                client={client}
                onEdit={onEditClient}
                onView={onViewClient}
                onDelete={onDeleteClient}
              />
            </GridItem>
          ))}
        </Grid>
      )}
    </VStack>
  );
}
