import { handleApiError } from './apiUtils';
import { buildApiUrl, fetchWithTimeout } from './apiUtils';

export interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
  description: string;
}

// Novo contrato do backend para criação de pedido
export interface CreateOrderPayload {
  product_id: number; // obrigatório
  shopper_id: number; // obrigatório
  value?: number;     // opcional
  customer_info?: any; // opcional
}

export interface Order {
  id: number;
  seller_id: number;
  shopper_id: number;
  external_id?: string;
  products: any; // Pode ser array de números ou objetos
  value: number;
  status: string;
  cycle: string;
  next_due_date: string;
  start_date: string;
  end_date?: string | null;
  payment_method?: string | null;
  billing_type: string;
  created_at: string;
  updated_at?: string;
  customer_info: any; // Adicionando campo obrigatório
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/products'));

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Aceita payload novo e faz compat com legado transformando internamente
export async function createOrder(orderData: CreateOrderPayload): Promise<any> {
  try {
    // Garante apenas os campos permitidos pelo novo contrato
    const payload: CreateOrderPayload = {
      product_id: Number(orderData.product_id),
      shopper_id: Number(orderData.shopper_id),
      value: typeof orderData.value === 'number' ? orderData.value : undefined,
      customer_info: orderData.customer_info ?? undefined,
    };

    console.log('Enviando dados para criação de pedido:', payload);

    const response = await fetchWithTimeout(buildApiUrl('app/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Captura o texto da resposta primeiro
    const responseText = await response.text();
    console.log('Resposta bruta da API:', responseText);

    if (!response.ok) {
      return handleApiError(response, responseText);
    }

    // Converte texto para JSON apenas se a resposta for OK
    try {
      // Retorna o objeto completo para que o componente possa extrair o que precisar
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Erro ao parsear resposta JSON:', e);
      throw new Error(`Erro ao processar resposta da API: ${responseText}`);
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error; // Propaga o erro com detalhes para o componente
  }
}

/**
 * Exclui um pedido pelo ID
 * @param id ID do pedido
 * @returns Indica se a exclusão foi bem-sucedida
 */
export async function deleteOrder(id: number | string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/orders/${id}`), {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error(`Erro ao excluir pedido ${id}:`, error);
    return false;
  }
}

/**
 * Busca um pedido específico pelo ID
 * @param id ID do pedido
 * @returns Detalhes do pedido
 */
export async function fetchOrderById(id: number | string): Promise<Order | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/orders/${id}`));

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.id) {
      return data;
    } else if (data && data.data && data.data.id) {
      return data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar pedido ${id}:`, error);
    return null;
  }
}

/**
 * Busca todos os pedidos
 * @returns Lista de pedidos
 */
export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/orders'));

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Formato de resposta inesperado:', data);
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
}
