import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Client, CreateClientData, UpdateClientData } from '@/types/Client'
import { 
  createNotFoundError, 
  createInternalError,
  createValidationError,
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  AppError
} from '@/types/Error'

const COLLECTION_NAME = 'clients'

// Converter dados do Firestore para Client
function firestoreToClient(doc: DocumentSnapshot<DocumentData>): Client {
  const data = doc.data()
  if (!data) {
    throw new Error('Documento não possui dados')
  }
  
  return {
    id: doc.id,
    tenantId: (data.tenantId as string) || '',
    name: data.name,
    email: data.email,
    phone: data.phone,
    cpf: (data.cpf as string) || undefined,
    birthDate: (data.birthDate as string) || undefined,
    hasChildren: (data.hasChildren as boolean) || false,
    children: (data.children as Client['children']) || [],
    address: (data.address as Client['address']) || undefined,
    notes: (data.notes as string) || undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate?.()?.toISOString() || (data.createdAt as string) || new Date().toISOString(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.()?.toISOString() || (data.updatedAt as string) || new Date().toISOString(),
  }
}

// Converter Client para dados do Firestore
function clientToFirestore(client: CreateClientData | UpdateClientData, userId?: string, tenantId?: string): Record<string, unknown> {
  const data: Record<string, unknown> = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    updatedAt: serverTimestamp(),
  }

  // Adicionar userId e tenantId se fornecidos (apenas para criação)
  if (userId) {
    data.userId = userId
  }
  
  if (tenantId) {
    data.tenantId = tenantId
  }

  if (client.cpf !== undefined) data.cpf = client.cpf
  if (client.birthDate !== undefined) data.birthDate = client.birthDate
  if (client.hasChildren !== undefined) data.hasChildren = client.hasChildren
  if (client.children !== undefined) data.children = client.children
  if (client.address !== undefined) data.address = client.address
  if (client.notes !== undefined) data.notes = client.notes

  return data
}

// Validar dados do cliente
function validateClientData(data: CreateClientData | UpdateClientData): void {
  if (data.name && data.name.trim().length < 2) {
    throw createValidationError('Nome deve ter pelo menos 2 caracteres', 'name')
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw createValidationError('Email inválido', 'email')
  }

  if (data.phone && data.phone.replace(/\D/g, '').length < 10) {
    throw createValidationError('Telefone inválido', 'phone')
  }

  if (data.cpf && data.cpf.replace(/\D/g, '').length !== 11) {
    throw createValidationError('CPF inválido', 'cpf')
  }
}

