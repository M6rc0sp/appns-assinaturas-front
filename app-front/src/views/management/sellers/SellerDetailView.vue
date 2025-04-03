<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchSellerById, syncSeller, type Seller } from '@/services/sellers';

const route = useRoute();
const router = useRouter();
const seller = ref<Seller | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const syncing = ref(false);

const sellerId = computed(() => Number(route.params.id));

async function loadSeller() {
  loading.value = true;
  error.value = null;
  
  try {
    seller.value = await fetchSellerById(sellerId.value);
    
    if (!seller.value) {
      error.value = 'Vendedor não encontrado';
    }
  } catch (err) {
    error.value = 'Erro ao carregar detalhes do vendedor';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleSyncWithAsaas() {
  if (!seller.value) return;
  
  syncing.value = true;
  try {
    const updatedSeller = await syncSeller(seller.value.id);
    seller.value = updatedSeller;
    alert('Vendedor sincronizado com sucesso!');
  } catch (err) {
    alert('Erro ao sincronizar com Asaas');
    console.error(err);
  } finally {
    syncing.value = false;
  }
}

onMounted(() => {
  loadSeller();
});
</script>

<template>
  <div class="seller-detail">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Detalhes do Vendedor</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando detalhes...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadSeller" class="btn-retry">Tentar novamente</button>
      <button @click="router.push('/management/sellers')" class="btn-return">Voltar à lista</button>
    </div>

    <div v-else-if="seller" class="detail-card">
      <div class="detail-header">
        <h2>{{ seller.name || 'Vendedor #' + seller.id }}</h2>
        <div class="badge" :class="[seller.app_status ? 'badge-' + seller.app_status.toLowerCase() : 'badge-unknown']">
          {{ seller.app_status || 'Status desconhecido' }}
        </div>
      </div>

      <div class="detail-section">
        <h3>Informações do vendedor</h3>
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{ seller.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data de início:</span>
          <span class="detail-value">{{ seller.app_start_date ? new Date(seller.app_start_date).toLocaleDateString('pt-BR') : 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Criado em:</span>
          <span class="detail-value">{{ seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('pt-BR') : 'N/A' }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Integração Nuvemshop</h3>
        <div class="detail-row">
          <span class="detail-label">ID na Nuvemshop:</span>
          <span class="detail-value">{{ seller.nuvemshop_id || 'Não configurado' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Token API:</span>
          <span class="detail-value">{{ seller.nuvemshop_api_token ? '••••••••' + seller.nuvemshop_api_token.slice(-4) : 'Não configurado' }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Integração Asaas</h3>
        <div class="detail-row">
          <span class="detail-label">ID no Asaas:</span>
          <span class="detail-value">{{ seller.payments_customer_id || 'Não sincronizado' }}</span>
        </div>
        <div v-if="!seller.payments_customer_id" class="synchronize-panel">
          <p>Este vendedor ainda não foi sincronizado com o Asaas.</p>
          <button @click="handleSyncWithAsaas" class="btn-sync" :disabled="syncing">
            {{ syncing ? 'Sincronizando...' : 'Sincronizar com Asaas' }}
          </button>
        </div>
      </div>

      <div class="detail-actions">
        <RouterLink :to="`/management/sellers/${seller.id}/edit`" class="btn-edit">
          Editar Vendedor
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seller-detail {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.btn-back {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-back:hover {
  background-color: #f0f0f0;
}

.loading-container, .error-container {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry, .btn-return {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;
}

.detail-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.detail-header h2 {
  margin: 0;
  color: #333;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
}

.badge-active {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.badge-pending {
  background-color: #fff3e0;
  color: #e65100;
}

.badge-inactive {
  background-color: #f5f5f5;
  color: #757575;
}

.badge-unknown {
  background-color: #e0e0e0;
  color: #616161;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #335;
  font-size: 1.2rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  flex: 0 0 200px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #333;
}

.synchronize-panel {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.btn-sync {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-sync:hover:not(:disabled) {
  background-color: #f57c00;
}

.btn-sync:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-edit {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-edit:hover {
  background-color: #f57c00;
}
</style>
