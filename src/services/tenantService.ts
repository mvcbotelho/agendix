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
  Tenant, 
  CreateTenantData, 
  UpdateTenantData, 
  TenantUser, 
  CreateTenantUserData 
} from '@/types/Tenant'
import { ApiResponse, SuccessResponse, ErrorResponse } from '@/types/Error'
import { createNotFoundError, createInternalError } from '@/types/Error'

// Converter Tenant para Firestore
const tenantToFirestore = (tenant: CreateTenantData, userId?: string) => {
  const now = new Date().toISOString()
  
  return {
    ...tenant,
    plan: tenant.plan || 'free',
    status: 'pending',
    settings: {
      maxClients: 100,
      maxAppointments: 1000,
      features: {
        appointments: true,
        clients: true,
        dashboard: true,
        reports: false,
        notifications: false,
        integrations: false,
      },
      branding: {},
      notifications: {
        email: true,
        sms: false,
        push: false,
      },
      ...tenant.settings,
    },
    createdAt: now,
    updatedAt: now,
    ...(userId && { createdBy: userId }),
  }
}

// Converter Firestore para Tenant
const firestoreToTenant = (doc: DocumentSnapshot | QueryDocumentSnapshot): Tenant => {
  const data = doc.data()
  if (!data) {
    throw new Error('Documento não possui dados')
  }
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    cnpj: data.cnpj,
    address: data.address,
    plan: data.plan || 'free',
    status: data.status || 'pending',
    settings: data.settings,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

// Buscar todos os tenants (apenas para super admin)
export const getTenants = async (): Promise<ApiResponse<Tenant[]>> => {
  try {
    const tenantsRef = collection(db, 'tenants')
    const q = query(tenantsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const tenants: Tenant[] = []
    querySnapshot.forEach((doc) => {
      tenants.push(firestoreToTenant(doc))
    })
    
    return {
      success: true,
      data: tenants,
    } as SuccessResponse<Tenant[]>
  } catch (error) {
    console.error('Erro ao buscar tenants:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar tenants', error),
    } as ErrorResponse
  }
}

// Buscar tenant por ID
export const getTenantById = async (tenantId: string): Promise<ApiResponse<Tenant>> => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId)
    const tenantDoc = await getDoc(tenantRef)
    
    if (!tenantDoc.exists()) {
      return {
        success: false,
        error: createNotFoundError('Tenant'),
      } as ErrorResponse
    }
    
    const tenant = firestoreToTenant(tenantDoc)
    
    return {
      success: true,
      data: tenant,
    } as SuccessResponse<Tenant>
  } catch (error) {
    console.error('Erro ao buscar tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar tenant', error),
    } as ErrorResponse
  }
}

// Criar novo tenant
export const createTenant = async (
  tenantData: CreateTenantData, 
  userId: string
): Promise<ApiResponse<Tenant>> => {
  try {
    
    const tenantRef = collection(db, 'tenants')
    const tenantFirestoreData = tenantToFirestore(tenantData, userId)
    
    const tenantDoc = await addDoc(tenantRef, tenantFirestoreData)
    
    // Criar usuário do tenant
    const tenantUserResult = await createTenantUser({
      tenantId: tenantDoc.id,
      userId,
      role: 'owner',
      permissions: ['*'], // Owner tem todas as permissões
    })
        
    const newTenant = await getTenantById(tenantDoc.id)
    
    return newTenant
  } catch (error) {
    console.error('Erro ao criar tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao criar tenant', error),
    } as ErrorResponse
  }
}

// Atualizar tenant
export const updateTenant = async (
  tenantId: string, 
  tenantData: UpdateTenantData
): Promise<ApiResponse<Tenant>> => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId)
    await updateDoc(tenantRef, {
      ...tenantData,
      updatedAt: new Date().toISOString(),
    })
    
    return await getTenantById(tenantId)
  } catch (error) {
    console.error('Erro ao atualizar tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao atualizar tenant', error),
    } as ErrorResponse
  }
}

// Deletar tenant
export const deleteTenant = async (tenantId: string): Promise<ApiResponse<void>> => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId)
    await deleteDoc(tenantRef)
    
    return {
      success: true,
      data: undefined,
    } as SuccessResponse<void>
  } catch (error) {
    console.error('Erro ao deletar tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao deletar tenant', error),
    } as ErrorResponse
  }
}