// Buscar todos os clientes
export async function getClients(userId?: string, tenantId?: string): Promise<ApiResponse<Client[]>> {
  try {
    let q
    
    if (userId && tenantId) {
      // Buscar apenas clientes do usuário e tenant específicos
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('tenantId', '==', tenantId)
      )
    } else if (userId) {
      // Buscar apenas clientes do usuário específico
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      )
    } else if (tenantId) {
      // Buscar apenas clientes do tenant específico
      q = query(
        collection(db, COLLECTION_NAME),
        where('tenantId', '==', tenantId)
      )
    } else {
      // Buscar todos os clientes (sem filtro)
      q = query(
        collection(db, COLLECTION_NAME)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const clients = querySnapshot.docs.map(firestoreToClient)
    
    // Ordenar no lado do cliente por data de criação (mais recente primeiro)
    const sortedClients = clients.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    
    return {
      success: true,
      data: sortedClients
    } as SuccessResponse<Client[]>
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    
    const appError = createInternalError(
      'Falha ao carregar clientes',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
}

// Buscar cliente por ID
export async function getClient(id: string): Promise<ApiResponse<Client>> {
  try {
    if (!id || id.trim().length === 0) {
      throw createValidationError('ID do cliente é obrigatório', 'id')
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const client = firestoreToClient(docSnap)
      return {
        success: true,
        data: client
      } as SuccessResponse<Client>
    }
    
    const notFoundError = createNotFoundError('Cliente')
    return {
      success: false,
      error: notFoundError
    } as ErrorResponse
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    
    if (error && typeof error === 'object' && 'type' in error) {
      return {
        success: false,
        error: error as AppError
      } as ErrorResponse
    }
    
    const appError = createInternalError(
      'Falha ao carregar cliente',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
}

// Criar novo cliente
export async function createClient(clientData: CreateClientData, userId?: string, tenantId?: string): Promise<ApiResponse<Client>> {
  try {
    // Validar dados
    validateClientData(clientData)
    
    const data = {
      ...clientToFirestore(clientData, userId, tenantId),
      createdAt: serverTimestamp(),
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data)
    
    // Buscar o documento criado para retornar com ID
    const createdDoc = await getDoc(docRef)
    const client = firestoreToClient(createdDoc)
    
    return {
      success: true,
      data: client
    } as SuccessResponse<Client>
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    
    if (error && typeof error === 'object' && 'type' in error) {
      return {
        success: false,
        error: error as AppError
      } as ErrorResponse
    }
    
    const appError = createInternalError(
      'Falha ao criar cliente',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
}

// Atualizar cliente
export async function updateClient(id: string, clientData: UpdateClientData): Promise<ApiResponse<Client>> {
  try {
    if (!id || id.trim().length === 0) {
      throw createValidationError('ID do cliente é obrigatório', 'id')
    }

    // Validar dados
    validateClientData(clientData)
    
    const docRef = doc(db, COLLECTION_NAME, id)
    
    // Buscar o documento atual primeiro
    const currentDoc = await getDoc(docRef)
    if (!currentDoc.exists()) {
      const notFoundError = createNotFoundError('Cliente')
      return {
        success: false,
        error: notFoundError
      } as ErrorResponse
    }
    
    const currentData = currentDoc.data()
    
    // Mesclar dados: manter dados existentes e atualizar apenas os fornecidos
    const updatedData = {
      ...currentData,
      ...clientToFirestore(clientData),
      updatedAt: serverTimestamp(),
    }
    
    await updateDoc(docRef, updatedData)
    
    // Buscar o documento atualizado
    const updatedDoc = await getDoc(docRef)
    const client = firestoreToClient(updatedDoc)
    
    return {
      success: true,
      data: client
    } as SuccessResponse<Client>
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    
    if (error && typeof error === 'object' && 'type' in error) {
      return {
        success: false,
        error: error as AppError
      } as ErrorResponse
    }
    
    const appError = createInternalError(
      'Falha ao atualizar cliente',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
}

// Deletar cliente
export async function deleteClient(id: string): Promise<ApiResponse<void>> {
  try {
    if (!id || id.trim().length === 0) {
      throw createValidationError('ID do cliente é obrigatório', 'id')
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    
    // Verificar se o documento existe antes de deletar
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      const notFoundError = createNotFoundError('Cliente')
      return {
        success: false,
        error: notFoundError
      } as ErrorResponse
    }
    
    await deleteDoc(docRef)
    
    return {
      success: true,
      data: undefined
    } as SuccessResponse<void>
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    
    if (error && typeof error === 'object' && 'type' in error) {
      return {
        success: false,
        error: error as AppError
      } as ErrorResponse
    }
    
    const appError = createInternalError(
      'Falha ao deletar cliente',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
}

// Buscar clientes por filtros
export async function searchClients(filters: {
  searchTerm?: string
  specialNeeds?: 'all' | 'yes' | 'no'
  childAgeGroup?: string
}): Promise<ApiResponse<Client[]>> {
  try {
    let q = query(collection(db, COLLECTION_NAME))
    
    // Aplicar filtros se fornecidos
    if (filters.specialNeeds && filters.specialNeeds !== 'all') {
      q = query(q, where('children', 'array-contains-any', filters.specialNeeds === 'yes' ? [true] : [false]))
    }
    
    const querySnapshot = await getDocs(q)
    let clients = querySnapshot.docs.map(firestoreToClient)
    
    // Ordenar no lado do cliente por data de criação (mais recente primeiro)
    clients = clients.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    
    // Filtrar por termo de busca (localmente)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      clients = clients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(filters.searchTerm || '')
      )
    }
    
    // Filtrar por idade das crianças (localmente)
    if (filters.childAgeGroup && filters.childAgeGroup !== 'all') {
      clients = clients.filter(client => {
        if (!client.children) return false
        return client.children.some(child => {
          if (!child.birthDate) return false
          // Aqui você pode implementar a lógica de agrupamento por idade
          // Por enquanto, vamos retornar true se a criança tem data de nascimento
          return true
        })
      })
    }
    
    return {
      success: true,
      data: clients
    } as SuccessResponse<Client[]>
  } catch (error) {
    console.error('Erro ao buscar clientes com filtros:', error)
    
    const appError = createInternalError(
      'Falha ao buscar clientes',
      error
    )
    
    return {
      success: false,
      error: appError
    } as ErrorResponse
  }
} 