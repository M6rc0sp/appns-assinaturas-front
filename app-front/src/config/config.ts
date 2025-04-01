/**
 * Configurações globais da aplicação
 */

/** URL base da API */
export const API_BASE_URL = 'http://localhost:10000';

/** Configurações padrão para requisições fetch */
export const DEFAULT_FETCH_OPTIONS = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos
};

/** Formato da data usado na interface */
export const DATE_FORMAT = 'pt-BR';

/** Formato da moeda usado na interface */
export const CURRENCY_FORMAT: Intl.NumberFormatOptions = {
  style: 'currency' as const,
  currency: 'BRL'
};

/** Estados da aplicação */
export enum AppStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive'
}

/** Ciclos de cobrança */
export enum BillingCycle {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUALLY = 'SEMIANNUALLY',
  YEARLY = 'YEARLY'
}

/** Métodos de pagamento */
export enum PaymentMethod {
  BOLETO = 'BOLETO',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX'
}
