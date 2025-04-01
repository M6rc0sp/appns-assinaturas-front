import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from '@/config/config';

/**
 * Configurações para requisições fetch
 */
interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Executa uma requisição HTTP com timeout
 * @param url URL da requisição
 * @param options Opções do fetch
 * @returns Resposta da requisição
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_FETCH_OPTIONS.timeout, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Processa a resposta da API e extrai os dados independente da estrutura
 */
export async function handleApiResponse<T>(response: Response): Promise<T[]> {
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Tenta extrair os dados do formato mais comum para o mais específico
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && data.data && Array.isArray(data.data.data)) {
    return data.data.data;
  } else if (data && data.success && Array.isArray(data.data)) {
    return data.data;
  }
  
  console.warn('Formato de resposta inesperado:', data);
  return [];
}

/**
 * Processa erro da API e extrai mensagem detalhada
 */
export function handleApiError(response: Response, responseText: string): never {
  let errorDetails = responseText;
  
  try {
    const errorJson = JSON.parse(responseText);
    if (errorJson.message) {
      errorDetails = errorJson.message;
    } else if (errorJson.error) {
      errorDetails = errorJson.error;
    }
  } catch (e) {
    // Se não for um JSON válido, usa o texto bruto
  }
  
  throw new Error(`${response.status} ${response.statusText}: ${errorDetails}`);
}

/**
 * Formata um valor para JSON com tratamento adequado para datas e valores nulos
 */
export function formatJsonRequest(data: any): string {
  return JSON.stringify(data, (key, value) => {
    // Converte Date para string ISO
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
}

/**
 * Constrói uma URL completa para a API
 */
export function buildApiUrl(endpoint: string): string {
  // Remove barras duplicadas caso o endpoint comece com uma
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}
