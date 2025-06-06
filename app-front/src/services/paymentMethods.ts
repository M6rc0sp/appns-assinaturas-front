import { apiRequest } from './apiUtils'

export interface PaymentMethodsResponse {
  content: {
    data: {
      payment_methods: string[]
    }
    success: boolean
  }
  statusCode: number
}

/**
 * Mock dos métodos de pagamento para desenvolvimento
 */
const mockPaymentMethods: Record<string, string[]> = {
  '1': ['credit_card', 'pix', 'boleto'],
  '2': ['pix', 'boleto'],
  '3': ['credit_card', 'pix']
}

/**
 * Busca os métodos de pagamento disponíveis para um seller específico
 */
export const getSellerPaymentMethods = async (sellerId: string): Promise<string[]> => {
  try {
    // Para desenvolvimento, usar mock se a API não estiver disponível
    if (import.meta.env.DEV) {
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Retorna mock específico para o seller
      const mockMethods = mockPaymentMethods[sellerId] || ['credit_card', 'pix', 'boleto']
      console.log(`🔄 Mock: Métodos de pagamento para seller ${sellerId}:`, mockMethods)
      return mockMethods
    }
    
    const response = await apiRequest<PaymentMethodsResponse>(`/app/seller/${sellerId}/payment-methods`)
    
    if (response.content.success) {
      return response.content.data.payment_methods
    }
    
    throw new Error('Falha ao buscar métodos de pagamento')
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error)
    
    // Em caso de erro, usar mock se estiver em desenvolvimento
    if (import.meta.env.DEV) {
      const fallbackMethods = mockPaymentMethods[sellerId] || ['credit_card', 'pix', 'boleto']
      console.log(`⚠️ Fallback: Usando mock para seller ${sellerId}:`, fallbackMethods)
      return fallbackMethods
    }
    
    // Retorna métodos padrão em caso de erro em produção
    return ['credit_card', 'pix', 'boleto']
  }
}

/**
 * Mapeamento de códigos para nomes legíveis dos métodos de pagamento
 */
export const paymentMethodLabels: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  boleto: 'Boleto Bancário',
  bank_slip: 'Boleto Bancário', // Alias para boleto
  debit_card: 'Cartão de Débito',
  bank_transfer: 'Transferência Bancária'
}

/**
 * Mapeamento de ícones para cada método de pagamento
 */
export const paymentMethodIcons: Record<string, string> = {
  credit_card: 'credit_card',
  pix: 'qr_code_2',
  boleto: 'receipt_long',
  bank_slip: 'receipt_long',
  debit_card: 'credit_card',
  bank_transfer: 'account_balance'
}

/**
 * Verifica se um método de pagamento específico está disponível
 */
export const isPaymentMethodAvailable = (method: string, availableMethods: string[]): boolean => {
  return availableMethods.includes(method)
}
