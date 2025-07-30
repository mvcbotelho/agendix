import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { config, validateConfig } from './config'

// Validar configurações antes de inicializar
if (!validateConfig()) {
  throw new Error('Configurações do Firebase inválidas. Verifique o arquivo .env')
}

// Inicializar Firebase com configurações centralizadas
const app = initializeApp(config.firebase)

// Inicializar Auth
export const auth = getAuth(app)

// Inicializar Firestore
export const db = getFirestore(app)

// Exportar app para uso em outros serviços
export default app 