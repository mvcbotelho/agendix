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
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  UserPermissions, 
  CreateUserPermissionsData, 
  UpdateUserPermissionsData,
  Role,
  Permission,
  getRolePermissions
} from '@/types/Permissions'
import { ApiResponse, SuccessResponse, ErrorResponse } from '@/types/Error'
import { createNotFoundError, createInternalError } from '@/types/Error'

// Converter UserPermissions para Firestore
const userPermissionsToFirestore = (data: CreateUserPermissionsData) => {
  const now = new Date().toISOString()
  const permissions = data.permissions || getRolePermissions(data.role)
  
  return {
    userId: data.userId,
    tenantId: data.tenantId,
    role: data.role,
    permissions,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

// Converter Firestore para UserPermissions
const firestoreToUserPermissions = (doc: DocumentSnapshot | QueryDocumentSnapshot): UserPermissions => {
  const data = doc.data()
  if (!data) {
    throw new Error('Documento não possui dados')
  }
  
  return {
    userId: data.userId,
    tenantId: data.tenantId,
    role: data.role,
    permissions: data.permissions || [],
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

// Buscar permissões de um usuário
export const getUserPermissions = async (userId: string, tenantId: string): Promise<ApiResponse<UserPermissions | null>> => {
  try {
    const permissionsRef = collection(db, 'userPermissions')
    const q = query(
      permissionsRef, 
      where('userId', '==', userId),
      where('tenantId', '==', tenantId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
      } as SuccessResponse<UserPermissions | null>
    }
    
    const userPermissions = firestoreToUserPermissions(querySnapshot.docs[0])
    
    return {
      success: true,
      data: userPermissions,
    } as SuccessResponse<UserPermissions>
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar permissões do usuário', error),
    } as ErrorResponse
  }
}

// Criar permissões de usuário
export const createUserPermissions = async (
  data: CreateUserPermissionsData
): Promise<ApiResponse<UserPermissions>> => {
  try {
    const permissionsRef = collection(db, 'userPermissions')
    const firestoreData = userPermissionsToFirestore(data)
    
    const docRef = await addDoc(permissionsRef, firestoreData)
    
    // Buscar o documento criado
    const docSnap = await getDoc(doc(db, 'userPermissions', docRef.id))
    
    if (!docSnap.exists()) {
      return {
        success: false,
        error: createNotFoundError('Permissões do usuário'),
      } as ErrorResponse
    }
    
    const userPermissions = firestoreToUserPermissions(docSnap)
    
    return {
      success: true,
      data: userPermissions,
    } as SuccessResponse<UserPermissions>
  } catch (error) {
    console.error('Erro ao criar permissões do usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao criar permissões do usuário', error),
    } as ErrorResponse
  }
}

// Atualizar permissões de usuário
export const updateUserPermissions = async (
  userId: string,
  tenantId: string,
  data: UpdateUserPermissionsData
): Promise<ApiResponse<UserPermissions>> => {
  try {
    // Buscar o documento existente
    const permissionsRef = collection(db, 'userPermissions')
    const q = query(
      permissionsRef, 
      where('userId', '==', userId),
      where('tenantId', '==', tenantId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: createNotFoundError('Permissões do usuário'),
      } as ErrorResponse
    }
    
    const docRef = doc(db, 'userPermissions', querySnapshot.docs[0].id)
    
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }
    
    if (data.role !== undefined) {
      updateData.role = data.role
      updateData.permissions = data.permissions || getRolePermissions(data.role)
    }
    
    if (data.permissions !== undefined) {
      updateData.permissions = data.permissions
    }
    
    await updateDoc(docRef, updateData)
    
    // Buscar o documento atualizado
    const updatedDoc = await getDoc(docRef)
    const userPermissions = firestoreToUserPermissions(updatedDoc)
    
    return {
      success: true,
      data: userPermissions,
    } as SuccessResponse<UserPermissions>
  } catch (error) {
    console.error('Erro ao atualizar permissões do usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao atualizar permissões do usuário', error),
    } as ErrorResponse
  }
}

// Deletar permissões de usuário
export const deleteUserPermissions = async (
  userId: string,
  tenantId: string
): Promise<ApiResponse<void>> => {
  try {
    const permissionsRef = collection(db, 'userPermissions')
    const q = query(
      permissionsRef, 
      where('userId', '==', userId),
      where('tenantId', '==', tenantId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: createNotFoundError('Permissões do usuário'),
      } as ErrorResponse
    }
    
    const docRef = doc(db, 'userPermissions', querySnapshot.docs[0].id)
    await deleteDoc(docRef)
    
    return {
      success: true,
      data: undefined,
    } as SuccessResponse<void>
  } catch (error) {
    console.error('Erro ao deletar permissões do usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao deletar permissões do usuário', error),
    } as ErrorResponse
  }
}

// Buscar todos os usuários de um tenant
export const getTenantUsers = async (tenantId: string): Promise<ApiResponse<UserPermissions[]>> => {
  try {
    const permissionsRef = collection(db, 'userPermissions')
    const q = query(
      permissionsRef, 
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const users: UserPermissions[] = []
    querySnapshot.forEach((doc) => {
      users.push(firestoreToUserPermissions(doc))
    })
    
    return {
      success: true,
      data: users,
    } as SuccessResponse<UserPermissions[]>
  } catch (error) {
    console.error('Erro ao buscar usuários do tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar usuários do tenant', error),
    } as ErrorResponse
  }
}

// Verificar se usuário tem permissão específica
export const checkUserPermission = async (
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await getUserPermissions(userId, tenantId)
    
    if (!response.success || !response.data) {
      return {
        success: true,
        data: false,
      } as SuccessResponse<boolean>
    }
    
    const hasPermission = response.data.permissions.includes(permission)
    
    return {
      success: true,
      data: hasPermission,
    } as SuccessResponse<boolean>
  } catch (error) {
    console.error('Erro ao verificar permissão:', error)
    return {
      success: false,
      error: createInternalError('Erro ao verificar permissão', error),
    } as ErrorResponse
  }
}

// Verificar se usuário tem qualquer uma das permissões
export const checkUserAnyPermission = async (
  userId: string,
  tenantId: string,
  permissions: Permission[]
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await getUserPermissions(userId, tenantId)
    
    if (!response.success || !response.data) {
      return {
        success: true,
        data: false,
      } as SuccessResponse<boolean>
    }
    
    const hasAnyPermission = permissions.some(permission => 
      response.data!.permissions.includes(permission)
    )
    
    return {
      success: true,
      data: hasAnyPermission,
    } as SuccessResponse<boolean>
  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
    return {
      success: false,
      error: createInternalError('Erro ao verificar permissões', error),
    } as ErrorResponse
  }
}

// Verificar se usuário tem todas as permissões
export const checkUserAllPermissions = async (
  userId: string,
  tenantId: string,
  permissions: Permission[]
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await getUserPermissions(userId, tenantId)
    
    if (!response.success || !response.data) {
      return {
        success: true,
        data: false,
      } as SuccessResponse<boolean>
    }
    
    const hasAllPermissions = permissions.every(permission => 
      response.data!.permissions.includes(permission)
    )
    
    return {
      success: true,
      data: hasAllPermissions,
    } as SuccessResponse<boolean>
  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
    return {
      success: false,
      error: createInternalError('Erro ao verificar permissões', error),
    } as ErrorResponse
  }
} 