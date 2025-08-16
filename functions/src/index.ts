import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Inicializar Firebase Admin
initializeApp();

const auth = getAuth();
const db = getFirestore();

// Configurações globais
setGlobalOptions({ maxInstances: 10 });

// Interface para resposta de usuário
interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastSignInTime: string | null;
}



// Função para buscar informações de um usuário
export const getUserInfo = onCall(
  async (request) => {
    try {
      const { userId } = request.data as { userId: string };
      
      if (!userId) {
        throw new HttpsError('invalid-argument', 'userId é obrigatório');
      }

      const userRecord = await auth.getUser(userId);
      
      const userInfo: UserInfo = {
        uid: userRecord.uid,
        email: userRecord.email || null,
        displayName: userRecord.displayName || null,
        photoURL: userRecord.photoURL || null,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime || '',
        lastSignInTime: userRecord.metadata.lastSignInTime || null,
      };

      return {
        success: true,
        data: userInfo,
      };
    } catch (error: any) {
      logger.error('Erro ao buscar informações do usuário:', error);
      
      if (error.code === 'auth/user-not-found') {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado',
            userMessage: 'Usuário não encontrado',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erro interno',
          userMessage: 'Erro ao buscar informações do usuário',
        },
      };
    }
  }
);

// Função para buscar informações de múltiplos usuários
export const getUsersInfo = onCall(
  async (request) => {
    try {
      const { userIds } = request.data as { userIds: string[] };
      
      if (!userIds || !Array.isArray(userIds)) {
        throw new HttpsError('invalid-argument', 'userIds deve ser um array');
      }

      if (userIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Converter strings para UserIdentifier
      const userIdentifiers = userIds.map(uid => ({ uid }));
      const userRecords = await auth.getUsers(userIdentifiers);
      const usersInfo: UserInfo[] = [];

      for (const userRecord of userRecords.users) {
        usersInfo.push({
          uid: userRecord.uid,
          email: userRecord.email || null,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          createdAt: userRecord.metadata.creationTime || '',
          lastSignInTime: userRecord.metadata.lastSignInTime || null,
        });
      }

      return {
        success: true,
        data: usersInfo,
      };
    } catch (error: any) {
      logger.error('Erro ao buscar informações dos usuários:', error);
      
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erro interno',
          userMessage: 'Erro ao buscar informações dos usuários',
        },
      };
    }
  }
);

// Função para verificar se um email existe
export const checkEmailExists = onCall(
  async (request) => {
    try {
      const { email } = request.data as { email: string };
      
      if (!email) {
        throw new HttpsError('invalid-argument', 'email é obrigatório');
      }

      try {
        await auth.getUserByEmail(email);
        return {
          success: true,
          data: true,
        };
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          return {
            success: true,
            data: false,
          };
        }
        throw error;
      }
    } catch (error: any) {
      logger.error('Erro ao verificar email:', error);
      
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erro interno',
          userMessage: 'Erro ao verificar email',
        },
      };
    }
  }
);

// Função para convidar um usuário
export const inviteUser = onCall(
  async (request) => {
    try {
      const { email, displayName, role, tenantId } = request.data as { 
        email: string; 
        displayName: string; 
        role: string; 
        tenantId: string;
      };
      
      if (!email || !displayName || !role || !tenantId) {
        throw new HttpsError('invalid-argument', 'Todos os campos são obrigatórios');
      }

      // Verificar se o email já existe
      try {
        await auth.getUserByEmail(email);
        return {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email já está em uso',
            userMessage: 'Este email já está cadastrado no sistema',
          },
        };
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Criar usuário no Firebase Auth
      const userRecord = await auth.createUser({
        email,
        displayName,
        emailVerified: false,
        disabled: false,
      });

      // Enviar email de verificação
      await auth.generateEmailVerificationLink(email);

      // Criar TenantUser no Firestore
      const tenantUserData = {
        tenantId,
        userId: userRecord.uid,
        role,
        permissions: getRolePermissions(role),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('tenantUsers').add(tenantUserData);

      const userInfo: UserInfo = {
        uid: userRecord.uid,
        email: userRecord.email || null,
        displayName: userRecord.displayName || null,
        photoURL: userRecord.photoURL || null,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime || '',
        lastSignInTime: userRecord.metadata.lastSignInTime || null,
      };

      return {
        success: true,
        data: userInfo,
      };
    } catch (error: any) {
      logger.error('Erro ao convidar usuário:', error);
      
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erro interno',
          userMessage: 'Erro ao convidar usuário',
        },
      };
    }
  }
);

/**
 * Return the list of permissions associated with a tenant role.
 *
 * Looks up a predefined mapping of role names to permission strings and returns
 * the corresponding array. If the role is not recognized, returns an empty array.
 *
 * @param role - Role name (e.g., "owner", "admin", "manager", "staff", "viewer")
 * @returns Array of permission identifiers for the given role, or [] if unknown
 */
function getRolePermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    owner: ['*'],
    admin: [
      'users:view', 'users:edit', 'users:delete',
      'clients:view', 'clients:edit', 'clients:delete',
      'appointments:view', 'appointments:edit', 'appointments:delete',
      'reports:view', 'settings:edit'
    ],
    manager: [
      'users:view',
      'clients:view', 'clients:edit',
      'appointments:view', 'appointments:edit',
      'reports:view'
    ],
    staff: [
      'clients:view',
      'appointments:view', 'appointments:edit'
    ],
    viewer: [
      'clients:view',
      'appointments:view'
    ]
  };

  return rolePermissions[role] || [];
}
