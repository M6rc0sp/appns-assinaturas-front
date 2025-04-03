import { handleApiResponse, handleApiError, buildApiUrl, fetchWithTimeout } from './apiUtils';

const API_BASE_URL = 'http://localhost:10000';

export enum SubscriptionType {
  SHOPPER = 'shopper',
  SELLER = 'seller'
}

// Interface base para propriedades comuns entre os tipos de assinatura
interface BaseSubscription {
  id: number;
  external_id: string;
  plan_name: string;
  value: string | number;
  status: string;
  cycle: string;
  next_due_date: string;
  start_date: string;
  end_date: string | null;
  payment_method: string | null;
  billing_type: string;
  features: any | null;
  metadata: any | null;
  createdAt: string;
  updatedAt: string;
}

// Interface para representar um cliente (shopper)
export interface ShopperData {
  id: number;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
}

// Interface para representar um vendedor (seller)
export interface SellerData {
  id: number;
  name: string;
  nuvemshop_id?: string;
  app_status?: string;
}

// Interface específica para assinaturas de compradores
export interface ShopperSubscription extends BaseSubscription {
  shopper_id: number;
  order_id: number;
  shopper?: ShopperData; // Dados do cliente que podem vir no join
}

// Interface específica para assinaturas de vendedores
export interface SellerSubscription extends BaseSubscription {
  seller_id: number;
  seller?: SellerData; // Dados do vendedor que podem vir no join
}

// Tipo união para representar qualquer tipo de assinatura
export type Subscription = ShopperSubscription | SellerSubscription;

// Para compatibilidade com código existente, mantemos também a interface antiga
export interface LegacySubscription {
  id: string;
  customer: string;
  customerName?: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  billingType: string;
  status: string;
  description?: string;
  dateCreated: string;
  externalReference?: string;
  deleted: boolean;
  object?: string;
}

/**
 * Busca assinaturas conforme o tipo especificado (shopper ou seller)
 * @param type Tipo de assinatura (SHOPPER ou SELLER)
 * @returns Lista de assinaturas
 */
export async function fetchSubscriptions(type: SubscriptionType = SubscriptionType.SHOPPER): Promise<Subscription[]> {
  try {
    // URL é diferente dependendo do tipo de assinatura
    const endpoint = type === SubscriptionType.SHOPPER 
      ? 'app/shopper-subscriptions'
      : 'app/seller-subscriptions';
    
    const response = await fetchWithTimeout(buildApiUrl(endpoint));
    
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erro ao buscar assinaturas (${type}):`, error);
    return [];
  }
}

/**
 * Busca uma assinatura específica pelo ID
 * @param id ID da assinatura (string ou número)
 * @param type Tipo de assinatura (SHOPPER ou SELLER)
 * @returns Detalhes da assinatura
 */
export async function fetchSubscriptionById(
  id: string | number, 
  type: SubscriptionType = SubscriptionType.SHOPPER
): Promise<Subscription | null> {
  try {
    // URL é diferente dependendo do tipo de assinatura
    const endpoint = type === SubscriptionType.SHOPPER 
      ? `app/shopper-subscriptions/${id}`
      : `app/seller-subscriptions/${id}`;
    
    const response = await fetchWithTimeout(buildApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Normaliza a resposta de acordo com a estrutura
    if (data && data.success && data.data) {
      return data.data;
    } else if (data && data.id) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar assinatura ${id} (${type}):`, error);
    return null;
  }
}

/**
 * Busca assinaturas de um cliente específico
 * @param customerId ID do cliente
 * @param type Tipo de assinatura (SHOPPER ou SELLER)
 * @returns Lista de assinaturas do cliente
 */
export async function fetchSubscriptionsByCustomer(
  customerId: string, 
  type: SubscriptionType = SubscriptionType.SHOPPER
): Promise<Subscription[]> {
  try {
    // URL é diferente dependendo do tipo de assinatura
    const endpoint = type === SubscriptionType.SHOPPER 
      ? `app/shopper-subscriptions/shopper/${customerId}`
      : `app/seller-subscriptions/seller/${customerId}`;
    
    const response = await fetchWithTimeout(buildApiUrl(endpoint));
    
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erro ao buscar assinaturas do cliente ${customerId} (${type}):`, error);
    return [];
  }
}

/**
 * Cancela uma assinatura pelo ID
 * @param id ID da assinatura (string ou número)
 * @param type Tipo de assinatura (SHOPPER ou SELLER)
 * @returns Se o cancelamento foi bem-sucedido
 */
export async function cancelSubscription(
  id: string | number, 
  type: SubscriptionType = SubscriptionType.SHOPPER
): Promise<boolean> {
  try {
    const endpoint = type === SubscriptionType.SHOPPER 
      ? `app/shopper-subscriptions/${id}`
      : `app/seller-subscriptions/${id}`;
    
    const response = await fetchWithTimeout(buildApiUrl(endpoint), {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Erro ao cancelar assinatura ${id} (${type}):`, error);
    return false;
  }
}

/**
 * Cria uma assinatura de shopper com base em um pedido existente
 * @param orderId ID do pedido
 * @returns Detalhes da assinatura criada
 */
export async function createShopperSubscriptionFromOrder(orderId: number): Promise<any> {
  try {
    const endpoint = `app/shopper-subscriptions/order/${orderId}`;
    
    const response = await fetchWithTimeout(buildApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error(`Erro ao criar assinatura para o pedido ${orderId}:`, error);
    throw error;
  }
}
