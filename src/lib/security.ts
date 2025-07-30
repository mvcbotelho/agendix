// 🔒 Utilitários de Segurança

// 🎯 Mensagens de erro seguras
export const getSecureErrorMessage = (error: unknown, isDevelopment: boolean = false): string => {
  if (isDevelopment) {
    return (error as Error)?.message || 'Erro desconhecido'
  }

  // Em produção, mensagens genéricas
  const errorCode = (error as { code?: string })?.code || ''
  
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Credenciais inválidas'
    
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde'
    
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet'
    
    case 'auth/user-disabled':
      return 'Conta desabilitada'
    
    case 'auth/invalid-email':
      return 'Email inválido'
    
    case 'auth/weak-password':
      return 'Senha muito fraca'
    
    case 'auth/email-already-in-use':
      return 'Email já está em uso'
    
    case 'auth/operation-not-allowed':
      return 'Operação não permitida'
    
    default:
      return 'Ocorreu um erro. Tente novamente'
  }
}

// 🚫 Rate limiting simples
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private maxAttempts = 5
  private windowMs = 15 * 60 * 1000 // 15 minutos

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }

    // Reset se passou o tempo
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }

    // Verificar se excedeu o limite
    if (attempt.count >= this.maxAttempts) {
      return false
    }

    // Incrementar tentativa
    attempt.count++
    attempt.lastAttempt = now
    return true
  }

  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier)
    if (!attempt) return 0

    const timePassed = Date.now() - attempt.lastAttempt
    return Math.max(0, this.windowMs - timePassed)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

export const rateLimiter = new RateLimiter()

// 🔐 Validação de entrada
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // Mínimo 6 caracteres
  return password.length >= 6
}

// 🛡️ Sanitização de entrada
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

// 🔍 Detecção de ambiente
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:'
}

// 📊 Logs de segurança (apenas em desenvolvimento)
export const securityLog = (message: string, data?: unknown): void => {
  if (import.meta.env.DEV) {
    console.log(`🔒 [Security] ${message}`, data || '')
  }
} 