<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CheckoutDisclaimer from '@/components/ui/CheckoutDisclaimer.vue';

const router = useRouter();

// Dados da ordem processada, recuperados do localStorage
const order = ref<any | null>(null);
const loading = ref(true);

onMounted(() => {
  try {
    // Recupera informações do pedido do localStorage
    const orderJson = localStorage.getItem('appns_last_order');
    if (orderJson) {
      order.value = JSON.parse(orderJson);
      // Armazenar também em lastOrder para uso futuro na página de gerenciamento
      localStorage.setItem('lastOrder', orderJson);
    } else {
      // Se não encontrar informações do pedido, redireciona para uma página de erro amigável
      router.replace({ name: 'not-found' });
    }
  } catch (error) {
    console.error('Erro ao carregar dados do pedido:', error);
  } finally {
    loading.value = false;
  }
});

// Redireciona para a página de gerenciamento de assinaturas
function goToManageSubscriptions() {
  router.push('/manage');
}
</script>

<template>
  <div class="success-page">
    <div class="success-container">
      <div class="success-header">
        <h1><span class="checkmark">✓</span> Assinatura Realizada com Sucesso!</h1>
        <p class="subtitle">Seu pedido foi processado e sua assinatura está ativa.</p>
      </div>
      
      <div class="order-details" v-if="order">
        <h2>Detalhes da Assinatura</h2>
        
        <div class="order-info">
          <div class="info-row">
            <span class="label">ID da Assinatura:</span>
            <span class="value">{{ order.subscription_id }}</span>
          </div>
          <div class="info-row">
            <span class="label">Cliente:</span>
            <span class="value">{{ order.shopper_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ order.shopper_email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Data:</span>
            <span class="value">{{ formatDate(order.date) }}</span>
          </div>
        </div>
        
        <h3>Itens da Assinatura</h3>
        <div class="items-list">
          <div class="item" v-for="(item, index) in order.items" :key="index">
            <div class="item-info">
              <h4>{{ item.product.name }}</h4>
              <p class="item-description">{{ item.product.description }}</p>
            </div>
            <div class="item-pricing">
              <span class="quantity">{{ item.quantity }}x</span>
              <span class="price">{{ formatCurrency(item.product.price) }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-total">
          <span class="label">Total:</span>
          <span class="total-value">{{ formatCurrency(order.total) }}</span>
        </div>
        
        <div class="subscription-info">
          <h3>Informações importantes</h3>
          <p>Sua primeira cobrança foi processada com sucesso. A próxima cobrança ocorrerá automaticamente daqui a 30 dias.</p>
          <p>Você receberá um e-mail com os detalhes da sua assinatura.</p>
          <p>Para gerenciar sua assinatura, acesse a página <a @click.prevent="goToManageSubscriptions" href="#">Gerenciar Assinaturas</a>.</p>
        </div>
      </div>
      
      <div class="no-order" v-else>
        <p>Nenhuma informação de pedido encontrada.</p>
      </div>
    </div>
  </div>
  <CheckoutDisclaimer />
</template>

<style scoped>
.success-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.success-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.success-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e1e1;
}

.checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  margin-right: 8px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.order-details {
  margin-bottom: 2rem;
}

.order-info {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: bold;
  width: 150px;
}

.items-list {
  margin: 1rem 0;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
}

.item-info {
  flex: 1;
}

.item-description {
  color: #666;
  font-size: 0.9rem;
}

.item-pricing {
  text-align: right;
  min-width: 120px;
}

.quantity {
  color: #666;
  margin-right: 0.5rem;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e1e1;
}

.total-value {
  color: #2c3e50;
}

.subscription-info {
  background-color: #f0f7ff;
  padding: 1rem;
  border-radius: 6px;
  margin: 1.5rem 0;
  border-left: 4px solid #4285f4;
}

.subscription-info h3 {
  color: #4285f4;
  margin-top: 0;
}

.actions {
  display: flex;
  justify-content: center;
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
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #3367d6;
}

.secondary-button {
  background-color: white;
  color: #4285f4;
  border: 1px solid #4285f4;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background-color: #f0f7ff;
}

.no-order {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>