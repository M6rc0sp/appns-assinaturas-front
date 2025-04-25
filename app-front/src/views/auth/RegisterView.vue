<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isSubmitting = ref(false)

const passwordsMatch = computed(() => password.value === confirmPassword.value)

async function handleRegister() {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }
  
  if (!passwordsMatch.value) {
    error.value = 'As senhas não correspondem'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    const result = authStore.register(name.value, email.value, password.value)
    
    if (result.success) {
      router.push('/management')
    } else {
      error.value = result.message || 'Erro ao criar conta'
    }
  } catch (err) {
    error.value = 'Ocorreu um erro ao criar sua conta'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-header">
        <h1>Criar Conta</h1>
        <p>Cadastre-se para acessar o painel de gerenciamento</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="name">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            placeholder="Seu nome completo"
            autocomplete="name"
            required
          />
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
            autocomplete="new-password"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirmar Senha</label>
          <input 
            type="password" 
            id="confirm-password" 
            v-model="confirmPassword" 
            placeholder="Confirme sua senha"
            autocomplete="new-password"
            required
            :class="{ 'error': confirmPassword && !passwordsMatch }"
          />
          <span v-if="confirmPassword && !passwordsMatch" class="password-mismatch">
            As senhas não correspondem
          </span>
        </div>
        
        <button 
          type="submit" 
          class="register-button" 
          :disabled="isSubmitting || (!!confirmPassword && !passwordsMatch)"
        >
          {{ isSubmitting ? 'Processando...' : 'Criar Conta' }}
        </button>
      </form>
      
      <div class="register-footer">
        <p>Já tem uma conta? <RouterLink to="/auth/login">Fazer login</RouterLink></p>
        <p><RouterLink to="/">Voltar para Home</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 2rem;
  background-color: #f5f5f5;
}

.register-container {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: #335;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: #666;
}

.register-form {
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

.form-group input.error {
  border-color: #ff6666;
}

.password-mismatch {
  color: #cc3333;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.register-button {
  background-color: #335;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.register-button:hover {
  background-color: #224;
}

.register-button:disabled {
  background-color: #99a;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.register-footer a {
  color: #335;
  text-decoration: none;
}

.register-footer a:hover {
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