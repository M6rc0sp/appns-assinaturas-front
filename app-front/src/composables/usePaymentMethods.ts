import { ref, computed } from 'vue'
import { getSellerPaymentMethods, paymentMethodLabels, paymentMethodIcons } from '@/services/paymentMethods'

export const usePaymentMethods = () => {
  const availablePaymentMethods = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Busca os métodos de pagamento disponíveis para um seller
   */
  const fetchPaymentMethods = async (sellerId: string) => {
    console.log('[DEBUG COMPOSABLE] Iniciando busca de métodos de pagamento para seller:', sellerId);
    
    if (!sellerId) {
      error.value = 'ID do seller é obrigatório'
      console.error('[DEBUG COMPOSABLE] ID do seller não fornecido');
      return
    }

    isLoading.value = true
    error.value = null
    console.log('[DEBUG COMPOSABLE] Estado de carregamento definido como true');

    try {
      console.log('[DEBUG COMPOSABLE] Chamando getSellerPaymentMethods com sellerId:', sellerId);
      const methods = await getSellerPaymentMethods(sellerId)
      console.log('[DEBUG COMPOSABLE] Métodos de pagamento recebidos:', methods);
      availablePaymentMethods.value = methods
    } catch (err) {
      error.value = 'Erro ao carregar métodos de pagamento'
      console.error('[DEBUG COMPOSABLE] Erro ao buscar métodos de pagamento:', err);
    } finally {
      isLoading.value = false
      console.log('[DEBUG COMPOSABLE] Estado de carregamento definido como false');
    }
  }

  /**
   * Métodos de pagamento disponíveis com labels legíveis
   */
  const availablePaymentMethodsWithLabels = computed(() => {
    return availablePaymentMethods.value.map(method => ({
      code: method,
      label: paymentMethodLabels[method] || method,
      icon: paymentMethodIcons[method] || 'payment',
      available: true
    }))
  })

  /**
   * Verifica se um método de pagamento específico está disponível
   */
  const isMethodAvailable = (method: string) => {
    return availablePaymentMethods.value.includes(method)
  }

  /**
   * Limpa os dados dos métodos de pagamento
   */
  const clearPaymentMethods = () => {
    availablePaymentMethods.value = []
    error.value = null
  }

  return {
    availablePaymentMethods,
    availablePaymentMethodsWithLabels,
    isLoading,
    error,
    fetchPaymentMethods,
    isMethodAvailable,
    clearPaymentMethods
  }
}
