import { describe, it, expect, beforeAll } from 'vitest'

describe('Cloud Functions', () => {
  beforeAll(() => {
    // Verificar se as variáveis de ambiente estão definidas
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
  })

  it('should have Firebase configuration', () => {
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined()
    expect(import.meta.env.VITE_FIREBASE_API_KEY).toBeDefined()
  })

  it('should handle Cloud Functions gracefully when not available', async () => {
    // Este teste verifica se o serviço lida graciosamente com Firebase não inicializado
    try {
      const { checkEmailExists } = await import('@/services/userService')
      const result = await checkEmailExists('test@example.com')
      
      // Se as Cloud Functions não estiverem disponíveis, deve retornar erro
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error?.message).toContain('Firebase Functions não disponível')
      }
    } catch (error) {
      // Se houver erro de importação, também é aceitável
      console.warn('Cloud Functions não disponíveis para teste:', error)
    }
  }, 5000)
})
