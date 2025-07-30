/**
 * Formata uma data string para exibição no formato brasileiro
 * Corrige problemas de fuso horário que podem causar diferença de 1 dia
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ''
  
  // Cria a data considerando que está no fuso horário local
  const date = new Date(dateString + 'T00:00:00')
  
  return date.toLocaleDateString('pt-BR')
}

/**
 * Converte uma data string para objeto Date sem problemas de fuso horário
 */
export function parseDate(dateString: string): Date {
  if (!dateString) return new Date()
  
  // Cria a data considerando que está no fuso horário local
  return new Date(dateString + 'T00:00:00')
} 