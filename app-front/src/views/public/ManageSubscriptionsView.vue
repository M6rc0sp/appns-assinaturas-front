<template>
  <div class="manage-subscriptions">
    <div class="page-header">
      <h1>Gerenciar Assinaturas</h1>
      <p class="subtitle">Visualize e gerencie suas assinaturas ativas</p>
    </div>
    
    <div v-if="error" class="error-alert">
      <p>{{ error }}</p>
      <button @click="error = null" class="close-button">×</button>
    </div>
    
    <div class="subscription-section" v-if="loadingSubscription">
      <div class="loading-container">
        <LoadingSpinner />
        <p>Carregando suas assinaturas...</p>
      </div>
    </div>
    
    <div class="subscription-section" v-else-if="activeSubscription">
      <div class="subscription-card">
        <div class="subscription-header">
          <h3>{{ activeSubscription.plan_name || 'Assinatura' }}</h3>
          <span class="status" :class="activeSubscription.status.toLowerCase()">
            {{ translateStatus(activeSubscription.status) }}
          </span>
        </div>
        
        <div class="subscription-details">
          <div class="detail-row">
            <span class="label">ID da Assinatura:</span>
            <span class="value">{{ activeSubscription.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Valor:</span>
            <span class="value">{{ formatCurrency(activeSubscription.value) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Início:</span>
            <span class="value">{{ formatDate(activeSubscription.start_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Próxima cobrança:</span>
            <span class="value">{{ formatDate(activeSubscription.next_due_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Método de pagamento:</span>
            <span class="value">{{ translatePaymentMethod(activeSubscription.payment_method || activeSubscription.billing_type) }}</span>
          </div>
          <div v-if="activeSubscription.end_date" class="detail-row">
            <span class="label">Data de cancelamento:</span>
            <span class="value">{{ formatDate(activeSubscription.end_date) }}</span>
          </div>
        </div>
        
        <div class="subscription-actions">
          <button 
            class="cancel-button" 
            v-if="activeSubscription.status.toLowerCase() === 'active'" 
            @click="showCancelConfirmation = true"
          >
            Cancelar Assinatura
          </button>
          <button 
            class="reactivate-button" 
            v-else-if="activeSubscription.status.toLowerCase() === 'canceled'" 
            @click="confirmReactivateSubscription"
            :disabled="canceling"
          >
            {{ canceling ? 'Reativando...' : 'Reativar Assinatura' }}
          </button>
        </div>
      </div>
      
      <!-- Lista todas as assinaturas se o usuário tem mais de uma -->
      <div v-if="userSubscriptions.length > 1" class="other-subscriptions">
        <h3>Outras Assinaturas</h3>
        <div 
          v-for="subscription in userSubscriptions.filter(s => s.id !== activeSubscription?.id)"
          :key="subscription.id"
          class="subscription-item"
          @click="activeSubscription = subscription"
        >
          <div class="subscription-item-info">
            <span class="plan-name">{{ subscription.plan_name || 'Assinatura' }}</span>
            <span class="plan-price">{{ formatCurrency(subscription.value) }}</span>
          </div>
          <span class="subscription-status" :class="subscription.status.toLowerCase()">
            {{ translateStatus(subscription.status) }}
          </span>
        </div>
      </div>
      
      <!-- Modal de confirmação de cancelamento -->
      <div class="modal" v-if="showCancelConfirmation">
        <div class="modal-content">
          <h3>Confirmar Cancelamento</h3>
          <p>Tem certeza que deseja cancelar sua assinatura?</p>
          <p>Você poderá continuar utilizando os serviços até o fim do período já pago.</p>
          
          <div class="modal-actions">
            <button class="secondary-button" @click="showCancelConfirmation = false">Voltar</button>
            <button class="danger-button" @click="confirmCancelSubscription" :disabled="canceling">
              {{ canceling ? 'Cancelando...' : 'Confirmar Cancelamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-subscriptions" v-else>
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>Nenhuma assinatura encontrada</h3>
        <p>Você ainda não possui assinaturas ativas.</p>
        <button class="primary-button" @click="goToCatalog">Explorar Catálogo</button>
      </div>
    </div>
    
    <div class="info-section">
      <h3>Como gerenciar suas assinaturas</h3>
      <ul>
        <li><strong>Visualização:</strong> Veja os detalhes da sua assinatura, incluindo valor, data de início e próxima cobrança.</li>
        <li><strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. O serviço continua disponível até o final do período já pago.</li>
        <li><strong>Reativação:</strong> Caso tenha cancelado sua assinatura, você pode reativá-la antes do término do período.</li>
      </ul>
      <p class="contact-info">Precisa de ajuda? Entre em contato pelo email <a href="mailto:suporte@nexosapp.com.br">suporte@nexosapp.com.br</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency } from '@/utils/formatters';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { 
  cancelSubscription, 
  fetchShopperSubscriptions,
  SubscriptionType,
  type Subscription
} from '@/services/subscriptions';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loadingSubscription = ref(true);
const userSubscriptions = ref<Subscription[]>([]);
const activeSubscription = ref<Subscription | null>(null);
const showCancelConfirmation = ref(false);
const canceling = ref(false);
const error = ref<string | null>(null);

// Carrega as assinaturas do usuário
onMounted(async () => {
  try {
    // Resetar os estados
    loadingSubscription.value = true;
    error.value = null;
    
    // Se temos um usuário autenticado
    if (authStore.isAuthenticated && authStore.user) {
      // Buscar assinaturas pela API
      const shopperId = authStore.user.id;
      const subscriptions = await fetchShopperSubscriptions(shopperId);
      
      if (subscriptions && subscriptions.length > 0) {
        userSubscriptions.value = subscriptions;
        
        // Define a assinatura ativa (prioriza assinaturas com status active)
        activeSubscription.value = subscriptions.find(sub => 
          sub.status.toLowerCase() === 'active'
        ) || subscriptions[0];
      } else {
        userSubscriptions.value = [];
        activeSubscription.value = null;
      }
    } else {
      // Usuário não está autenticado ou sem ID, verificamos o localStorage como fallback
      fallbackToLocalStorage();
    }
  } catch (err) {
    console.error('Erro ao carregar assinaturas:', err);
    error.value = 'Não foi possível carregar suas assinaturas no momento. Por favor, tente novamente mais tarde.';
    
    // Tenta usar localStorage como fallback
    fallbackToLocalStorage();
  } finally {
    loadingSubscription.value = false;
  }
});

// Função para tentar carregar assinaturas do localStorage (para compatibilidade)
function fallbackToLocalStorage() {
  try {
    const orderData = localStorage.getItem('appns_last_order');
    
    if (orderData) {
      const parsedOrder = JSON.parse(orderData);
      
      if (parsedOrder.subscription_id) {
        // Simular uma assinatura com os dados do localStorage
        const simulatedSubscription: Subscription = {
          id: parseInt(parsedOrder.subscription_id) || 0,
          external_id: `sub_${Math.random().toString(36).substr(2, 9)}`,
          shopper_id: parseInt(parsedOrder.shopper_id) || 0,
          order_id: parseInt(parsedOrder.order_id) || 0,
          plan_name: 'Assinatura Mensal',
          value: parsedOrder.total || 0,
          status: parsedOrder.status || 'active',
          cycle: 'MONTHLY',
          next_due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          payment_method: parsedOrder.payment_method || 'credit_card',
          billing_type: parsedOrder.payment_method || 'credit_card',
          features: null,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        userSubscriptions.value = [simulatedSubscription];
        activeSubscription.value = simulatedSubscription;
      }
    }
  } catch (err) {
    console.error('Erro ao ler dados do localStorage:', err);
  }
}

// Traduz o status da assinatura para português
function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Ativa',
    'canceled': 'Cancelada',
    'pending': 'Pendente',
    'overdue': 'Atrasada',
    'expired': 'Expirada',
    'inactive': 'Inativa'
  };
  
  return statusMap[status.toLowerCase()] || status;
}

// Traduz o método de pagamento para português
function translatePaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    'credit_card': 'Cartão de Crédito',
    'credit': 'Cartão de Crédito',
    'boleto': 'Boleto Bancário',
    'pix': 'PIX'
  };
  
  return methodMap[method?.toLowerCase()] || method;
}

// Formata a data para o formato brasileiro
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  } catch (err) {
    return 'Data inválida';
  }
}

// Cancela a assinatura
async function confirmCancelSubscription() {
  if (!activeSubscription.value || canceling.value) return;
  
  try {
    canceling.value = true;
    error.value = null;
    
    // Chamando a API real para cancelar a assinatura
    const success = await cancelSubscription(
      activeSubscription.value.id,
      'shopper_id' in activeSubscription.value 
        ? SubscriptionType.SHOPPER 
        : SubscriptionType.SELLER
    );
    
    if (success) {
      // Atualizando o status localmente após cancelamento bem-sucedido
      activeSubscription.value.status = 'canceled';
      activeSubscription.value.end_date = new Date().toISOString().split('T')[0];
      
      // Também atualizamos no array de assinaturas
      const index = userSubscriptions.value.findIndex(s => s.id === activeSubscription.value?.id);
      if (index !== -1) {
        userSubscriptions.value[index].status = 'canceled';
        userSubscriptions.value[index].end_date = new Date().toISOString().split('T')[0];
      }
      
      // Atualiza no localStorage para compatibilidade com código legado
      const orderData = localStorage.getItem('appns_last_order');
      if (orderData) {
        const parsedOrder = JSON.parse(orderData);
        parsedOrder.status = 'canceled';
        localStorage.setItem('appns_last_order', JSON.stringify(parsedOrder));
      }
    } else {
      error.value = 'Não foi possível cancelar a assinatura. Por favor, tente novamente.';
    }
    
    // Oculta o modal de confirmação
    showCancelConfirmation.value = false;
  } catch (err) {
    console.error('Erro ao cancelar assinatura:', err);
    error.value = 'Ocorreu um erro ao cancelar sua assinatura. Por favor, tente novamente.';
  } finally {
    canceling.value = false;
  }
}

// Reativa a assinatura
async function confirmReactivateSubscription() {
  error.value = 'A funcionalidade de reativação de assinatura não está disponível no momento.';
}
// Redireciona para o catálogo
function goToCatalog() {
  router.push('/catalog');
}
</script>

<style scoped>
.manage-subscriptions {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.error-alert {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c62828;
}

.subscription-section {
  margin-bottom: 2rem;
}

.subscription-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e1e1;
  margin-bottom: 1rem;
}

.subscription-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: bold;
}

.status.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.canceled {
  background-color: #ffebee;
  color: #c62828;
}

.status.pending {
  background-color: #fff8e1;
  color: #f57f17;
}

.status.overdue {
  background-color: #ffe0b2;
  color: #e65100;
}

.subscription-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.label {
  font-weight: bold;
  width: 180px;
  color: #666;
}

.subscription-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e1e1e1;
}

.cancel-button {
  background-color: #ffebee;
  color: #c62828;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #ef9a9a;
}

.reactivate-button {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reactivate-button:hover {
  background-color: #a5d6a7;
}

.reactivate-button:disabled {
  background-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

.other-subscriptions {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.other-subscriptions h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.subscription-item {
  padding: 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscription-item:hover {
  background-color: #f5f5f5;
}

.subscription-item-info {
  display: flex;
  flex-direction: column;
}

.plan-name {
  font-weight: bold;
  color: #2c3e50;
}

.plan-price {
  color: #666;
  font-size: 0.9rem;
}

.subscription-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.info-section {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-section ul {
  padding-left: 1.5rem;
}

.info-section li {
  margin-bottom: 0.75rem;
}

.contact-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e1e1;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
  color: #9e9e9e;
  margin-bottom: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.secondary-button {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.danger-button {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.danger-button:disabled {
  background-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}
</style>