// Buscar tenant por usuário
export const getTenantByUser = async (userId: string): Promise<ApiResponse<Tenant | null>> => {
  
  try {
    const tenantUsersRef = collection(db, 'tenantUsers')
    
    // Buscar apenas por userId para debug (sem filtro isActive)
    const q = query(tenantUsersRef, where('userId', '==', userId))
    
    const querySnapshot = await getDocs(q)
    
    
    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
      } as SuccessResponse<null>
    }
    
    const tenantUserDoc = querySnapshot.docs[0]
    const tenantUserData = tenantUserDoc.data()
    
    const tenantId = tenantUserData.tenantId
    
    if (!tenantId) {
      return {
        success: true,
        data: null,
      } as SuccessResponse<null>
    }
    
    const tenantResult = await getTenantById(tenantId)
    
    return tenantResult
  } catch (error) {
    console.error('tenantService: Erro ao buscar tenant por usuário:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar tenant por usuário', error),
    } as ErrorResponse
  }
}

// Criar usuário do tenant
export const createTenantUser = async (
  tenantUserData: CreateTenantUserData
): Promise<ApiResponse<TenantUser>> => {
  try {
    
    const tenantUsersRef = collection(db, 'tenantUsers')
    const tenantUserDocData = {
      ...tenantUserData,
      permissions: tenantUserData.permissions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const tenantUserDoc = await addDoc(tenantUsersRef, tenantUserDocData)
    
    const newTenantUser = await getTenantUserById(tenantUserDoc.id)
    
    return newTenantUser
  } catch (error) {
    console.error('Erro ao criar usuário do tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao criar usuário do tenant', error),
    } as ErrorResponse
  }
}

// Buscar usuário do tenant por ID
export const getTenantUserById = async (tenantUserId: string): Promise<ApiResponse<TenantUser>> => {
  try {
    const tenantUserRef = doc(db, 'tenantUsers', tenantUserId)
    const tenantUserDoc = await getDoc(tenantUserRef)
    
    if (!tenantUserDoc.exists()) {
      return {
        success: false,
        error: createNotFoundError('Usuário do tenant'),
      } as ErrorResponse
    }
    
    const data = tenantUserDoc.data()
    const tenantUser: TenantUser = {
      id: tenantUserDoc.id,
      tenantId: data.tenantId,
      userId: data.userId,
      role: data.role,
      permissions: data.permissions || [],
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
    
    return {
      success: true,
      data: tenantUser,
    } as SuccessResponse<TenantUser>
  } catch (error) {
    console.error('Erro ao buscar usuário do tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar usuário do tenant', error),
    } as ErrorResponse
  }
}

// Buscar TenantUser por userId
export const getTenantUserByUserId = async (userId: string): Promise<ApiResponse<TenantUser | null>> => {
  try {
    const tenantUsersRef = collection(db, 'tenantUsers')
    const q = query(tenantUsersRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
      } as SuccessResponse<null>
    }
    
    const tenantUserDoc = querySnapshot.docs[0]
    const data = tenantUserDoc.data()
    const tenantUser: TenantUser = {
      id: tenantUserDoc.id,
      tenantId: data.tenantId,
      userId: data.userId,
      role: data.role,
      permissions: data.permissions || [],
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
    
    return {
      success: true,
      data: tenantUser,
    } as SuccessResponse<TenantUser>
  } catch (error) {
    console.error('Erro ao buscar usuário do tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar usuário do tenant', error),
    } as ErrorResponse
  }
}

// Buscar usuários de um tenant
export const getTenantUsers = async (tenantId: string): Promise<ApiResponse<TenantUser[]>> => {
  try {
    const tenantUsersRef = collection(db, 'tenantUsers')
    const q = query(tenantUsersRef, where('tenantId', '==', tenantId))
    const querySnapshot = await getDocs(q)
    
    const tenantUsers: TenantUser[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tenantUsers.push({
        id: doc.id,
        tenantId: data.tenantId,
        userId: data.userId,
        role: data.role,
        permissions: data.permissions || [],
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    })
    
    return {
      success: true,
      data: tenantUsers,
    } as SuccessResponse<TenantUser[]>
  } catch (error) {
    console.error('Erro ao buscar usuários do tenant:', error)
    return {
      success: false,
      error: createInternalError('Erro ao buscar usuários do tenant', error),
    } as ErrorResponse
  }
} 