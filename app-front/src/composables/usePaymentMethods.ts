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
    if (!sellerId) {
      error.value = 'ID do seller é obrigatório'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const methods = await getSellerPaymentMethods(sellerId)
      availablePaymentMethods.value = methods
    } catch (err) {
      error.value = 'Erro ao carregar métodos de pagamento'
      console.error('Erro ao buscar métodos de pagamento:', err)
    } finally {
      isLoading.value = false
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
