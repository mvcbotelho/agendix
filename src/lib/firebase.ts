import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Verificar se as configurações essenciais estão presentes
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Configurações do Firebase ausentes. Verifique o arquivo .env')
  console.error('📝 Variáveis necessárias: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID')
  
  // Em desenvolvimento, usar configuração de fallback
  if (import.meta.env.DEV) {
    console.warn('⚠️ Usando configuração de desenvolvimento')
    firebaseConfig.apiKey = 'dev-api-key'
    firebaseConfig.projectId = 'dev-project'
    firebaseConfig.authDomain = 'dev-project.firebaseapp.com'
    firebaseConfig.storageBucket = 'dev-project.appspot.com'
    firebaseConfig.messagingSenderId = '123456789'
    firebaseConfig.appId = '1:123456789:web:dev'
  } else {
    throw new Error('Configurações do Firebase inválidas')
  }
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Auth
export const auth = getAuth(app)

// Inicializar Firestore
export const db = getFirestore(app)

// Exportar app para uso em outros serviços
export default app 