// 🔧 Configurações da Aplicação
export const config = {
  // Firebase Configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Agendix',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },

  // Email Configuration
  email: {
    support: import.meta.env.VITE_SUPPORT_EMAIL || 'support@agendix.com',
  },

  // URLs
  urls: {
    app: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    api: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  },

  // Theme Configuration
  theme: {
    defaultColorMode: import.meta.env.VITE_DEFAULT_COLOR_MODE || 'light',
    enableColorMode: import.meta.env.VITE_ENABLE_COLOR_MODE === 'true',
  },
}

// 🔍 Validação das configurações
export function validateConfig() {
  const requiredFirebaseKeys = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]

  const missingKeys = requiredFirebaseKeys.filter(
    key => !config.firebase[key as keyof typeof config.firebase]
  )

  if (missingKeys.length > 0) {
    // Em desenvolvimento, mostrar erro detalhado
    if (config.app.env === 'development') {
      console.error('❌ Configurações do Firebase ausentes:', missingKeys)
      console.error('📝 Verifique se o arquivo .env está configurado corretamente')
    } else {
      // Em produção, erro genérico
      console.error('❌ Configuração inválida')
    }
    return false
  }

  return true
}

// 🎯 Verificar se está em desenvolvimento
export const isDevelopment = config.app.env === 'development'

// 🎯 Verificar se está em produção
export const isProduction = config.app.env === 'production'

// 🎯 Verificar se está em teste
export const isTest = config.app.env === 'test' 