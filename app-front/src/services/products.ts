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
    return handleApiResponse(response);
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
    return handleApiResponse(response);
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error);
    // Em caso de erro, retorna alguns produtos de exemplo para não quebrar a UI
    return [
      {
        id: 1,
        seller_id: 1,
        name: 'Café Colonial',
        description: 'Um café especial direto da fazenda',
        price: 89.90,
        sale_price: 59.90,
        images: ['https://mercafefaststore.vtexassets.com/arquivos/ids/550089/Cafe_Torrado_e_Moido_3_Coracoes_Estrada_Real_Premium_Pacot.png'],
        variations: ['Café', 'Café com leite'],
        cycle: BillingCycle.MONTHLY,
        active: true,
        featured: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        seller_id: 1,
        name: 'Chá Premium',
        description: 'Chá de ervas selecionadas',
        price: 49.90,
        sale_price: 39.90,
        images: ['https://www.emporiotambo.com.br/wp-content/uploads/2020/07/Cha_Verde_Menta_Leao_Lata_150g_Imagem_1.png'],
        variations: ['Hortelã', 'Camomila', 'Erva-doce'],
        cycle: BillingCycle.MONTHLY,
        active: true,
        featured: false,
        created_at: '2025-02-10T14:30:00Z',
        updated_at: '2025-02-10T14:30:00Z'
      },
      {
        id: 3,
        seller_id: 1,
        name: 'Kit Degustação',
        description: 'Um kit completo para os amantes de bebidas',
        price: 129.90,
        sale_price: 99.90,
        images: ['https://novonegocio.com.br/wp-content/uploads/2013/11/Clube-de-Assinatura-de-Cafe.jpg'],
        variations: ['Kit básico', 'Kit completo'],
        cycle: BillingCycle.MONTHLY,
        active: true,
        featured: true,
        created_at: '2025-03-05T09:15:00Z',
        updated_at: '2025-03-05T09:15:00Z'
      }
    ];
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
    return handleApiResponse(response);
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