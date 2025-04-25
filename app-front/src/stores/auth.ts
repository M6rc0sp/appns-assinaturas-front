import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AUTH_CONFIG, UserRole } from '@/config/config'

// Interface para o usuário
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

// Interface para o estado de autenticação armazenado
interface AuthState {
  user: User | null
  token: string | null
  expires: number | null
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const expires = ref<number | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!user.value && !!token.value && (expires.value ?? 0) > Date.now()
  })

  const isAdmin = computed(() => {
    return user.value?.role === UserRole.ADMIN
  })

  // Ações
  function initialize() {
    // Carrega dados do localStorage
    const stored = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY)
    if (stored) {
      try {
        const data: AuthState = JSON.parse(stored)
        
        // Verifica se o token expirou
        if (data.expires && data.expires > Date.now()) {
          user.value = data.user
          token.value = data.token
          expires.value = data.expires
        } else {
          // Se expirou, limpa o localStorage
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY)
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error)
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY)
      }
    }
  }

  function login(userData: User, authToken: string) {
    user.value = userData
    token.value = authToken
    expires.value = Date.now() + AUTH_CONFIG.TOKEN_EXPIRATION
    
    // Salva no localStorage
    saveToStorage()
    
    return true
  }

  function loginWithCredentials(email: string, password: string) {
    // Como estamos simulando, vamos criar usuários fixos para teste
    // Em uma aplicação real, isso seria uma requisição à API
    
    // Admin user
    if (email === 'admin@example.com' && password === 'admin123') {
      return login(
        { 
          id: 1, 
          name: 'Administrador', 
          email: 'admin@example.com', 
          role: UserRole.ADMIN 
        }, 
        'fake-jwt-token-admin'
      )
    }
    
    // Regular user
    if (email === 'user@example.com' && password === 'user123') {
      return login(
        { 
          id: 2, 
          name: 'Usuário Padrão', 
          email: 'user@example.com', 
          role: UserRole.USER 
        }, 
        'fake-jwt-token-user'
      )
    }
    
    // Falha de login
    return false
  }

  function logout() {
    user.value = null
    token.value = null
    expires.value = null
    
    // Remove do localStorage
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY)
  }

  function saveToStorage() {
    const data: AuthState = {
      user: user.value,
      token: token.value,
      expires: expires.value
    }
    
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(data))
  }

  function register(name: string, email: string, password: string) {
    // Em uma aplicação real, isso enviaria os dados para API
    // Para simular, vamos apenas criar um usuário básico
    
    // Simula verificação de e-mail existente
    if (email === 'admin@example.com' || email === 'user@example.com') {
      return { success: false, message: 'Email já cadastrado' }
    }
    
    // Criar um novo usuário
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 10, // ID aleatório
      name,
      email,
      role: UserRole.USER // Por padrão, novos registros são usuários comuns
    }
    
    // Login automático após registro
    login(newUser, 'fake-jwt-token-' + Date.now())
    
    return { success: true }
  }

  return { 
    user, 
    token, 
    isAuthenticated, 
    isAdmin,
    initialize, 
    login,
    loginWithCredentials,
    logout,
    register
  }
})