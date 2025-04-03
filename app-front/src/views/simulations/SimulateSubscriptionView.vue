<script setup lang="ts">
import { ref, computed } from 'vue';
import ShopperSelector from '@/components/simulations/ShopperSelector.vue';
import ProductSelector from '@/components/simulations/ProductSelector.vue';
import { createOrder } from '@/services/orders';
import { createShopperSubscriptionFromOrder } from '@/services/subscriptions';

// Estados do fluxo
enum Step {
  SELECT_SHOPPER = 1,
  SELECT_PRODUCTS = 2,
  REVIEW_ORDER = 3,
  CREATE_SUBSCRIPTION = 4,
  CONFIRMATION = 5
}

const currentStep = ref<Step>(Step.SELECT_SHOPPER);
const selectedShopperId = ref<number | null>(null);
const selectedProducts = ref<number[]>([]);
const totalValue = ref(0);
const cycleOptions = ref([
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUALLY', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' }
]);
const selectedCycle = ref('MONTHLY');

const paymentMethodOptions = ref([
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'PIX', label: 'Pix' }
]);
const selectedPaymentMethod = ref('PIX');

const nextDueDate = ref(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

const loading = ref(false);
const orderCreated = ref(false);
const subscriptionCreated = ref(false);
const error = ref<string | null>(null);
const errorDetails = ref<string | null>(null);
const showErrorDetails = ref(false);
const createdOrderId = ref<number | null>(null);
const createdSubscriptionId = ref<string | null>(null);
const apiResponse = ref<any>(null);

// Validações por etapa
const isShopperStepValid = computed(() => selectedShopperId.value !== null);
const isProductsStepValid = computed(() => {
  // Verificação mais robusta para garantir que temos produtos e um valor válido
  const hasProducts = selectedProducts.value.length > 0;
  const hasValue = totalValue.value > 0;
  console.log(`Validação de produtos: produtos=${hasProducts}, valor=${hasValue}, total=${totalValue.value}`);
  return hasProducts && hasValue;
});
const isReviewStepValid = computed(() => nextDueDate.value && selectedCycle.value && selectedPaymentMethod.value);

function updateTotalValue(value: number) {
  console.log('Valor total atualizado:', value);
  totalValue.value = value;
}

function resetForm() {
  currentStep.value = Step.SELECT_SHOPPER;
  selectedShopperId.value = null;
  selectedProducts.value = [];
  totalValue.value = 0;
  selectedCycle.value = 'MONTHLY';
  selectedPaymentMethod.value = 'PIX';
  nextDueDate.value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  orderCreated.value = false;
  subscriptionCreated.value = false;
  createdOrderId.value = null;
  createdSubscriptionId.value = null;
  error.value = null;
  errorDetails.value = null;
  apiResponse.value = null;
}

function goToNextStep() {
  if (currentStep.value < Step.CONFIRMATION) {
    currentStep.value++;
  }
}

function goToPreviousStep() {
  if (currentStep.value > Step.SELECT_SHOPPER) {
    currentStep.value--;
  }
}

function toggleErrorDetails() {
  showErrorDetails.value = !showErrorDetails.value;
}

async function createOrderFromSelection() {
  if (!isReviewStepValid.value) return;
  
  loading.value = true;
  error.value = null;
  errorDetails.value = null;
  
  try {
    // Formatar o valor do pedido para ter duas casas decimais
    const formattedValue = parseFloat(totalValue.value.toString()).toFixed(2);
    
    // Criar pedido
    const orderData = {
      seller_id: 1, // Usando seller_id fixo = 1 para simulação
      shopper_id: selectedShopperId.value as number,
      products: selectedProducts.value,
      value: parseFloat(formattedValue),
      cycle: selectedCycle.value,
      next_due_date: nextDueDate.value,
      billing_type: selectedPaymentMethod.value,
      customer_info: "{}", // Adicionando campos obrigatórios conforme schema
      nuvemshop: "{}"
    };
    
    console.log('Enviando dados de pedido:', JSON.stringify(orderData, null, 2));
    
    const response = await createOrder(orderData);
    apiResponse.value = response;
    
    console.log('Resposta completa da API:', response);
    
    if (!response) {
      throw new Error('Não foi possível criar o pedido. A resposta da API está vazia.');
    }
    
    // Verificar a estrutura da resposta e extrair o ID do pedido
    if (response.data && response.data.id) {
      // Se a resposta tem um campo 'data' que contém o ID
      createdOrderId.value = response.data.id;
      console.log('ID do pedido extraído do campo data:', createdOrderId.value);
    } else if (response.id) {
      // Se o ID está diretamente no objeto da resposta
      createdOrderId.value = response.id;
      console.log('ID do pedido extraído diretamente:', createdOrderId.value);
    } else {
      // Se não encontrou o ID em nenhum lugar
      throw new Error('Não foi possível obter o ID do pedido na resposta da API');
    }
    
    orderCreated.value = true;
    goToNextStep(); // Avança para a etapa de criação da assinatura
  } catch (err) {
    handleError(err, 'Erro ao criar o pedido');
  } finally {
    loading.value = false;
  }
}

async function createSubscriptionFromCreatedOrder() {
  if (!createdOrderId.value) {
    error.value = 'Não há pedido criado para gerar uma assinatura';
    return;
  }
  
  loading.value = true;
  error.value = null;
  errorDetails.value = null;
  
  try {
    console.log(`Iniciando criação de assinatura para o pedido ID: ${createdOrderId.value}`);
    
    // Usando o novo serviço específico para assinaturas de shoppers
    const subscription = await createShopperSubscriptionFromOrder(createdOrderId.value);
    
    console.log('Resposta da criação de assinatura:', subscription);
    
    if (!subscription) {
      throw new Error('Não foi possível criar a assinatura. A resposta da API está vazia.');
    }
    
    // Extrai o ID da assinatura da resposta, considerando diferentes formatos possíveis
    if (subscription.external_id) {
      createdSubscriptionId.value = subscription.external_id;
    } else if (subscription.id) {
      createdSubscriptionId.value = subscription.id;
    } else if (subscription.data && subscription.data.id) {
      createdSubscriptionId.value = subscription.data.id;
    } else {
      // Se não conseguir encontrar o ID em nenhum formato conhecido, usa um fallback
      createdSubscriptionId.value = "ID não encontrado na resposta";
      console.warn("Não foi possível extrair o ID da assinatura da resposta:", subscription);
    }
    
    subscriptionCreated.value = true;
    goToNextStep(); // Avança para a confirmação final
  } catch (err) {
    handleError(err, 'Erro ao criar a assinatura');
  } finally {
    loading.value = false;
  }
}

// Função auxiliar para tratamento de erros
function handleError(err: any, defaultMessage: string) {
  if (err instanceof Error) {
    error.value = defaultMessage;
    errorDetails.value = err.message;
    console.error('Erro completo:', err);
  } else {
    error.value = defaultMessage;
    errorDetails.value = typeof err === 'string' ? err : 'Erro não identificado';
    console.error('Erro não estruturado:', err);
  }
}
</script>

<template>
  <div class="simulation-container">
    <h1>Simular Criação de Assinatura</h1>
    
    <!-- Indicador de progresso -->
    <div class="progress-indicator">
      <div 
        v-for="step in 5" 
        :key="step" 
        class="progress-step" 
        :class="{ 
          'active': step === currentStep,
          'completed': step < currentStep
        }"
        @click="step < currentStep && (currentStep = step)"
      >
        <div class="step-number">{{ step }}</div>
        <div class="step-label">
          {{ 
            step === 1 ? 'Cliente' :
            step === 2 ? 'Produtos' :
            step === 3 ? 'Revisão' :
            step === 4 ? 'Assinatura' : 'Confirmação'
          }}
        </div>
      </div>
    </div>
    
    <!-- Conteúdo das etapas -->
    <div class="step-content">
      <!-- Etapa 1: Seleção de cliente -->
      <div v-if="currentStep === Step.SELECT_SHOPPER" class="step-panel">
        <h2>Selecione o cliente</h2>
        <ShopperSelector v-model:selectedShopperId="selectedShopperId" />
        
        <div class="step-actions">
          <button 
            @click="goToNextStep" 
            class="btn-next" 
            :disabled="!isShopperStepValid"
          >
            Próximo: Selecionar Produtos
          </button>
        </div>
      </div>
      
      <!-- Etapa 2: Seleção de produtos -->
      <div v-else-if="currentStep === Step.SELECT_PRODUCTS" class="step-panel">
        <h2>Selecione os produtos</h2>
        <ProductSelector 
          :selectedProducts="selectedProducts"
          @update:selectedProducts="selectedProducts = $event"
          @updateTotalValue="updateTotalValue"
        />
        
        <div v-if="selectedProducts.length > 0" class="summary-box">
          <p>Produtos selecionados: <strong>{{ selectedProducts.length }}</strong></p>
          <p>Valor total: <strong>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue) }}</strong></p>
        </div>
        
        <div class="step-actions">
          <button @click="goToPreviousStep" class="btn-back">
            Voltar: Selecionar Cliente
          </button>
          <button 
            @click="goToNextStep" 
            class="btn-next" 
            :disabled="!isProductsStepValid"
          >
            Próximo: Revisar Pedido
          </button>
        </div>
      </div>
      
      <!-- Etapa 3: Revisão do pedido -->
      <div v-else-if="currentStep === Step.REVIEW_ORDER" class="step-panel step-panel-review">
        <h2>Revisar e criar pedido</h2>
        
        <div class="order-review">
          <div class="review-section">
            <h3>Detalhes do Pedido</h3>
            <div class="form-group">
              <label for="totalValue">Valor Total (R$)</label>
              <input 
                type="number" 
                id="totalValue" 
                v-model="totalValue" 
                min="0.01" 
                step="0.01"
                class="form-control"
                readonly
                title="O valor é calculado com base nos produtos selecionados"
              />
              <small class="form-help text-muted">O valor total é calculado automaticamente com base nos produtos selecionados</small>
            </div>
            
            <div class="form-group">
              <label for="cycle">Ciclo de Cobrança</label>
              <select id="cycle" v-model="selectedCycle" class="form-control">
                <option v-for="option in cycleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="paymentMethod">Método de Pagamento</label>
              <select id="paymentMethod" v-model="selectedPaymentMethod" class="form-control">
                <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="nextDueDate">Próximo Vencimento</label>
              <input 
                type="date" 
                id="nextDueDate" 
                v-model="nextDueDate"
                class="form-control"
              />
            </div>
          </div>
          
          <div class="selected-products-summary">
            <h3>Produtos selecionados</h3>
            <div class="products-table">
              <div class="product-header">
                <span>Produto</span>
                <span>Valor</span>
              </div>
              <div v-for="(productId, index) in selectedProducts" :key="index" class="product-row">
                <span>Produto #{{ productId }}</span>
                <!-- Aqui poderia exibir o valor individual de cada produto, se disponível -->
              </div>
              <div class="product-total">
                <span>Total:</span>
                <span>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="error-container">
          <div class="error-message">
            <p>{{ error }}</p>
            <button @click="toggleErrorDetails" class="btn-toggle-details">
              {{ showErrorDetails ? 'Ocultar detalhes' : 'Mostrar detalhes' }}
            </button>
          </div>
          
          <div v-if="showErrorDetails" class="error-details">
            <h4>Detalhes do Erro:</h4>
            <pre>{{ errorDetails }}</pre>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="goToPreviousStep" class="btn-back">
            Voltar: Selecionar Produtos
          </button>
          <button 
            @click="createOrderFromSelection" 
            class="btn-create" 
            :disabled="!isReviewStepValid || loading"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Criar Pedido</span>
          </button>
        </div>
      </div>
      
      <!-- Etapa 4: Criação da assinatura -->
      <div v-else-if="currentStep === Step.CREATE_SUBSCRIPTION" class="step-panel">
        <h2>Criar assinatura para o pedido</h2>
        
        <div class="order-confirmation">
          <div class="order-success">
            <div class="success-icon">✓</div>
            <h3>Pedido criado com sucesso!</h3>
            <p>ID do Pedido: <strong>{{ createdOrderId }}</strong></p>
          </div>
          
          <div class="subscription-creation">
            <p>Agora você pode criar uma assinatura para este pedido.</p>
            <p class="info-message">
              A assinatura será vinculada ao pedido e configurada com as mesmas condições definidas anteriormente,
              gerando cobranças recorrentes conforme o ciclo de {{ 
                cycleOptions.find(option => option.value === selectedCycle)?.label || selectedCycle }}
              utilizando {{ paymentMethodOptions.find(option => option.value === selectedPaymentMethod)?.label || selectedPaymentMethod }}.
            </p>
          </div>
        </div>
        
        <div v-if="error" class="error-container">
          <div class="error-message">
            <p>{{ error }}</p>
            <button @click="toggleErrorDetails" class="btn-toggle-details">
              {{ showErrorDetails ? 'Ocultar detalhes' : 'Mostrar detalhes' }}
            </button>
          </div>
          
          <div v-if="showErrorDetails" class="error-details">
            <h4>Detalhes do Erro:</h4>
            <pre>{{ errorDetails }}</pre>
          </div>
        </div>
        
        <div class="step-actions">
          <button 
            @click="goToPreviousStep" 
            class="btn-back"
          >
            Voltar para o pedido
          </button>
          <button 
            @click="createSubscriptionFromCreatedOrder" 
            class="btn-create-subscription" 
            :disabled="loading"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Criar Assinatura</span>
          </button>
        </div>
      </div>
      
      <!-- Etapa 5: Confirmação -->
      <div v-else-if="currentStep === Step.CONFIRMATION" class="step-panel">
        <div class="final-confirmation">
          <div class="success-icon">✓</div>
          <h2>Processo concluído com sucesso!</h2>
          
          <div class="confirmation-details">
            <div class="detail-item">
              <h3>Pedido</h3>
              <p>ID: <strong>{{ createdOrderId }}</strong></p>
            </div>
            <div class="detail-item">
              <h3>Assinatura</h3>
              <p>ID: <strong>{{ createdSubscriptionId }}</strong></p>
            </div>
          </div>
          
          <p class="confirmation-message">
            A assinatura foi criada com sucesso e está vinculada ao pedido.
            As cobranças serão geradas automaticamente conforme o ciclo configurado.
          </p>
          
          <div class="final-actions">
            <button @click="resetForm" class="btn-new-simulation">
              Iniciar nova simulação
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulation-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: #335;
  text-align: center;
}

