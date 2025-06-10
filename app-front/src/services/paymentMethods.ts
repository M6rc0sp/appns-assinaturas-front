import { apiRequest } from './apiUtils'

export interface PaymentMethodsResponse {
  success: boolean
  data: {
    payment_methods: string[]
  }
}

/**
 * Busca os métodos de pagamento disponíveis para um seller específico
 */
export const getSellerPaymentMethods = async (sellerId: string): Promise<string[]> => {
  try {
    const response = await apiRequest<PaymentMethodsResponse>(`/app/seller/${sellerId}/payment-methods`)
    
    if (response.success) {
      return response.data.payment_methods
    }
    
    throw new Error('Falha ao buscar métodos de pagamento')
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error)
    
    // Retorna métodos padrão em caso de erro
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
