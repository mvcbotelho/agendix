import { ApiResponse, SuccessResponse, ErrorResponse, createValidationError, createNetworkError, createNotFoundError, createInternalError } from '@/types/Error'

export interface CepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export interface AddressData {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

/**
 * Busca endereço pelo CEP usando a API do ViaCEP
 */
export const getAddressByCep = async (cep: string): Promise<ApiResponse<AddressData>> => {
  try {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '')
    
    if (cleanCep.length !== 8) {
      const error = createValidationError(
        'CEP deve ter 8 dígitos',
        'CEP inválido. Digite um CEP com 8 dígitos.'
      )
      
      return {
        success: false,
        error
      }
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    
    if (!response.ok) {
      const error = createNetworkError(
        `Erro na requisição: ${response.status} ${response.statusText}`,
        new Error(`HTTP ${response.status}: ${response.statusText}`)
      )
      
      return {
        success: false,
        error
      }
    }

    const data: CepResponse = await response.json()

    // Verifica se o CEP foi encontrado
    if ('erro' in data && data.erro) {
      const error = createNotFoundError('CEP')
      
      return {
        success: false,
        error
      }
    }

    const addressData: AddressData = {
      street: data.logradouro || '',
      number: '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: data.cep || cep
    }

    const successResponse: SuccessResponse<AddressData> = {
      success: true,
      data: addressData
    }

    return successResponse

  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    
    const appError = createInternalError(
      error instanceof Error ? error.message : 'Erro desconhecido ao buscar CEP',
      error
    )
    
    return {
      success: false,
      error: appError
    }
  }
} 