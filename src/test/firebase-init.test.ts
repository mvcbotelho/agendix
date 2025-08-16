import { describe, it, expect, beforeAll } from 'vitest'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

describe('Firebase Initialization', () => {
  beforeAll(() => {
    // Verificar se as variáveis de ambiente estão definidas (opcional no CI)
    if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
    }
  })

  it('should initialize Firebase app', () => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:test',
    }

    const app = initializeApp(firebaseConfig)
    expect(app).toBeDefined()
    expect(app.name).toBe('[DEFAULT]')
  })

  it('should initialize Firebase Auth', () => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:test',
    }
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    expect(auth).toBeDefined()
    expect(auth.app).toBe(app)
  })

  it('should initialize Firestore', () => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:test',
    }
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    expect(db).toBeDefined()
    expect(db.app).toBe(app)
  })
})
