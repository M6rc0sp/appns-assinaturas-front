<script setup lang="ts">
import { ref, onMounted } from 'vue';

// ID do app fixo
const NUVEMSHOP_APP_ID = import.meta.env.VITE_NUVEMSHOP_APP_ID || '14223';

const isLoading = ref(true);
const errorMessage = ref('');

// Função para redirecionar diretamente para a Nuvem Shop
function handleSetupRedirect() {
  try {
    // URL da loja Nuvem Shop
    const nuvemshopUrl = `https://lojademo146.lojavirtualnuvem.com.br/admin/v2/apps/${NUVEMSHOP_APP_ID}/`;
    
    // Redireciona para a URL da loja Nuvem Shop
    window.location.href = nuvemshopUrl;
  } catch (error) {
    console.error('Erro ao redirecionar para Nuvem Shop:', error);
    errorMessage.value = 'Não foi possível acessar o painel administrativo da loja. Tente novamente mais tarde.';
    isLoading.value = false;
  }
}

// Chama a função de redirecionamento quando o componente for montado
onMounted(handleSetupRedirect);
</script>

<template>
  <div class="setup-page">
    <div class="setup-container">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Redirecionando para o painel administrativo da loja...</p>
      </div>
      
      <div v-if="errorMessage" class="error">
        <h2>Ops! Algo deu errado.</h2>
        <p>{{ errorMessage }}</p>
        <button @click="handleSetupRedirect" class="retry-button">Tentar novamente</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  width: min(100%, 800px);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.setup-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  text-align: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 1rem;
}

.error h2 {
  color: #c62828;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #223;
}
</style>
