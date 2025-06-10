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
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'AbortError') {
      throw new Error(`Tempo limite excedido ao acessar ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Processa a resposta da API e extrai os dados independente da estrutura
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error('[DEBUG API] Resposta HTTP não OK:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    try {
      // Tenta ler o corpo da resposta para mostrar detalhes do erro
      const errorText = await response.text();
      console.error('[DEBUG API] Corpo da resposta de erro:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[DEBUG API] Erro JSON parseado:', errorJson);
      } catch (parseError) {
        // Não é JSON válido, já exibimos o texto bruto acima
      }
      
      throw new Error(`Error HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    } catch (textError) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Captura o texto da resposta primeiro para debug
  let responseText;
  try {
    responseText = await response.text();
    console.log('[DEBUG API] Resposta em texto bruto:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
  } catch (textError) {
    console.error('[DEBUG API] Erro ao ler texto da resposta:', textError);
    throw new Error('Erro ao ler dados da resposta');
  }
  
  // Tenta parsear o JSON
  let data;
  try {
    data = JSON.parse(responseText);
    console.log('[DEBUG API] Resposta JSON parseada:', data);
  } catch (jsonError) {
    console.error('[DEBUG API] Erro ao parsear JSON:', jsonError, 'Texto recebido:', responseText);
    throw new Error('Resposta inválida: não é um JSON válido');
  }
  
  // Tenta extrair os dados do formato mais comum para o mais específico
  console.log('[DEBUG API] Estrutura da resposta:', {
    isArray: Array.isArray(data),
    hasDataProperty: data && typeof data.data !== 'undefined',
    hasSuccessProperty: data && typeof data.success !== 'undefined',
    dataType: data && data.data ? typeof data.data : 'undefined'
  });
  
  if (Array.isArray(data)) {
    return data as T;
  } else if (data && Array.isArray(data.data)) {
    return data.data as T;
  } else if (data && data.data && Array.isArray(data.data.data)) {
    return data.data.data as T;
  } else if (data && data.success && Array.isArray(data.data)) {
    return data.data as T;
  } else if (data && data.success && data.data && typeof data.data === 'object') {
    // Novo caso: quando a resposta é {success: true, data: {objeto}}
    return data as T; // Retornamos o objeto completo aqui para preservar a estrutura success + data
  }
  
  // Se nenhum dos formatos acima for reconhecido, retorna o próprio data
  console.warn('[DEBUG API] Formato de resposta inesperado, usando dados brutos:', data);
  return data as T;
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

/**
 * Executa uma requisição HTTP genérica para a API
 * @param endpoint Endpoint da API (ex: '/app/seller/1/payment-methods')
 * @param options Opções da requisição
 * @returns Dados tipados da resposta
 */
export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  
  console.log('[DEBUG API] Iniciando requisição para:', { 
    endpoint, 
    url, 
    options: {
      method: options.method || 'GET',
      headers: options.headers || DEFAULT_FETCH_OPTIONS.headers,
      timeout: options.timeout || DEFAULT_FETCH_OPTIONS.timeout
    }
  });
  
  try {
    const response = await fetchWithTimeout(url, {
      ...DEFAULT_FETCH_OPTIONS,
      ...options
    });
    
    console.log('[DEBUG API] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const result = await handleApiResponse<T>(response);
    console.log('[DEBUG API] Dados processados:', result);
    return result;
  } catch (error) {
    console.error('[DEBUG API] Erro na requisição:', {
      url,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    });
    throw error;
  }
}
