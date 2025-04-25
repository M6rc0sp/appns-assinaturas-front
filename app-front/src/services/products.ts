import { handleApiResponse, handleApiError, buildApiUrl, fetchWithTimeout } from './apiUtils';
import { BillingCycle, PaymentMethod } from '@/config/config';

// Interfaces de Produto
export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  images: string[];
  variations?: string[];
  cycle?: BillingCycle;
  active: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Interfaces de Pedido e Assinatura
export interface ShopperData {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
}

export interface CardInfo {
  number: string;
  holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
}

export interface SubscriptionData {
  plan_name: string;
  billing_type: PaymentMethod;
  cycle: BillingCycle;
}

export interface PaymentData {
  payment_method: PaymentMethod;
  card_info?: CardInfo;
}

export interface OrderRequest {
  seller_id: number;
  shopper: ShopperData;
  products: number[];
  subscription: SubscriptionData;
  payment: PaymentData;
}

/**
 * Busca todos os produtos disponíveis
 * @returns Lista de produtos
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/products'));
    const data = await handleApiResponse(response);
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

/**
 * Busca produtos públicos disponíveis para assinatura
 * @returns Lista de produtos públicos
 */
export async function fetchPublicProducts(): Promise<Product[]> {
  try {
    // Utiliza a mesma API de produtos, mas poderia ter uma API específica para produtos públicos
    const response = await fetchWithTimeout(buildApiUrl('app/products/public'));
    const data = await handleApiResponse(response);
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error);
    // Retorna uma lista vazia em vez de produtos mockados
    return [];
  }
}

/**
 * Busca um produto pelo ID
 * @param id ID do produto
 * @returns Detalhes do produto
 */
export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/products/${id}`));
    return handleApiResponse(response) as unknown as Promise<Product>;
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    return null;
  }
}

/**
 * Cria um novo pedido com assinatura para um cliente não-autenticado
 * @param orderData Dados do pedido com assinatura
 * @returns Resultado da operação
 */
export async function createPublicOrderWithSubscription(orderData: OrderRequest): Promise<any> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/public/checkout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erro ao criar pedido com assinatura:', error);
    throw new Error('Não foi possível processar o pedido. Por favor, tente novamente.');
  }
}