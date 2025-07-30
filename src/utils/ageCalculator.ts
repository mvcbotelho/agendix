export function calculateAge(birthDate: string): string {
  if (!birthDate) {
    return ''
  }
  
  const today = new Date()
  const birth = new Date(birthDate)
  
  // Verificar se a data é válida
  if (isNaN(birth.getTime())) {
    return ''
  }
  
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  if (today.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }
  
  if (years === 0) {
    return months === 1 ? '1 mês' : `${months} meses`
  } else if (months === 0) {
    return years === 1 ? '1 ano' : `${years} anos`
  } else {
    const yearText = years === 1 ? '1 ano' : `${years} anos`
    const monthText = months === 1 ? '1 mês' : `${months} meses`
    return `${yearText} e ${monthText}`
  }
} 