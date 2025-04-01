<script setup lang="ts">
import { computed } from 'vue';
import { type Subscription } from '@/services/subscriptions';

const props = defineProps<{
  subscription: Subscription
}>();

const formattedValue = computed(() => {
  const value = typeof props.subscription.value === 'string' 
    ? parseFloat(props.subscription.value) 
    : props.subscription.value;
    
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
});

const formattedDate = computed(() => {
  return new Date(props.subscription.next_due_date).toLocaleDateString('pt-BR');
});

const statusClass = computed(() => {
  const status = props.subscription.status.toUpperCase();
  
  switch (status) {
    case 'ACTIVE':
      return 'status-active';
    case 'INACTIVE':
      return 'status-inactive';
    case 'OVERDUE':
      return 'status-overdue';
    default:
      return '';
  }
});

const statusText = computed(() => {
  const status = props.subscription.status.toUpperCase();
  
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
  switch (props.subscription.cycle) {
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
      return props.subscription.cycle;
  }
});

const paymentMethodText = computed(() => {
  switch (props.subscription.billing_type) {
    case 'BOLETO':
      return 'Boleto';
    case 'CREDIT_CARD':
      return 'Cartão de Crédito';
    case 'PIX':
      return 'Pix';
    default:
      return props.subscription.billing_type;
  }
});

const customerName = computed(() => {
  // Para assinaturas de shoppers, usamos shopper_id
  if ('shopper_id' in props.subscription) {
    return `Cliente #${props.subscription.shopper_id}`;
  }
  // Para assinaturas de sellers, usamos seller_id
  else if ('seller_id' in props.subscription) {
    return `Vendedor #${props.subscription.seller_id}`;
  }
  return 'Cliente/Vendedor';
});

const createdDateFormatted = computed(() => {
  return new Date(props.subscription.createdAt).toLocaleDateString('pt-BR');
});

const subscriptionReference = computed(() => {
  return props.subscription.external_id || 'Sem referência';
});
</script>

<template>
  <div class="subscription-card">
    <div class="card-header">
      <h3>{{ customerName }}</h3>
      <span class="status-badge" :class="statusClass">{{ statusText }}</span>
    </div>
    <div class="card-body">
      <div class="info-row">
        <span class="label">Plano:</span>
        <span class="value">{{ subscription.plan_name }}</span>
      </div>
      <div class="info-row">
        <span class="label">Valor:</span>
        <span class="value">{{ formattedValue }}</span>
      </div>
      <div class="info-row">
        <span class="label">Próximo vencimento:</span>
        <span class="value">{{ formattedDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">Ciclo:</span>
        <span class="value">{{ cycleText }}</span>
      </div>
      <div class="info-row">
        <span class="label">Forma de pagamento:</span>
        <span class="value">{{ paymentMethodText }}</span>
      </div>
      <div class="info-row">
        <span class="label">Criada em:</span>
        <span class="value">{{ createdDateFormatted }}</span>
      </div>
      <div class="info-row">
        <span class="label">ID externo:</span>
        <span class="value">{{ subscriptionReference }}</span>
      </div>
    </div>
    <div class="card-actions">
      <RouterLink :to="`/subscriptions/${subscription.id}`" class="btn-details">
        Ver detalhes
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.subscription-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.subscription-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
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

.card-body {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  font-weight: 500;
  color: #333;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-details {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-details:hover {
  background-color: #223;
}
</style>
