<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchSubscriptions, SubscriptionType } from '@/services/subscriptions';
import type { Subscription } from '@/services/subscriptions';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard.vue';

const subscriptions = ref<Subscription[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const subscriptionType = ref<SubscriptionType>(SubscriptionType.SHOPPER);

async function loadSubscriptions() {
  loading.value = true;
  error.value = null;
  
  try {
    // Carrega especificamente as assinaturas de shoppers
    const response = await fetchSubscriptions(subscriptionType.value);
    
    if (Array.isArray(response)) {
      subscriptions.value = response.filter(item => 
        typeof item === 'object' && 
        item !== null && 
        'id' in item
      );
      
      if (response.length > 0 && subscriptions.value.length === 0) {
        error.value = 'Dados recebidos da API não estão no formato esperado';
      }
    } else {
      error.value = 'Resposta da API não é um array';
      console.error('Resposta da API não é um array:', response);
    }
  } catch (err) {
    error.value = 'Erro ao carregar assinaturas. Por favor, tente novamente.';
    console.error('Erro completo:', err);
  } finally {
    loading.value = false;
  }
}

function toggleSubscriptionType() {
  subscriptionType.value = subscriptionType.value === SubscriptionType.SHOPPER 
    ? SubscriptionType.SELLER 
    : SubscriptionType.SHOPPER;
  loadSubscriptions();
}

onMounted(() => {
  loadSubscriptions();
});
</script>

<template>
  <div class="subscriptions-container">
    <div class="page-header">
      <h1>Assinaturas</h1>
      <div class="action-buttons">
        <button class="btn-type" @click="toggleSubscriptionType">
          {{ subscriptionType === 'shopper' ? 'Ver assinaturas de vendedores' : 'Ver assinaturas de compradores' }}
        </button>
        <button class="btn-refresh" @click="loadSubscriptions">Atualizar</button>
      </div>
    </div>

    <div class="current-view-indicator">
      <p>Visualizando assinaturas de <strong>{{ subscriptionType === 'shopper' ? 'compradores' : 'vendedores' }}</strong></p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando assinaturas...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadSubscriptions" class="btn-retry">Tentar novamente</button>
    </div>

    <div v-else-if="subscriptions.length === 0" class="empty-container">
      <p>Nenhuma assinatura encontrada.</p>
    </div>

    <div v-else class="subscription-list">
      <SubscriptionCard 
        v-for="subscription in subscriptions" 
        :key="subscription.id" 
        :subscription="subscription" 
      />
    </div>
  </div>
</template>

<style scoped>
.subscriptions-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-refresh:hover {
  opacity: 0.9;
}

.loading-container, .error-container, .empty-container {
  text-align: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.subscription-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .subscription-list {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .btn-refresh {
    flex: 1;
  }
}

.btn-type {
  background-color: #607d8b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.current-view-indicator {
  background-color: #f0f7ff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #335;
}
</style>
