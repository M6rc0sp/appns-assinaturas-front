<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchOrders, type Order } from '@/services/orders';
import { formatDate, formatCurrency, getStatusClass, getStatusText } from '@/utils/formatters';

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadOrders() {
  loading.value = true;
  error.value = null;
  
  try {
    orders.value = await fetchOrders();
  } catch (err) {
    error.value = 'Erro ao carregar pedidos. Por favor, tente novamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="order-list">
    <div class="page-header">
      <h1>Pedidos</h1>
      <div class="action-buttons">
        <button @click="loadOrders" class="btn-refresh">Atualizar</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando pedidos...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadOrders" class="btn-retry">Tentar novamente</button>
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-container">
      <p>Nenhum pedido encontrado.</p>
    </div>
    
    <div v-else>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ciclo</th>
            <th>Próximo vencimento</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td># {{ order.id }}</td>
            <td>Cliente #{{ order.shopper_id }}</td>
            <td>{{ formatCurrency(order.value) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>{{ order.cycle }}</td>
            <td>{{ formatDate(order.next_due_date) }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td class="actions">
              <RouterLink :to="`/management/orders/${order.id}`" class="btn-view">
                Ver
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.order-list {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  color: #335;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-add {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #43a047;
}

.btn-refresh {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading-container, .error-container, .empty-container {
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table thead {
  background-color: #f5f5f5;
}

.data-table th, .data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  background-color: #335;
  color: white;
  border: none;
}

.btn-retry {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
