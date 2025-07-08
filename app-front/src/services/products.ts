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

// Interface para o formato da API atual
export interface ApiProduct {
  id: number;
  seller_id: string | number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  sku?: string;
  categories?: string;
  images: string[] | null;
  createdAt?: string;
  updatedAt?: string;
  // outros campos possíveis da API
}

// Função adaptadora para converter o formato da API para o formato esperado pelo front-end
function adaptProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    seller_id: Number(apiProduct.seller_id),
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: apiProduct.price,
    sale_price: undefined, // A API atual não fornece este campo
    images: apiProduct.images || [], // Se for null, use array vazio
    variations: apiProduct.categories ? apiProduct.categories.split(' > ') : [],
    cycle: BillingCycle.MONTHLY, // Definindo um valor padrão
    active: true, // Definindo um valor padrão
    featured: false, // Definindo um valor padrão
    created_at: apiProduct.createdAt || new Date().toISOString(),
    updated_at: apiProduct.updatedAt || new Date().toISOString()
  };
}

// Função para adaptar um array de produtos da API
function adaptProductList(apiProducts: ApiProduct[]): Product[] {
  return apiProducts.map(adaptProduct);
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
    return Array.isArray(data) ? adaptProductList(data) : [];
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
    return Array.isArray(data) ? adaptProductList(data) : [];
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error);
    // Retorna uma lista vazia em vez de produtos mockados
    return [];
  }
}

/**
 * Busca um produto pelo ID
 * @param id ID do produto
 * @returns Detalhes do produto ou null se não encontrado
 */
export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/products/${id}`));
    
    // Capturando possíveis erros na resposta HTTP
    if (!response.ok) {
      console.error(`[DEBUG PRODUCT] Erro HTTP ao buscar produto ${id}:`, response.status, response.statusText);
      return null;
    }

    // Processando a resposta diretamente, sem logs excessivos
    let rawData = await handleApiResponse<any>(response);
    
    // Tentativa específica para o formato appns {success: true, data: produto}
    if (rawData && typeof rawData === 'object' && 'success' in rawData && rawData.success === true && 'data' in rawData) {
      rawData = rawData.data;
    }
    
    // Se temos um objeto com ID, é um produto válido
    if (rawData && typeof rawData === 'object' && 'id' in rawData) {
      return adaptProduct(rawData as ApiProduct);
    }
    
    console.error('[DEBUG PRODUCT] Formato de produto não reconhecido:', typeof rawData);
    return null;
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    return null;
  }
}

/**
 * Interface para resposta da API ao buscar seller do produto
 */
export interface ProductSellerResponse {
  success: boolean;
  data: {
    product: {
      id: number;
      name: string;
      seller_id: number;
    };
    seller: {
      id: number;
      user_id: number;
      nuvemshop_id: string;
      nuvemshop_info?: string;
      subaccount_id?: string;
      app_status: string;
      created_at: string;
      updated_at: string;
    };
  };
}

/**
 * Busca o seller (vendedor) de um produto específico
 * @param productId ID do produto
 * @returns Informações do produto e seu seller
 */
export async function fetchProductSeller(productId: number): Promise<{ sellerId: number; product: any; seller: any } | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`products/${productId}/seller`));
    
    if (!response.ok) {
      console.error(`[DEBUG PRODUCT SELLER] Erro HTTP ao buscar seller do produto ${productId}:`, response.status, response.statusText);
      return null;
    }

    const data = await handleApiResponse<any>(response);
    
    console.log('[DEBUG PRODUCT SELLER] Dados do seller recebidos:', data);
    
    // Extrair dados se estiver no formato {success: true, data: {...}}
    let responseData = data;
    if (data && typeof data === 'object' && 'success' in data && data.success === true && 'data' in data) {
      responseData = data.data;
    }
    
    if (responseData && 'product' in responseData && 'seller' in responseData) {
      return {
        sellerId: responseData.seller.id,
        product: responseData.product,
        seller: responseData.seller
      };
    }
    
    console.error('[DEBUG PRODUCT SELLER] Formato de resposta não reconhecido:', responseData);
    return null;
  } catch (error) {
    console.error(`Erro ao buscar seller do produto ${productId}:`, error);
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