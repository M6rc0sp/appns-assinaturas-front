import { apiRequest } from './apiUtils'
import { API_BASE_URL, DEFAULT_FETCH_OPTIONS, API_FULL_URL } from '@/config/config'

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
  const endpoint = `/app/seller/${sellerId}/payment-methods`;
  const fullUrl = `${API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  
  console.log('[DEBUG] Buscando métodos de pagamento:', { 
    sellerId, 
    endpoint,
    fullUrl
  });
  
  try {
    // Tentativa normal usando apiRequest
    console.log('[DEBUG] Iniciando requisição via apiRequest');
    const response = await apiRequest<PaymentMethodsResponse>(`/app/seller/${sellerId}/payment-methods`);
    
    console.log('[DEBUG] Resposta recebida:', response);
    
    if (response && response.success) {
      console.log('[DEBUG] Métodos de pagamento obtidos com sucesso:', response.data.payment_methods);
      return response.data.payment_methods;
    }
    
    throw new Error('API retornou resposta inválida ao buscar métodos de pagamento');
  } catch (error) {
    console.error('[DEBUG] Erro ao buscar métodos de pagamento:', error);
    
    // Registrar detalhes adicionais sobre o erro para depuração
    console.debug('[DEBUG] Detalhes da conexão:', {
      sellerId,
      endpoint,
      fullUrl,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    
    // Tentando uma requisição direta como fallback para debug
    console.log('[DEBUG] Tentando requisição direta como fallback');
    
    try {
      // Testando uma requisição direta para a URL completa da API
      const testUrl = `${API_FULL_URL}/app/seller/3/payment-methods`;
      console.log(`[DEBUG] Fazendo requisição de teste para: ${testUrl}`);
      
      // Imprimindo também a URL que deveria ter sido usada
      console.log(`[DEBUG] URL que deveria ter sido usada: ${API_FULL_URL}/app/seller/${sellerId}/payment-methods`);
      
      fetch(testUrl)
        .then(response => {
          console.log('[DEBUG] Status da requisição de teste:', response.status, response.statusText);
          return response.json();
        })
        .then(data => console.log('[DEBUG] Resultado da requisição de teste:', data))
        .catch(testError => console.error('[DEBUG] Erro na requisição de teste:', testError));
    } catch (testError) {
      console.error('[DEBUG] Erro ao tentar requisição de teste:', testError);
    }
    
    // Retorna métodos padrão em caso de erro para manter a aplicação funcionando
    return ['credit_card', 'pix', 'boleto'];
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
