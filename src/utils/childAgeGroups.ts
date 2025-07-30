import { calculateAge } from './ageCalculator'
import { Client } from '@/types/Client'

export function getChildAgeGroup(birthDate: string): string {
  const ageText = calculateAge(birthDate)
  
  // Extrai apenas os anos da string de idade
  const yearsMatch = ageText.match(/(\d+)\s*anos?/)
  if (!yearsMatch) {
    // Se não tem anos, é menos de 1 ano
    return '0-2 anos'
  }
  
  const years = parseInt(yearsMatch[1])
  
  // Agrupa de 3 em 3 anos
  if (years <= 2) return '0-2 anos'
  if (years <= 5) return '3-5 anos'
  if (years <= 8) return '6-8 anos'
  if (years <= 11) return '9-11 anos'
  if (years <= 14) return '12-14 anos'
  if (years <= 17) return '15-17 anos'
  return '18+ anos'
}

export function getChildAgeGroups(clients: Client[]): string[] {
  const ageGroups = new Set<string>()
  
  clients.forEach(client => {
    if (client.children) {
      client.children.forEach((child) => {
        if (child.birthDate) {
          ageGroups.add(getChildAgeGroup(child.birthDate))
        }
      })
    }
  })
  
  return Array.from(ageGroups).sort((a, b) => {
    const aMin = parseInt(a.split('-')[0])
    const bMin = parseInt(b.split('-')[0])
    return aMin - bMin
  })
} 