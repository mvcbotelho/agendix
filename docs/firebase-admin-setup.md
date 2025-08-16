# 🔥 Firebase Admin SDK Setup

## 📋 Pré-requisitos

1. **Projeto Firebase configurado**
2. **Service Account criado**
3. **Variáveis de ambiente configuradas**

## 🚀 Configuração

### **1. Criar Service Account**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Project Settings** (⚙️)
4. Clique na aba **Service accounts**
5. Clique em **Generate new private key**
6. Baixe o arquivo JSON

### **2. Configurar Variáveis de Ambiente**

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Firebase Admin SDK (Service Account)
VITE_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
VITE_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua-chave-privada-aqui\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:**
- A `VITE_FIREBASE_PRIVATE_KEY` deve estar entre aspas duplas
- Os `\n` devem ser mantidos para quebras de linha
- Nunca commite essas chaves no repositório

### **3. Estrutura do arquivo JSON do Service Account**

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40seu-projeto.iam.gserviceaccount.com"
}
```

## 🔧 Funcionalidades Implementadas

### **1. Buscar Informações de Usuários**
```typescript
// Buscar um usuário específico
const userInfo = await getUserInfo(userId)

// Buscar múltiplos usuários
const usersInfo = await getUsersInfo([userId1, userId2, userId3])
```

### **2. Verificar Email**
```typescript
// Verificar se um email já está em uso
const emailExists = await checkEmailExists(email)
```

### **3. Convidar Usuários**
```typescript
// Criar usuário e enviar convite
const newUser = await inviteUser(email, displayName, role, tenantId)
```

## 🛡️ Segurança

### **Regras do Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Permissões do Service Account**
- **Firebase Auth**: Gerenciar usuários
- **Firestore**: Ler/escrever dados
- **Cloud Functions**: Executar funções (se necessário)

## 🚨 Limitações

### **1. Frontend vs Backend**
- O Firebase Admin SDK é projetado para uso no backend
- No frontend, as chaves ficam expostas
- **Recomendação**: Use Cloud Functions para operações sensíveis

### **2. Alternativa Segura**
```typescript
// Cloud Function (recomendado)
export const getUserInfo = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado')
  }
  
  // Buscar informações do usuário
  const userRecord = await admin.auth().getUser(data.userId)
  return userRecord
})
```

## 🔍 Troubleshooting

### **Erro: "Invalid private key"**
- Verifique se a chave privada está correta
- Certifique-se de que os `\n` estão presentes

### **Erro: "Service account not found"**
- Verifique se o `client_email` está correto
- Confirme se o service account foi criado corretamente

### **Erro: "Permission denied"**
- Verifique as permissões do service account
- Confirme se o projeto está correto

## 📚 Recursos Adicionais

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/service-accounts)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