h2 {
  color: #335;
  margin-bottom: 1.5rem;
}

/* Indicador de progresso */
.progress-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.progress-indicator::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 5%;
  right: 5%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  transition: all 0.3s;
}

.progress-step.active .step-number {
  background-color: #335;
  color: white;
}

.progress-step.active .step-label {
  color: #335;
  font-weight: bold;
}

.progress-step.completed .step-number {
  background-color: #4caf50;
  color: white;
}

.progress-step.completed .step-label {
  color: #4caf50;
}

/* Conteúdo das etapas */
.step-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

/* Estilo específico para o painel de revisão que precisa de scroll */
.step-panel-review {
  max-height: 69vh;
  overflow: auto;
  position: relative;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-back {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #e5e5e5;
}

.btn-next, .btn-create, .btn-create-subscription {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 180px;
  display: flex;
  justify-content: center;
}

.btn-next:hover:not(:disabled),
.btn-create:hover:not(:disabled),
.btn-create-subscription:hover:not(:disabled) {
  background-color: #223;
}

.btn-next:disabled,
.btn-create:disabled,
.btn-create-subscription:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-create-subscription {
  margin-left: auto;
  margin-right: auto;
  background-color: #2e7d32;
}

.btn-create-subscription:hover:not(:disabled) {
  background-color: #1b5e20;
}

/* Detalhes do pedido */
.order-review {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.review-section h3 {
  color: #335;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

/* Confirmação de pedido */
.order-confirmation {
  text-align: center;
  padding: 1rem;
}

.order-success {
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 1rem;
}

.subscription-creation {
  margin-top: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-message {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Confirmação final */
.final-confirmation {
  text-align: center;
  padding: 2rem 0;
}

.confirmation-details {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;
}

.detail-item {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 200px;
}

.detail-item h3 {
  margin-top: 0;
  color: #335;
  margin-bottom: 0.5rem;
}

.confirmation-message {
  max-width: 600px;
  margin: 1.5rem auto;
  color: #666;
}

.final-actions {
  margin-top: 2rem;
}

.btn-new-simulation {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

/* Tratamento de erros */
.error-container {
  margin-top: 1.5rem;
  border-radius: 4px;
  overflow: hidden;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  margin: 0;
}

.btn-toggle-details {
  background-color: transparent;
  color: #c62828;
  border: 1px solid #c62828;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.error-details {
  background-color: #1e1e1e;
  color: #f0f0f0;
  padding: 1rem;
  border-radius: 0 0 4px 4px;
  font-family: monospace;
  overflow-x: auto;
}

.error-details h4 {
  color: #ff9800;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.error-details pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 0.5rem;
  background-color: #2d2d2d;
  border-radius: 4px;
}

/* Responsividade */
@media (max-width: 768px) {
  .progress-indicator {
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-back, .btn-next, .btn-create, .btn-create-subscription {
    width: 100%;
  }
  
  .confirmation-details {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-panel-review {
    max-height: 80vh; /* Um pouco maior em telas pequenas para melhor visibilidade */
  }
}

.summary-box {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f7ff;
  border: 1px solid #cce5ff;
  border-radius: 4px;
  color: #004085;
}

.selected-products-summary {
  margin-top: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
}

.products-table {
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.product-header {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.product-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.product-total {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-weight: bold;
  background-color: #f9f9f9;
}

.text-muted {
  color: #666;
}
</style>
