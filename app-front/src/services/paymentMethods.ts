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
    
    console.log('[DEBUG] Resposta completa recebida:', JSON.stringify(response));
    
    // Dois cenários possíveis:
    // 1. O apiRequest já extraiu o objeto interno (só data.payment_methods)
    // 2. O apiRequest retornou o objeto completo {success: true, data: {payment_methods: [...]}
    
    if (Array.isArray(response)) {
      // Caso 1: Se a resposta já é um array, é o array de métodos de pagamento
      console.log('[DEBUG] Resposta já é um array de métodos de pagamento:', response);
      return response;
    } else if (response && typeof response === 'object') {
      // Caso 2a: Se a resposta é o objeto completo com a estrutura esperada
      if ('success' in response && response.success && 'data' in response && 
          response.data && 'payment_methods' in response.data && 
          Array.isArray(response.data.payment_methods)) {
        console.log('[DEBUG] Métodos de pagamento obtidos com sucesso:', response.data.payment_methods);
        return response.data.payment_methods;
      }
      
      // Caso 2b: Se a resposta é o próprio array de métodos, mas dentro de um objeto
      if ('payment_methods' in response && Array.isArray(response.payment_methods)) {
        console.log('[DEBUG] Métodos de pagamento encontrados diretamente no objeto:', response.payment_methods);
        return response.payment_methods;
      }
    }
    
    console.error('[DEBUG] Formato de resposta não reconhecido:', response);
    throw new Error('API retornou resposta em formato não esperado ao buscar métodos de pagamento');
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
