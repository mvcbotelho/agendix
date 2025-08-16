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

/**
 * Remove all non-digit characters from a CPF string and return only the digits.
 *
 * @param value - Input CPF (formatted or unformatted).
 * @returns The input's numeric characters as a contiguous string. This function does not validate CPF length or checksum.
 */
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formats a string as a Brazilian CEP (postal code).
 *
 * Removes all non-digit characters, truncates to at most 8 digits, and formats as `00000-000` when more than 5 digits are present. For inputs with 0–5 digits the function returns the cleaned digits without a hyphen (allowing partial input).
 *
 * @param value - Any input string potentially containing a CEP
 * @returns The formatted CEP string containing only digits and, when applicable, a hyphen after the fifth digit
 */
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

/**
 * Removes all non-digit characters from a CEP string.
 *
 * Accepts a formatted or unformatted CEP and returns only the numeric digits.
 *
 * @param value - The CEP string to unformat
 * @returns The CEP containing only digits (no separators or other characters)
 */
export function unformatCEP(value: string): string {
  return value.replace(/\D/g, '')
} 