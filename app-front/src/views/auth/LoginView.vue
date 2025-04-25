<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    const success = authStore.loginWithCredentials(email.value, password.value)
    
    if (success) {
      // Redireciona para a página de gerenciamento ou para a página que o usuário tentou acessar originalmente
      const redirect = router.currentRoute.value.query.redirect as string || '/management'
      router.push(redirect)
    } else {
      error.value = 'Email ou senha inválidos'
    }
  } catch (err) {
    error.value = 'Ocorreu um erro ao tentar fazer login'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>Login</h1>
        <p>Faça login para acessar o painel de gerenciamento</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Seu email"
            autocomplete="email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Sua senha"
            autocomplete="current-password"
            required
          />
        </div>
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Lembrar-me</span>
          </label>
          
          <a href="#" class="forgot-password">Esqueceu a senha?</a>
        </div>
        
        <button 
          type="submit" 
          class="login-button" 
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Processando...' : 'Entrar' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>Não tem uma conta? <RouterLink to="/auth/register">Criar conta</RouterLink></p>
        <p><RouterLink to="/">Voltar para Home</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 2rem;
  background-color: #f5f5f5;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #335;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #335;
  outline: none;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-password {
  color: #335;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  background-color: #335;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #224;
}

.login-button:disabled {
  background-color: #99a;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-footer a {
  color: #335;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #ffeeee;
  border-left: 4px solid #ff6666;
  color: #cc3333;
  padding: 0.8rem;
  border-radius: 4px;
}
</style>