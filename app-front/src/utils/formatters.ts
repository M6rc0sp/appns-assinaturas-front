import { DATE_FORMAT, CURRENCY_FORMAT, BillingCycle, PaymentMethod } from '@/config/config';

/**
 * Formata uma data para o formato local
 * @param dateString String de data para formatar
 * @param defaultValue Valor padrão caso a data seja inválida
 * @returns Data formatada no padrão local
 */
export function formatDate(dateString?: string, defaultValue: string = 'N/A'): string {
  if (!dateString) return defaultValue;
  
  try {
    return new Date(dateString).toLocaleDateString(DATE_FORMAT);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return defaultValue;
  }
}

/**
 * Formata um valor para moeda local
 * @param value Valor a ser formatado
 * @returns Valor formatado no padrão de moeda local
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  try {
    // Usando o tipo correto para evitar erros de tipagem
    return new Intl.NumberFormat(DATE_FORMAT, CURRENCY_FORMAT).format(numValue);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  }
}

/**
 * Obtém o texto de exibição para um ciclo de cobrança
 * @param cycle Ciclo de cobrança
 * @returns Texto para exibição
 */
export function getCycleText(cycle: string): string {
  switch (cycle) {
    case BillingCycle.WEEKLY:
      return 'Semanal';
    case BillingCycle.BIWEEKLY:
      return 'Quinzenal';
    case BillingCycle.MONTHLY:
      return 'Mensal';
    case BillingCycle.QUARTERLY:
      return 'Trimestral';
    case BillingCycle.SEMIANNUALLY:
      return 'Semestral';
    case BillingCycle.YEARLY:
      return 'Anual';
    default:
      return cycle;
  }
}

/**
 * Obtém o texto de exibição para um método de pagamento
 * @param billingType Tipo de pagamento
 * @returns Texto para exibição
 */
export function getPaymentMethodText(billingType: string): string {
  switch (billingType) {
    case PaymentMethod.BOLETO:
      return 'Boleto';
    case PaymentMethod.CREDIT_CARD:
      return 'Cartão de Crédito';
    case PaymentMethod.PIX:
      return 'Pix';
    default:
      return billingType;
  }
}

/**
 * Obtém a classe CSS para um status
 * @param status Status
 * @returns Nome da classe CSS
 */
export function getStatusClass(status: string): string {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'active':
    case 'paid':
      return 'status-active';
    case 'pending':
      return 'status-pending';
    case 'canceled':
    case 'cancelled':
      return 'status-canceled';
    case 'overdue':
      return 'status-overdue';
    default:
      return '';
  }
}

/**
 * Obtém o texto de exibição para um status
 * @param status Status
 * @returns Texto para exibição
 */
export function getStatusText(status: string): string {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'active':
      return 'Ativo';
    case 'paid':
      return 'Pago';
    case 'pending':
      return 'Pendente';
    case 'canceled':
    case 'cancelled':
      return 'Cancelado';
    case 'overdue':
      return 'Em atraso';
    default:
      return status;
  }
}
