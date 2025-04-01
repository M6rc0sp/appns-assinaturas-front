import { handleApiResponse, handleApiError, buildApiUrl, fetchWithTimeout } from './apiUtils';

export interface Seller {
  id: number;
  name?: string;
  nuvemshop_id?: string;
  nuvemshop_api_token?: string;
  app_start_date?: string;
  app_status?: string;
  asaas_customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca todos os vendedores cadastrados
 * @returns Lista de vendedores
 */
export async function fetchSellers(): Promise<Seller[]> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/sellers'));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return [];
  }
}

/**
 * Busca um vendedor específico pelo ID
 * @param id ID do vendedor
 * @returns Detalhes do vendedor
 */
export async function fetchSellerById(id: number): Promise<Seller | null> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/sellers/${id}`));
    
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
    console.error(`Erro ao buscar vendedor ${id}:`, error);
    return null;
  }
}

/**
 * Cria um novo vendedor
 * @param seller Dados do vendedor
 * @returns Vendedor criado
 */
export async function createSeller(seller: Seller): Promise<Seller> {
  try {
    const response = await fetchWithTimeout(buildApiUrl('app/sellers'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seller),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    throw error;
  }
}

/**
 * Atualiza um vendedor existente
 * @param id ID do vendedor
 * @param seller Dados atualizados
 * @returns Vendedor atualizado
 */
export async function updateSeller(id: number, seller: Partial<Seller>): Promise<Seller> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/sellers/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seller),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error(`Erro ao atualizar vendedor ${id}:`, error);
    throw error;
  }
}

/**
 * Exclui um vendedor
 * @param id ID do vendedor
 * @returns Se a exclusão foi bem-sucedida
 */
export async function deleteSeller(id: number): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/sellers/${id}`), {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Erro ao excluir vendedor ${id}:`, error);
    return false;
  }
}

/**
 * Sincroniza um vendedor com o Asaas
 * @param id ID do vendedor
 * @returns Detalhes do vendedor sincronizado
 */
export async function syncSeller(id: number): Promise<Seller> {
  try {
    const response = await fetchWithTimeout(buildApiUrl(`app/sellers/${id}/sync-asaas`), {
      method: 'POST',
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      return handleApiError(response, responseText);
    }
    
    const data = JSON.parse(responseText);
    
    return data.data || data;
  } catch (error) {
    console.error(`Erro ao sincronizar vendedor ${id} com Asaas:`, error);
    throw error;
  }
}
