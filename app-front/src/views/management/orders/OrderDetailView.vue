<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchOrderById, deleteOrder, type Order } from '@/services/orders';
import { formatDate, formatCurrency, getStatusClass, getStatusText, getCycleText, getPaymentMethodText } from '@/utils/formatters';

// Removendo a interface duplicada e usando a do serviço
interface OrderProduct {
  id: number;
  name: string;
  price: number;
  sku?: string;
}

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.id as string);

const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const deleting = ref(false);
const showDeleteConfirm = ref(false);

async function loadOrderDetails() {
  loading.value = true;
  error.value = null;
  
  try {
    order.value = await fetchOrderById(orderId.value);
    
    if (!order.value) {
      error.value = 'Pedido não encontrado ou formato de resposta inesperado';
    }
  } catch (err) {
    error.value = 'Erro ao carregar detalhes do pedido';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleDeleteOrder() {
  if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return;
  
  deleting.value = true;
  
  try {
    const success = await deleteOrder(orderId.value);
    
    if (success) {
      alert('Pedido excluído com sucesso!');
      router.push('/management/orders');
    } else {
      alert('Não foi possível excluir o pedido. Tente novamente.');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir pedido.');
  } finally {
    deleting.value = false;
    showDeleteConfirm.value = false;
  }
}

onMounted(() => {
  loadOrderDetails();
});
</script>

<template>
  <div class="order-details">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Detalhes do Pedido #{{ orderId }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando detalhes do pedido...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadOrderDetails" class="btn-retry">Tentar novamente</button>
      <button @click="router.push('/management/orders')" class="btn-return">Voltar à lista</button>
    </div>
    
    <div v-else-if="order" class="detail-card">
      <div class="detail-header">
        <h2>Pedido #{{ order.id }}</h2>
        <div class="status-badge" :class="getStatusClass(order.status)">
          {{ getStatusText(order.status) }}
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Informações do Pedido</h3>
        <div class="detail-row">
          <span class="detail-label">ID Externo:</span>
          <span class="detail-value">{{ order.external_id || 'Não disponível' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor total:</span>
          <span class="detail-value">{{ formatCurrency(order.value) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ciclo:</span>
          <span class="detail-value">{{ getCycleText(order.cycle) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Forma de pagamento:</span>
          <span class="detail-value">{{ getPaymentMethodText(order.billing_type) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Próximo vencimento:</span>
          <span class="detail-value">{{ formatDate(order.next_due_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data de início:</span>
          <span class="detail-value">{{ formatDate(order.start_date) }}</span>
        </div>
        <div class="detail-row" v-if="order.end_date">
          <span class="detail-label">Data de encerramento:</span>
          <span class="detail-value">{{ formatDate(order.end_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data de criação:</span>
          <span class="detail-value">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="detail-row" v-if="order.updated_at">
          <span class="detail-label">Última atualização:</span>
          <span class="detail-value">{{ formatDate(order.updated_at) }}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Cliente e Vendedor</h3>
        <div class="detail-row">
          <span class="detail-label">ID do Cliente:</span>
          <span class="detail-value">
            {{ order.shopper_id }}
            <RouterLink 
              :to="`/management/shoppers/${order.shopper_id}`" 
              class="btn-link"
            >
              Ver Cliente
            </RouterLink>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID do Vendedor:</span>
          <span class="detail-value">
            {{ order.seller_id }}
            <RouterLink 
              :to="`/management/sellers/${order.seller_id}`" 
              class="btn-link"
            >
              Ver Vendedor
            </RouterLink>
          </span>
        </div>
      </div>
      
      <div class="detail-section" v-if="order.products && order.products.length > 0">
        <h3>Produtos</h3>
        <div class="products-list">
          <div v-for="(product, index) in order.products" :key="index" class="product-item">
            <span>{{ typeof product === 'object' && product.name ? product.name : `Produto #${typeof product === 'object' ? product.id : product}` }}</span>
            <span v-if="typeof product === 'object' && product.price !== undefined">{{ formatCurrency(product.price) }}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-actions">
        <button @click="showDeleteConfirm = true" class="btn-delete" :disabled="deleting">
          {{ deleting ? 'Excluindo...' : 'Excluir Pedido' }}
        </button>
      </div>
      
      <div v-if="showDeleteConfirm" class="confirm-dialog-backdrop">
        <div class="confirm-dialog">
          <h3>Confirmar exclusão</h3>
          <p>Tem certeza que deseja excluir este pedido?</p>
          <p class="warning-text">Esta ação não pode ser desfeita e pode afetar assinaturas relacionadas!</p>
          <div class="confirm-actions">
            <button class="btn-secondary" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="btn-danger" @click="handleDeleteOrder" :disabled="deleting">
              {{ deleting ? 'Excluindo...' : 'Sim, excluir pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-details {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
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

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-active {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.status-pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-canceled {
  background-color: #f5f5f5;
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-link {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  color: #335;
  border-radius: 4px;
  text-decoration: none;
}

.btn-link:hover {
  background-color: #e0e0e0;
}

.products-list {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 1rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.product-item:last-child {
  border-bottom: none;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-delete {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background-color: #ffcdd2;
}

.btn-delete:disabled {
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

.warning-text {
  color: #c62828;
  font-weight: 500;
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
</style>
