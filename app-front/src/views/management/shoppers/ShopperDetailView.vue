<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchShopperById, syncShopper, type Shopper } from '@/services/shoppers';
import { fetchSubscriptionsByCustomer, SubscriptionType, type Subscription } from '@/services/subscriptions';

const route = useRoute();
const router = useRouter();
const shopper = ref<Shopper | null>(null);
const subscriptions = ref<Subscription[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const syncing = ref(false);
const loadingSubscriptions = ref(false);

const shopperId = computed(() => Number(route.params.id));

async function loadShopper() {
  loading.value = true;
  error.value = null;
  
  try {
    shopper.value = await fetchShopperById(shopperId.value);
    
    if (!shopper.value) {
      error.value = 'Cliente não encontrado';
    } else {
      // Carregar assinaturas do cliente
      await loadShopperSubscriptions();
    }
  } catch (err: any) {
    // Melhor tratamento de erro com mensagem mais específica
    error.value = `Erro ao carregar detalhes do cliente: ${err.message || 'Erro desconhecido'}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function loadShopperSubscriptions() {
  loadingSubscriptions.value = true;
  
  try {
    subscriptions.value = await fetchSubscriptionsByCustomer(
      String(shopperId.value), 
      SubscriptionType.SHOPPER
    );
  } catch (err) {
    console.error('Erro ao carregar assinaturas do cliente:', err);
  } finally {
    loadingSubscriptions.value = false;
  }
}

async function handleSyncWithAsaas() {
  if (!shopper.value) return;
  
  syncing.value = true;
  try {
    const updatedShopper = await syncShopper(shopper.value.id);
    shopper.value = updatedShopper;
    alert('Cliente sincronizado com sucesso!');
  } catch (err) {
    alert('Erro ao sincronizar com Asaas');
    console.error(err);
  } finally {
    syncing.value = false;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

onMounted(() => {
  loadShopper();
});
</script>

<template>
  <div class="shopper-detail">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Detalhes do Cliente</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando detalhes...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadShopper" class="btn-retry">Tentar novamente</button>
      <button @click="router.push('/management/shoppers')" class="btn-return">Voltar à lista</button>
    </div>

    <div v-else-if="shopper" class="detail-card">
      <div class="detail-header">
        <h2>{{ shopper.name }}</h2>
        <div class="badge" :class="shopper.asaas_customer_id ? 'badge-active' : 'badge-pending'">
          {{ shopper.asaas_customer_id ? 'Sincronizado' : 'Não Sincronizado' }}
        </div>
      </div>

      <div class="detail-section">
        <h3>Informações Pessoais</h3>
        <div class="detail-row">
          <span class="detail-label">Nome:</span>
          <span class="detail-value">{{ shopper.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">E-mail:</span>
          <span class="detail-value">{{ shopper.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">CPF/CNPJ:</span>
          <span class="detail-value">{{ shopper.cpfCnpj }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Telefone:</span>
          <span class="detail-value">{{ shopper.mobilePhone }}</span>
        </div>
        <div class="detail-row" v-if="shopper.birthDate">
          <span class="detail-label">Data de Nascimento:</span>
          <span class="detail-value">{{ formatDate(shopper.birthDate) }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Endereço</h3>
        <div class="detail-row">
          <span class="detail-label">Logradouro:</span>
          <span class="detail-value">{{ shopper.address || 'Não informado' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Número:</span>
          <span class="detail-value">{{ shopper.addressNumber || 'Não informado' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bairro:</span>
          <span class="detail-value">{{ shopper.province || 'Não informado' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">CEP:</span>
          <span class="detail-value">{{ shopper.postalCode || 'Não informado' }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Integração</h3>
        <div class="detail-row">
          <span class="detail-label">ID no Sistema:</span>
          <span class="detail-value">{{ shopper.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID na Nuvemshop:</span>
          <span class="detail-value">{{ shopper.nuvemshop_id || 'Não disponível' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID no Asaas:</span>
          <span class="detail-value">{{ shopper.asaas_customer_id || 'Não sincronizado' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Criado em:</span>
          <span class="detail-value">{{ formatDate(shopper.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Atualizado em:</span>
          <span class="detail-value">{{ formatDate(shopper.updatedAt) }}</span>
        </div>
        <div v-if="!shopper.asaas_customer_id" class="synchronize-panel">
          <p>Este cliente ainda não foi sincronizado com o Asaas.</p>
          <button @click="handleSyncWithAsaas" class="btn-sync" :disabled="syncing">
            {{ syncing ? 'Sincronizando...' : 'Sincronizar com Asaas' }}
          </button>
        </div>
      </div>

      <div class="detail-section">
        <h3>Assinaturas</h3>
        <div v-if="loadingSubscriptions" class="loading-mini">
          <div class="loading-spinner-small"></div>
          <p>Carregando assinaturas...</p>
        </div>
        <div v-else-if="subscriptions.length === 0" class="empty-info">
          <p>Este cliente não possui assinaturas ativas.</p>
        </div>
        <div v-else class="subscriptions-list">
          <div v-for="sub in subscriptions" :key="sub.id" class="subscription-item">
            <div class="sub-header">
              <h4>{{ sub.plan_name }}</h4>
              <div class="status-badge" :class="`status-${sub.status.toLowerCase()}`">
                {{ sub.status === 'ACTIVE' ? 'Ativa' : sub.status }}
              </div>
            </div>
            <div class="sub-details">
              <div class="sub-detail">
                <span class="sub-label">Valor:</span>
                <span class="sub-value">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sub.value)) }}</span>
              </div>
              <div class="sub-detail">
                <span class="sub-label">Próximo Vencimento:</span>
                <span class="sub-value">{{ formatDate(sub.next_due_date) }}</span>
              </div>
              <div class="sub-detail">
                <span class="sub-label">ID:</span>
                <span class="sub-value">{{ sub.id }}</span>
              </div>
            </div>
            <div class="sub-actions">
              <RouterLink :to="`/subscriptions/${sub.id}`" class="btn-view-sub">
                Ver Detalhes
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-actions">
        <RouterLink :to="`/management/shoppers/${shopper.id}/edit`" class="btn-edit">
          Editar Cliente
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shopper-detail {
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

.loading-spinner-small {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
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

.loading-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.loading-mini p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.empty-info {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
  text-align: center;
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #eee;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sub-header h4 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.status-inactive {
  background-color: #eeeeee;
  color: #757575;
}

.status-overdue {
  background-color: #ffebee;
  color: #c62828;
}

.sub-details {
  margin-bottom: 0.5rem;
}

.sub-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.sub-label {
  color: #666;
}

.sub-value {
  font-weight: 500;
}

.sub-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-view-sub {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-decoration: none;
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
