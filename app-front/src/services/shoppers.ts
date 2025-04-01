import { handleApiResponse, handleApiError, buildApiUrl, fetchWithTimeout } from './apiUtils';

export interface Shopper {
  id: number;
  nuvemshop_id?: string;
  nuvemshop_info?: string;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
  birthDate?: string;
  asaas_customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca todos os compradores cadastrados
 * @returns Lista de compradores
 */
export async function fetchShoppers(): Promise<Shopper[]> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/shoppers'));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Erro ao buscar shoppers:', error);
    return [];
  }
}

/**
 * Busca um comprador específico pelo ID
 * @param id ID do comprador
 * @returns Detalhes do comprador
 */
export async function fetchShopperById(id: number): Promise<Shopper | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/shoppers/${id}`));
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Normaliza a resposta de acordo com a estrutura
    if (data && data.success && data.data) {
      return data.data;
    } else if (data && data.id) {
      return data;
    }
    
    return null;
  } catch (error: any) {
    // Melhor mensagem de erro
    if (error.name === 'AbortError') {
      console.error(`Timeout ao buscar comprador ${id}`);
      throw new Error('Tempo esgotado ao buscar os dados do cliente');
    }
    console.error(`Erro ao buscar comprador ${id}:`, error);
    throw error; // Propaga o erro para ser tratado no componente
  }
}

/**
 * Cria um novo comprador
 * @param shopper Dados do comprador
 * @returns Comprador criado
 */
export async function createShopper(shopper: Shopper): Promise<Shopper> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/shoppers'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopper),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error('Erro ao criar comprador:', error);
    throw error;
  }
}

/**
 * Atualiza um comprador existente
 * @param id ID do comprador
 * @param shopper Dados atualizados
 * @returns Comprador atualizado
 */
export async function updateShopper(id: number, shopper: Partial<Shopper>): Promise<Shopper> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/shoppers/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopper),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error(`Erro ao atualizar comprador ${id}:`, error);
    throw error;
  }
}

/**
 * Sincroniza um comprador com o Asaas
 * @param id ID do comprador
 * @returns Detalhes do comprador sincronizado
 */
export async function syncShopper(id: number): Promise<Shopper> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/shoppers/${id}/sync-asaas`), {
      method: 'POST',
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error(`Erro ao sincronizar comprador ${id} com Asaas:`, error);
    throw error;
  }
}
