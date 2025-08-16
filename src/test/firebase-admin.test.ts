import { describe, it, expect, beforeAll } from 'vitest'

describe('Firebase Cloud Functions', () => {
  beforeAll(() => {
    // Verificar se o Firebase está configurado
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
  })

  it('should have Firebase configuration', () => {
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
    expect(import.meta.env.VITE_FIREBASE_API_KEY).toBeDefined()
  })

  it('should have Firebase Functions configuration', () => {
    // Verificar se as variáveis necessárias estão definidas
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
  })
})
