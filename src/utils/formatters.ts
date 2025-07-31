export function formatPhone(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limited = numbers.slice(0, 11)
  
  // Aplica a formatação
  if (limited.length <= 2) {
    return `(${limited}`
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

export function formatCPF(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11)
  
  // Aplica a formatação
  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`
  }
}

export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCEP(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8)
  
  // Aplica a formatação
  if (limited.length <= 5) {
    return limited
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5)}`
  }
}

export function unformatCEP(value: string): string {
  return value.replace(/\D/g, '')
} 