<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Atualizar a importação para usar o novo tipo de assinatura
import { fetchSubscriptionById, cancelSubscription, SubscriptionType, type Subscription } from '@/services/subscriptions';

const route = useRoute();
const router = useRouter();
const subscription = ref<Subscription | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const cancelling = ref(false);
const showConfirmDialog = ref(false);
const subscriptionType = ref<SubscriptionType>(SubscriptionType.SHOPPER);

// Corrigir o tipo aqui, convertendo o param para string
const subscriptionId = computed(() => String(route.params.id));

const formattedValue = computed(() => {
  if (!subscription.value) return '';
  
  const value = typeof subscription.value.value === 'string' 
    ? parseFloat(subscription.value.value) 
    : subscription.value.value;
    
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
});

const formattedDate = computed(() => {
  if (!subscription.value?.next_due_date) return '';
  return new Date(subscription.value.next_due_date).toLocaleDateString('pt-BR');
});

const createdAtFormatted = computed(() => {
  if (!subscription.value?.createdAt) return '';
  return new Date(subscription.value.createdAt).toLocaleDateString('pt-BR');
});

const statusText = computed(() => {
  if (!subscription.value) return '';
  
  const status = subscription.value.status.toUpperCase();
  
  switch (status) {
    case 'ACTIVE':
      return 'Ativa';
    case 'INACTIVE':
      return 'Inativa';
    case 'OVERDUE':
      return 'Em atraso';
    default:
      return status;
  }
});

const cycleText = computed(() => {
  if (!subscription.value) return '';
  
  switch (subscription.value.cycle) {
    case 'WEEKLY':
      return 'Semanal';
    case 'BIWEEKLY':
      return 'Quinzenal';
    case 'MONTHLY':
      return 'Mensal';
    case 'QUARTERLY':
      return 'Trimestral';
    case 'SEMIANNUALLY':
      return 'Semestral';
    case 'YEARLY':
      return 'Anual';
    default:
      return subscription.value.cycle;
  }
});

const paymentMethodText = computed(() => {
  if (!subscription.value) return '';
  
  switch (subscription.value.billing_type) {
    case 'BOLETO':
      return 'Boleto';
    case 'CREDIT_CARD':
      return 'Cartão de Crédito';
    case 'PIX':
      return 'Pix';
    default:
      return subscription.value.billing_type;
  }
});

const customerId = computed(() => {
  if (!subscription.value) return '';
  
  // Para assinaturas de shoppers
  if ('shopper_id' in subscription.value) {
    return subscription.value.shopper_id;
  }
  // Para assinaturas de sellers
  else if ('seller_id' in subscription.value) {
    return subscription.value.seller_id;
  }
  
  return '';
});

const customerType = computed(() => {
  if (!subscription.value) return '';
  
  // Para assinaturas de shoppers
  if ('shopper_id' in subscription.value) {
    return 'Cliente';
  }
  // Para assinaturas de sellers
  else if ('seller_id' in subscription.value) {
    return 'Vendedor';
  }
  
  return 'Cliente/Vendedor';
});

async function loadSubscription() {
  loading.value = true;
  error.value = null;
  
  try {
    subscription.value = await fetchSubscriptionById(subscriptionId.value, subscriptionType.value);
    
    if (!subscription.value) {
      error.value = 'Assinatura não encontrada';
    }
    
    // Determinar o tipo de assinatura com base na resposta
    if (subscription.value) {
      if ('shopper_id' in subscription.value) {
        subscriptionType.value = SubscriptionType.SHOPPER;
      } else if ('seller_id' in subscription.value) {
        subscriptionType.value = SubscriptionType.SELLER;
      }
    }
  } catch (err) {
    error.value = 'Erro ao carregar detalhes da assinatura';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleCancelSubscription() {
  cancelling.value = true;
  
  try {
    const success = await cancelSubscription(subscriptionId.value, subscriptionType.value);
    if (success) {
      alert('Assinatura cancelada com sucesso!');
      router.push('/subscriptions');
    } else {
      alert('Não foi possível cancelar a assinatura. Tente novamente.');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao cancelar assinatura.');
  } finally {
    cancelling.value = false;
    showConfirmDialog.value = false;
  }
}

onMounted(() => {
  loadSubscription();
});
</script>

<template>
  <div class="subscription-detail">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Detalhes da Assinatura</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando detalhes...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadSubscription" class="btn-retry">Tentar novamente</button>
      <button @click="router.push('/subscriptions')" class="btn-return">Voltar à lista</button>
    </div>

    <div v-else-if="subscription" class="detail-card">
      <div class="detail-header">
        <h2>{{ subscription.plan_name }}</h2>
        <div class="status-badge" :class="`status-${subscription.status.toLowerCase()}`">
          {{ statusText }}
        </div>
      </div>

      <div class="detail-section">
        <h3>Informações da assinatura</h3>
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{ subscription.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID Externo:</span>
          <span class="detail-value">{{ subscription.external_id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor:</span>
          <span class="detail-value">{{ formattedValue }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Próximo vencimento:</span>
          <span class="detail-value">{{ formattedDate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ciclo:</span>
          <span class="detail-value">{{ cycleText }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Forma de pagamento:</span>
          <span class="detail-value">{{ paymentMethodText }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data de criação:</span>
          <span class="detail-value">{{ createdAtFormatted }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>{{ customerType }}</h3>
        <div class="detail-row">
          <span class="detail-label">ID do {{ customerType }}:</span>
          <span class="detail-value">{{ customerId }}</span>
        </div>
        <div class="detail-row" v-if="'order_id' in subscription">
          <span class="detail-label">ID do Pedido:</span>
          <span class="detail-value">{{ subscription.order_id }}</span>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn-cancel" @click="showConfirmDialog = true" :disabled="cancelling">
          {{ cancelling ? 'Cancelando...' : 'Cancelar assinatura' }}
        </button>
      </div>
    </div>

    <!-- Confirmação de cancelamento -->
    <div v-if="showConfirmDialog" class="confirm-dialog-backdrop">
      <div class="confirm-dialog">
        <h3>Confirmar cancelamento</h3>
        <p>Tem certeza que deseja cancelar esta assinatura?</p>
        <p>Esta ação não pode ser desfeita.</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="showConfirmDialog = false">Não, manter assinatura</button>
          <button class="btn-danger" @click="handleCancelSubscription" :disabled="cancelling">
            {{ cancelling ? 'Cancelando...' : 'Sim, cancelar assinatura' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-detail {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
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

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
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

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-cancel {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #ffcdd2;
}

.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.confirm-dialog {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.confirm-dialog h3 {
  margin-top: 0;
  color: #c62828;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.debug-section {
  display: none; /* Ocultar seção de debug, mas manter o CSS para referência futura */
}
</style>
