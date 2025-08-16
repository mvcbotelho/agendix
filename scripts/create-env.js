import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envContent = `# 🔥 Firebase Configuration
# Substitua os valores abaixo pelas suas configurações reais do Firebase

# Firebase Config (Client SDK)
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=back-pdv.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=back-pdv
VITE_FIREBASE_STORAGE_BUCKET=back-pdv.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Functions (configuração automática via Firebase CLI)
# Não é necessário configurar manualmente - o Firebase CLI gerencia automaticamente

# 🔧 App Configuration
VITE_APP_NAME=Agendix
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# 📧 Email Configuration (opcional)
VITE_SUPPORT_EMAIL=support@agendix.com

# 🔗 URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000

# 🎨 Theme Configuration
VITE_DEFAULT_COLOR_MODE=light
VITE_ENABLE_COLOR_MODE=true
`

const envPath = path.join(__dirname, '..', '.env')

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env criado com sucesso!')
  console.log('📝 Lembre-se de substituir os valores pelas suas configurações reais do Firebase')
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error)
}
