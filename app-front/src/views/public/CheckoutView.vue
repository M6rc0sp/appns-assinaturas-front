<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/utils/formatters';
import { createShopperSubscriptionFromOrder } from '@/services/subscriptions';
import { createOrder } from '@/services/orders'; // Importando o serviço de criação de pedidos
import { createShopper } from '@/services/shoppers'; // Importando o serviço para criar compradores
import { usePaymentMethods } from '@/composables/usePaymentMethods';
import CheckoutDisclaimer from '@/components/ui/CheckoutDisclaimer.vue';

const router = useRouter();
const cartStore = useCartStore();

// Composable para métodos de pagamento
const { 
  availablePaymentMethodsWithLabels, 
  isLoading: loadingPaymentMethods, 
  error: paymentMethodsError,
  fetchPaymentMethods,
  isMethodAvailable 
} = usePaymentMethods();

// ID do seller (você pode ajustar isso conforme sua lógica de negócio)
const SELLER_ID = '3'; // Alterado para 3 conforme teste confirmado em https://assinaturas.appns.com.br/api/app/seller/3/payment-methods

// Estado do formulário
const formData = ref({
  fullName: '',
  email: '',
  // confirmEmail: '', // Removido campo de confirmação
  document: '',
  phone: '',
  birthdate: '',
  address: {
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    zipCode: ''
  },
  paymentMethod: 'credit_card',
  creditCard: {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  },
  terms: false
});

// Estado do processo de checkout
const loadingZipCode = ref(false);
const processing = ref(false);
const formStep = ref(1); // 1: Dados pessoais, 2: Endereço, 3: Pagamento
const errors = ref<Record<string, string>>({});

// Computed properties
const totalItems = computed(() => cartStore.totalItems);
const finalPrice = computed(() => cartStore.finalPrice);
const canProceedToStep2 = computed(() => {
  return formData.value.fullName && 
    formData.value.email && 
    formData.value.document &&
    formData.value.phone;
});

const canProceedToStep3 = computed(() => {
  const address = formData.value.address;
  return address.street && 
    address.number && 
    address.district && 
    address.city && 
    address.state && 
    address.zipCode;
});

const canSubmitOrder = computed(() => {
  if (!formData.value.terms) return false;
  
  if (formData.value.paymentMethod === 'credit_card') {
    const cc = formData.value.creditCard;
    return cc.number && cc.name && cc.expiry && cc.cvv;
  }
  
  return true;
});

// Mascarar o CEP (00000-000)
function formatZipCode(zipCode: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = zipCode.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.slice(0, 8);
  
  // Formata como 00000-000 se tiver pelo menos 5 dígitos
  if (limitedNumbers.length > 5) {
    return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`;
  } else {
    return limitedNumbers;
  }
}

// Aplica a formatação sempre que o CEP mudar
watch(() => formData.value.address.zipCode, (newValue) => {
  if (newValue !== formatZipCode(newValue)) {
    formData.value.address.zipCode = formatZipCode(newValue);
  }
});

// Métodos
function goToNextStep() {
  if (formStep.value < 3) {
    formStep.value++;
    window.scrollTo(0, 0);
  }
}

function goToPreviousStep() {
  if (formStep.value > 1) {
    formStep.value--;
    window.scrollTo(0, 0);
  }
}

async function searchAddressByZipCode() {
  const zipCode = formData.value.address.zipCode.replace(/\D/g, ''); // Remove non-digits
  
  // Validate CEP format (8 digits)
  if (zipCode.length !== 8) {
    errors.value.zipCode = 'CEP inválido (deve ter 8 dígitos)';
    // Clear fields potentially filled by previous searches
    formData.value.address.street = '';
    formData.value.address.district = '';
    formData.value.address.city = '';
    formData.value.address.state = '';
    return;
  }
  
  loadingZipCode.value = true;
  errors.value.zipCode = ''; // Clear previous errors
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
    
    if (!response.ok) {
      // Handle HTTP errors (like 400 Bad Request for invalid format, though we validated)
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if ViaCEP returned an error flag (CEP not found)
    if (data.erro) {
      errors.value.zipCode = 'CEP não encontrado.';
      formData.value.address.street = '';
      formData.value.address.district = '';
      formData.value.address.city = '';
      formData.value.address.state = '';
    } else {
      // Populate address fields
      formData.value.address.street = data.logradouro || '';
      formData.value.address.district = data.bairro || '';
      formData.value.address.city = data.localidade || '';
      formData.value.address.state = data.uf || '';
      // Optionally focus the next field, e.g., number
      // document.getElementById('number')?.focus(); 
    }
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    errors.value.zipCode = 'Erro ao consultar CEP. Tente novamente.';
     // Clear fields on error too
    formData.value.address.street = '';
    formData.value.address.district = '';
    formData.value.address.city = '';
    formData.value.address.state = '';
  } finally {
    loadingZipCode.value = false;
  }
}

function backToCatalog() {
  // router.push('/catalog'); // Removido catálogo
}

async function submitOrder() {
  if (processing.value) return;
  
  // Validações finais
  errors.value = {};
  
  if (!formData.value.terms) {
    errors.value.terms = 'Você precisa aceitar os termos para continuar.';
    return;
  }
  
  processing.value = true;
  
  try {
    // 1. Preparar os dados do cliente
    const customerInfo = {
      name: formData.value.fullName,
      email: formData.value.email,
      document: formData.value.document,
      phone: formData.value.phone,
      birthdate: formData.value.birthdate,
      address: {
        street: formData.value.address.street,
        number: formData.value.address.number,
        complement: formData.value.address.complement,
        district: formData.value.address.district,
        city: formData.value.address.city,
        state: formData.value.address.state,
        zipCode: formData.value.address.zipCode
      },
      payment: {
        method: formData.value.paymentMethod,
        creditCard: formData.value.paymentMethod === 'credit_card' ? {
          number: formData.value.creditCard.number,
          name: formData.value.creditCard.name,
          expiry: formData.value.creditCard.expiry,
          cvv: formData.value.creditCard.cvv
        } : null
      }
    };

    // 2. Primeiro criar o comprador (shopper)
    const shopperData = {
      id: 0, // O ID será gerado pelo backend, mas precisamos incluir para satisfazer a interface
      name: formData.value.fullName,
      email: formData.value.email,
      cpfCnpj: formData.value.document,
      mobilePhone: formData.value.phone,
      birthDate: formData.value.birthdate,
      address: `${formData.value.address.street}, ${formData.value.address.number}`,
      addressNumber: formData.value.address.number,
      province: formData.value.address.district,
      postalCode: formData.value.address.zipCode,
      nuvemshop_id: '0' // Adicionando o campo obrigatório nuvemshop_id
    };

    console.log('Criando comprador:', shopperData);
    const shopperResponse = await createShopper(shopperData);
    
    if (!shopperResponse || !shopperResponse.id) {
      throw new Error('Erro ao criar comprador: Resposta inválida da API');
    }
    
    const shopperId = shopperResponse.id;
    console.log('Comprador criado com ID:', shopperId);

    // 3. Formato correto para a API de pedidos (agora usando o shopperId válido)
    const orderData = {
      seller_id: 1, // Definir o ID do vendedor apropriado
      shopper_id: shopperId, // Usando o ID do comprador que acabamos de criar
      products: cartStore.items.map(item => item.product.id), // Array de IDs de produto
      value: cartStore.finalPrice,
      cycle: 'monthly', // Valor padrão ou defina baseado na escolha do usuário
      next_due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // 30 dias a partir de hoje
      billing_type: formData.value.paymentMethod, // Tipo de cobrança baseado no método de pagamento
      customer_info: customerInfo // Informações completas do cliente
    };
    
    // 4. Chamada real para criar o pedido na API
    console.log('Enviando dados do pedido:', orderData);
    const orderResponse = await createOrder(orderData);
    console.log('Resposta da API de pedidos:', orderResponse);
    
    if (!orderResponse || !orderResponse.success) {
      throw new Error('Erro ao criar pedido: ' + (orderResponse?.message || 'Resposta inválida da API'));
    }
    
    const orderId = orderResponse.data.id;
    
    // 5. Criar assinatura a partir do pedido
    console.log('Criando assinatura para o pedido:', orderId);
    const subscriptionResult = await createShopperSubscriptionFromOrder(orderId);
    
    console.log('Resposta da API de assinaturas:', subscriptionResult);
    
    if (!subscriptionResult) {
      throw new Error('Erro ao criar assinatura: Resposta inválida da API');
    }
    
    // 6. Prepara os dados para a página de sucesso
    const orderDetails = {
      subscription_id: subscriptionResult.id,
      shopper_name: formData.value.fullName,
      shopper_email: formData.value.email,
      date: new Date().toISOString(),
      total: cartStore.finalPrice,
      items: cartStore.items.map(item => ({
        product: item.product,
        quantity: item.quantity
      }))
    };
    
    // 7. Armazena no localStorage para uso na página de sucesso
    localStorage.setItem('appns_last_order', JSON.stringify(orderDetails));
    
    // 8. Limpa o carrinho
    cartStore.clearCart();
    
    // 9. Redireciona para a página de sucesso
    router.push('/success');
  } catch (error) {
    console.error('Erro ao processar o pedido:', error);
    errors.value.submit = 'Erro ao processar o pedido: ' + (error instanceof Error ? error.message : 'Erro desconhecido');
    processing.value = false;
  }
}

// Verificar se há itens no carrinho ao carregar a página e buscar métodos de pagamento
onMounted(async () => {
  if (cartStore.totalItems === 0) {
    // router.push('/catalog'); // Removido catálogo
  }
  
  // Buscar métodos de pagamento disponíveis para o seller
  await fetchPaymentMethods(SELLER_ID);
  
  // Se nenhum método de pagamento estiver disponível ou o método atual não estiver disponível,
  // definir o primeiro método disponível como padrão
  if (availablePaymentMethodsWithLabels.value.length > 0) {
    if (!isMethodAvailable(formData.value.paymentMethod)) {
      formData.value.paymentMethod = availablePaymentMethodsWithLabels.value[0].code;
    }
  }
});
</script>

<template>
  <div class="app-area">
    <div class="container p-4">      
      <!-- Passos do checkout -->
      <div class="checkout-steps mb-5">
        <div class="row justify-content-center">
          <div class="col-md-10 col-lg-8">
            <div class="d-flex justify-content-between checkout-steps-container">
              <div class="step text-center flex-fill" :class="{ active: formStep >= 1, completed: formStep > 1 }">
                <div class="step-number">1</div>
                <div class="step-label mt-2">Cadastro</div> <!-- Text already changed -->
              </div>
              <div class="step-line flex-grow-1"></div>
              <div class="step text-center flex-fill" :class="{ active: formStep >= 2, completed: formStep > 2 }">
                 <!-- Removed step-number-wrapper -->
                 <div class="step-number">2</div>
                <div class="step-label mt-2">Endereço</div>
              </div>
              <div class="step-line flex-grow-1"></div>
              <div class="step text-center flex-fill" :class="{ active: formStep >= 3 }">
                 <!-- Removed step-number-wrapper -->
                 <div class="step-number">3</div>
                <div class="step-label mt-2">Pagamento</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <!-- Formulário de checkout -->
        <div class="col-lg-8">
          <div class="box p-4 p-md-5 mb-4 rounded shadow-sm">
            <!-- Passo 1: Dados pessoais -->
            <div v-if="formStep === 1">
              <h4 class="mb-4 checkout-step-title">Seus dados</h4>
              
              <div class="row g-3">
                <div class="col-12">
                  <label for="fullName" class="form-label fw-semibold">Nome completo</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="fullName"
                    v-model="formData.fullName"
                    :class="{ 'is-invalid': errors.fullName }"
                  >
                  <div v-if="errors.fullName" class="invalid-feedback">{{ errors.fullName }}</div>
                </div>
                
                <div class="col-md-6">
                  <label for="email" class="form-label fw-semibold">E-mail</label>
                  <input 
                    type="email" 
                    class="form-control form-control-lg" 
                    id="email"
                    v-model="formData.email"
                    :class="{ 'is-invalid': errors.email }"
                  >
                  <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                </div>
                
                <!-- Removido campo de confirmação de e-mail -->
                
                <div class="col-md-6">
                  <label for="document" class="form-label fw-semibold">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="document"
                    v-model="formData.document"
                    :class="{ 'is-invalid': errors.document }"
                    placeholder="000.000.000-00"
                  >
                  <div v-if="errors.document" class="invalid-feedback">{{ errors.document }}</div>
                </div>
                
                <div class="col-md-6">
                  <label for="phone" class="form-label fw-semibold">Telefone</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="phone"
                    v-model="formData.phone"
                    :class="{ 'is-invalid': errors.phone }"
                    placeholder="(00) 00000-0000"
                  >
                  <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
                </div>
                
                <div class="col-md-6">
                  <label for="birthdate" class="form-label fw-semibold">Data de nascimento</label>
                  <input 
                    type="date" 
                    class="form-control form-control-lg" 
                    id="birthdate"
                    v-model="formData.birthdate"
                    :class="{ 'is-invalid': errors.birthdate }"
                  >
                  <div v-if="errors.birthdate" class="invalid-feedback">{{ errors.birthdate }}</div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-5 form-step-actions">
                <button 
                  @click="goToNextStep" 
                  class="btn btn-primary btn-lg px-5"
                  :disabled="!canProceedToStep2"
                >
                  Continuar
                </button>
              </div>
            </div>
            
            <!-- Passo 2: Endereço -->
            <div v-if="formStep === 2">
              <h4 class="mb-4 checkout-step-title">Endereço de entrega</h4>
              
              <div class="row g-3">
                <div class="col-md-4">
                  <label for="zipCode" class="form-label fw-semibold">CEP</label>
                  <div class="input-group input-group-lg">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="zipCode"
                      v-model="formData.address.zipCode"
                      :class="{ 'is-invalid': errors.zipCode }"
                      placeholder="00000-000"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="searchAddressByZipCode"
                      :disabled="loadingZipCode"
                    >
                      <span v-if="loadingZipCode" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span v-else>Buscar</span>
                    </button>
                  </div>
                  <!-- Moved outside input-group -->
                  <div v-if="errors.zipCode" class="invalid-feedback d-block">{{ errors.zipCode }}</div>
                </div>
                
                <div class="col-md-8">
                  <label for="street" class="form-label fw-semibold">Rua/Avenida</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="street"
                    v-model="formData.address.street"
                    :class="{ 'is-invalid': errors.street }"
                  >
                  <div v-if="errors.street" class="invalid-feedback">{{ errors.street }}</div>
                </div>
                
                <div class="col-md-4">
                  <label for="number" class="form-label fw-semibold">Número</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="number"
                    v-model="formData.address.number"
                    :class="{ 'is-invalid': errors.number }"
                  >
                  <div v-if="errors.number" class="invalid-feedback">{{ errors.number }}</div>
                </div>
                
                <div class="col-md-8">
                  <label for="complement" class="form-label fw-semibold">Complemento (opcional)</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="complement"
                    v-model="formData.address.complement"
                  >
                </div>
                
                <div class="col-md-6">
                  <label for="district" class="form-label fw-semibold">Bairro</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="district"
                    v-model="formData.address.district"
                    :class="{ 'is-invalid': errors.district }"
                  >
                  <div v-if="errors.district" class="invalid-feedback">{{ errors.district }}</div>
                </div>
                
                <div class="col-md-6">
                  <label for="city" class="form-label fw-semibold">Cidade</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="city"
                    v-model="formData.address.city"
                    :class="{ 'is-invalid': errors.city }"
                  >
                  <div v-if="errors.city" class="invalid-feedback">{{ errors.city }}</div>
                </div>
                
                <div class="col-md-6">
                  <label for="state" class="form-label fw-semibold">Estado</label>
                  <select 
                    class="form-select form-select-lg" 
                    id="state"
                    v-model="formData.address.state"
                    :class="{ 'is-invalid': errors.state }"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  <div v-if="errors.state" class="invalid-feedback">{{ errors.state }}</div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-5 form-step-actions">
                <button @click="goToPreviousStep" class="btn btn-outline-secondary btn-lg px-4">
                  Voltar
                </button>
                <button 
                  @click="goToNextStep" 
                  class="btn btn-primary btn-lg px-5 ms-3"
                  :disabled="!canProceedToStep3"
                >
                  Continuar
                </button>
              </div>
            </div>
            
            <!-- Passo 3: Pagamento -->
            <div v-if="formStep === 3">
              <h4 class="mb-4 checkout-step-title">Forma de pagamento</h4>
              
              <div class="payment-methods mb-4">
                <!-- Mensagem de carregamento -->
                <div v-if="loadingPaymentMethods" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                  <span>Carregando métodos de pagamento...</span>
                </div>
                
                <!-- Erro ao carregar métodos de pagamento -->
                <div v-else-if="paymentMethodsError" class="alert alert-warning">
                  {{ paymentMethodsError }}
                </div>
                
                <!-- Métodos de pagamento disponíveis -->
                <template v-else>
                  <div v-for="method in availablePaymentMethodsWithLabels" 
                       :key="method.code" 
                       class="form-check form-check-inline payment-option">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod"
                      :id="`${method.code}Payment`"
                      :value="method.code"
                      v-model="formData.paymentMethod"
                    >
                    <label class="form-check-label payment-label" :for="`${method.code}Payment`">
                      <span class="material-symbols-outlined me-2">{{ method.icon }}</span>
                      {{ method.label }}
                    </label>
                  </div>
                  
                  <!-- Mensagem quando nenhum método está disponível -->
                  <div v-if="availablePaymentMethodsWithLabels.length === 0" class="alert alert-info">
                    Nenhum método de pagamento disponível no momento.
                  </div>
                </template>
              </div>
              
              <!-- Formulário para cartão de crédito -->
              <div v-if="formData.paymentMethod === 'credit_card'" class="credit-card-form">
                <div class="row g-3">
                  <div class="col-12">
                    <label for="cardNumber" class="form-label">Número do cartão</label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg" 
                      id="cardNumber"
                      v-model="formData.creditCard.number"
                      :class="{ 'is-invalid': errors.cardNumber }"
                      placeholder="0000 0000 0000 0000"
                    >
                    <div v-if="errors.cardNumber" class="invalid-feedback">{{ errors.cardNumber }}</div>
                  </div>
                  
                  <div class="col-12">
                    <label for="cardName" class="form-label">Nome impresso no cartão</label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg" 
                      id="cardName"
                      v-model="formData.creditCard.name"
                      :class="{ 'is-invalid': errors.cardName }"
                    >
                    <div v-if="errors.cardName" class="invalid-feedback">{{ errors.cardName }}</div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="cardExpiry" class="form-label">Validade (MM/AA)</label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg" 
                      id="cardExpiry"
                      v-model="formData.creditCard.expiry"
                      :class="{ 'is-invalid': errors.cardExpiry }"
                      placeholder="MM/AA"
                    >
                    <div v-if="errors.cardExpiry" class="invalid-feedback">{{ errors.cardExpiry }}</div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="cardCVV" class="form-label">CVV</label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg" 
                      id="cardCVV"
                      v-model="formData.creditCard.cvv"
                      :class="{ 'is-invalid': errors.cardCVV }"
                      placeholder="000"
                      maxlength="4"
                    >
                    <div v-if="errors.cardCVV" class="invalid-feedback">{{ errors.cardCVV }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Instruções para PIX -->
              <div v-else-if="formData.paymentMethod === 'pix'" class="pix-instructions">
                <div class="alert alert-info">
                  <p class="mb-0">Após finalizar o pedido, você receberá o QR Code PIX para pagamento.</p>
                </div>
              </div>
              
              <!-- Instruções para Boleto -->
              <div v-else-if="formData.paymentMethod === 'boleto' || formData.paymentMethod === 'bank_slip'" class="bank-slip-instructions">
                <div class="alert alert-info">
                  <p class="mb-0">Após finalizar o pedido, você receberá o boleto bancário por e-mail.</p>
                </div>
              </div>
              
              <!-- Termos e condições -->
              <div class="terms-and-conditions mt-4">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="termsCheck"
                    v-model="formData.terms"
                    :class="{ 'is-invalid': errors.terms }"
                  >
                  <label class="form-check-label" for="termsCheck">
                    Li e concordo com os <a href="#" class="text-primary">Termos e Condições</a> e <a href="#" class="text-primary">Política de Privacidade</a>
                  </label>
                  <div v-if="errors.terms" class="invalid-feedback">{{ errors.terms }}</div>
                </div>
              </div>
              
              <!-- Erro geral -->
              <div v-if="errors.submit" class="alert alert-danger mt-3">
                {{ errors.submit }}
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-4 form-step-actions">
                <button @click="goToPreviousStep" class="btn btn-outline-secondary btn-lg">
                  Voltar
                </button>
                <button 
                  @click="submitOrder" 
                  class="btn btn-primary btn-lg ms-3"
                  :disabled="!canSubmitOrder || processing"
                >
                  <span v-if="processing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Finalizar Assinatura
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resumo do pedido -->
        <div class="col-lg-4">
          <div class="box p-4 order-summary">
            <h5 class="mb-4 order-summary-title">Resumo do pedido</h5>
            
            <div v-if="cartStore.items.length === 0" class="text-center text-muted py-3">
              Seu carrinho está vazio.
            </div>

            <ul class="list-unstyled mb-0 order-summary-list">
              <li v-for="(item, index) in cartStore.items" :key="index" class="cart-item order-summary-flex align-items-center py-3" :class="{ 'border-bottom': index < cartStore.items.length - 1 }">
                <div class="order-summary-img-wrap">
                  <img 
                    :src="item.product.images && item.product.images.length ? item.product.images[0] : 'https://placehold.co/60x60?text=Sem+Imagem'"
                    class="img-fluid cart-item-image" 
                    :alt="item.product.name"
                  >
                </div>
                <div class="flex-grow-1 order-summary-info ms-3">
                  <div class="cart-item-name fw-semibold" style="font-size: 1.05rem;">{{ item.product.name }}</div>
                  <div class="cart-item-description text-muted" v-if="item.product.description" style="font-size: 0.92rem; line-height: 1.3;">{{ item.product.description }}</div>
                </div>
                <div class="cart-item-price text-end ms-2" style="min-width: 90px;">
                  <span class="fw-bold" style="font-size: 1.08rem; color: #222;">{{ formatCurrency(item.product.sale_price || item.product.price) }}/mês</span>
                </div>
              </li>
            </ul>
            
            <div class="totals mt-4 pt-3 border-top">
              <div class="total d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>{{ formatCurrency(finalPrice) }}/mês</span>
              </div>
            </div>
            
            <div class="info-box mt-4">
              <ul class="list-unstyled mb-0">
                <li class="d-flex align-items-center mb-2 info-box-item">
                  <span class="material-symbols-outlined me-2 text-success">verified</span>
                  <span>Pagamento seguro</span>
                </li>
                <li class="d-flex align-items-center mb-2 info-box-item">
                  <span class="material-symbols-outlined me-2 text-success">cycle</span>
                  <span>Cancele quando quiser</span>
                </li>
                <li class="d-flex align-items-center info-box-item">
                  <span class="material-symbols-outlined me-2 text-success">support_agent</span>
                  <span>Suporte 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <CheckoutDisclaimer />
    </div>
  </div>
</template>

<style scoped>
.box {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 30px rgba(0,0,0,.04);
  padding: 24px 20px;
}

.checkout-steps {
  padding: 20px 0;
}

.checkout-steps-container {
  /* position: relative; /* No longer needed for line positioning */
  padding: 0 10px; 
  display: flex; 
  align-items: center; /* Align items vertically in the center */
  width: 100%; /* Ensure it takes full width */
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* position: relative; /* No longer needed */
  /* z-index: 1; /* No longer needed */
  min-width: 80px; 
  flex-basis: 0; /* Allow steps to shrink/grow */
  flex-grow: 0; /* Steps themselves don't grow, lines do */
}

/* REMOVED .step-number-wrapper styles */

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e9ecef;
  background-color: #fff;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  /* position: relative; /* No longer needed */
  /* z-index: 2; /* No longer needed */
}

.step-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: #00d283;
  background-color: #00d283;
  color: white;
}

.step.active .step-label {
  color: #212529;
  font-weight: 600;
}

.step.completed .step-number {
  border-color: #198754;
  background-color: #198754;
  color: white;
}

.step.completed .step-label {
  color: #212529;
}

.step-line {
  flex-grow: 1; /* Fill space between steps */
  height: 2px;
  background-color: #e9ecef;
  margin: 0 5px; /* Add some horizontal margin around the line */
  /* REMOVED all absolute positioning properties */
  align-self: center; /* Ensure line stays centered vertically */
  margin-bottom: 1.5rem; /* Adjust to align with bottom of number/top of label roughly */
}

.checkout-step-title {
  font-size: 1.5rem; /* Aumenta o tamanho do título do passo */
  font-weight: 600;
}

.order-summary-title {
  font-size: 1.3rem; /* Aumenta o tamanho do título do resumo */
  font-weight: 600;
}

.form-label {
  margin-bottom: 0.25rem; /* Reduz espaço abaixo do label */
  font-size: 0.95rem;
  font-weight: 500;
  display: block; /* Garante que o label ocupe a linha */
}

/* Adiciona espaço abaixo dos campos de formulário */
.row.g-3 > div {
  margin-bottom: 0.75rem; /* Ajuste este valor conforme necessário */
}

.form-control, .form-select {
  border-radius: 8px; /* Reduced border-radius */
  border: 1.5px solid #e0e0e0;
  background: #fafbfc;
  transition: box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  padding-left: 0.85rem; /* Slightly increased padding */
}

/* Increase height for large inputs/selects */
.form-control-lg, .form-select-lg {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  font-size: 1rem; /* Adjust font size if needed */
  padding-left: 0.85rem; /* Slightly increased padding */
  height: calc(1.5em + 1.2rem + 3px); /* Match Bootstrap's calculated height for -lg */
  width: 100%; /* Make select fill column width */
}

/* Adjust select arrow position */
.form-select-lg {
  background-position: right 1rem center; /* Increased distance from right edge */
}

.input-group .form-control {
  /* Ensure input group inputs also get the radius adjustment if needed */
  border-radius: 8px 0 0 8px; 
}
.input-group .btn {
  border-radius: 0 8px 8px 0;
  font-weight: 600; /* Mesmo peso dos outros botões */
  /* Ajuste padding se necessário para alinhar altura com input-group-lg */
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  border-color: #e0e0e0; /* Garante a mesma cor de borda */
}

.btn-lg, .btn-primary, .btn-outline-secondary, .btn {
  border-radius: 8px; /* Reduced border-radius */
  font-weight: 600;
}

.order-summary {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 30px rgba(0,0,0,.04);
}

.cart-item {
  gap: 0.75rem; 
  padding: 0.75rem 0.25rem; /* Added vertical padding for card feel */
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
  flex-shrink: 0; /* Impede que a imagem encolha */
}

.cart-item-name {
  font-weight: 500;
  margin-bottom: 0.1rem;
  line-height: 1.3;
}

.cart-item-description {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.1rem;
}

.cart-item-price {
  font-size: 0.95rem;
  color: #555;
}

.cart-item-remove-btn {
  padding: 0.3rem 0.6rem; /* Adjusted padding */
  line-height: 1; /* Adjusted for icon alignment */
  border-radius: 6px; /* Slightly smaller radius for small button */
  flex-shrink: 0; 
  font-size: 0.8rem; /* Make text slightly smaller */
  font-weight: 600; /* Bolder text */
  /* btn-danger styles will be applied */
}
.cart-item-remove-btn .material-symbols-outlined {
  font-size: 1rem; /* Adjust icon size */
  vertical-align: middle; /* Keep trying vertical align */
}

.totals {
  font-size: 1.1rem;
}

.total {
  color: #00d283;
  font-size: 1.3rem; /* Aumenta o total */
  font-weight: 600;
}

.info-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 18px;
}

.info-box ul {
  list-style-type: none !important; /* Garante a remoção */
  padding-left: 0 !important; /* Garante a remoção */
  margin-bottom: 0; /* Garante que a ul não adicione margem extra */
}

.info-box li {
  font-size: 0.95rem;
}

.info-box .material-symbols-outlined {
  font-size: 1.3rem; /* Ajusta tamanho dos ícones de info */
  vertical-align: middle; /* Re-attempt vertical align */
  line-height: 1; /* Ensure line height doesn't interfere */
  flex-shrink: 0; /* Prevent icon shrinking */
}
.info-box-item span:last-child {
  line-height: 1.4; /* Adjust text line-height slightly for better centering */
}

.terms-and-conditions .form-check-input:checked {
  background-color: #00d283;
  border-color: #00d283;
}

/* Melhorando inputs de cartão */
.credit-card-form .form-control {
  font-size: 1.1rem;
  letter-spacing: 0.05em;
}

/* Ajuste para botões de quantidade e remover produto (futuro) */
.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-item-actions button {
  border: none;
  background: transparent;
  color: #f06464;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;
}
.cart-item-actions button:hover {
  color: #d32f2f;
}

@media (max-width: 991px) {
  .order-summary {
    margin-top: 32px;
  }
}

/* Ensure icon font is loaded and applied */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 20px; /* Adjust size as needed */
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  vertical-align: middle; /* Align icon better with text */
}

/* Remove estilo de lista (Final Attempt) */
.order-summary-list,
.info-box ul {
  list-style: none !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}
.order-summary-list li,
.info-box li {
  list-style: none !important; /* Apply directly to li */
  list-style-type: none !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
  /* display: list-item; /* Try removing this if it causes issues */
}

/* Input Group Input (CEP) Alignment */
.input-group-lg > .form-control {
  padding-top: 0.6rem;    /* Match lg input padding */
  padding-bottom: 0.6rem; /* Match lg input padding */
  font-size: 1rem;        /* Match lg input font size */
  height: auto;           /* Ensure height adjusts to padding */
}

/* Ensure button height matches adjusted input */
.input-group-lg > .btn {
  padding-top: 0.6rem;    
  padding-bottom: 0.6rem; 
  font-size: 1rem;        
  line-height: 1.5;       
}

/* Box containing the form steps */
.col-lg-8 > .box {
  max-height: 75vh; /* Limit height */
  overflow-y: auto; /* Add scrollbar if content overflows */
  display: flex; /* Use flexbox for internal layout */
  flex-direction: column; /* Stack step divs vertically */
}

/* Ensure step divs take available space but don't force parent growth */
.col-lg-8 > .box > div[v-if] {
  flex-shrink: 0; /* Prevent steps from shrinking */
}

/* Ensure consistent height for all large elements */
.form-control-lg,
.form-select-lg,
.input-group-lg > .form-control,
.input-group-lg > .btn {
  height: calc(1.5em + 1.2rem + 3px); /* Match Bootstrap's calculated height for -lg */
  /* Ensure vertical alignment within input-group */
  display: flex; 
  align-items: center;
}

/* Specific adjustments might be needed for button text alignment */
.input-group-lg > .btn {
  justify-content: center; /* Center button text/spinner */
}

/* Input Group (CEP) Layout Fix */
.input-group-lg {
  /* Ensure the group itself behaves correctly with flex */
  display: flex;
  width: 100%; /* Group takes full width of its column */
  height: calc(1.5em + 1.2rem + 3px); /* Match -lg height */
}

.input-group-lg > .form-control {
  /* Input should grow, not have fixed 100% width */
  flex: 1 1 auto; 
  width: 1%; /* Fix for flex bug in some browsers */
  height: 100%; /* Match parent height */
  /* Remove potentially conflicting height/padding styles if they were overriding */
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  font-size: 1rem;
  /* Ensure border radius is correct */
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-lg > .btn {
  /* Button should not grow/shrink */
  flex: 0 0 auto;
  height: 100%; /* Match parent height */
  /* Ensure vertical alignment */
  display: inline-flex; 
  align-items: center;
  /* Ensure border radius is correct */
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  /* Reset padding if needed, let height and align-items handle centering */
  padding: 0.6rem 0.75rem; 
}

/* Remove previous height overrides if they conflict */
/* 
.input-group-lg > .form-control {
  height: auto; 
}
.input-group-lg > .btn {
  line-height: 1.5; 
}
*/

/* Payment Method Radio Styling */
.payment-methods {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 1rem;
}

.payment-option {
  /* Remove default inline padding/margin */
  padding-left: 0;
  margin-right: 0; 
}

.payment-option .form-check-input {
  display: none; /* Hide default radio */
}

.payment-option .payment-label {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.payment-option .payment-label:hover {
  border-color: #adb5bd;
}

.payment-option .form-check-input:checked + .payment-label {
  border-color: #00d283;
  background-color: #e6fcf4;
  box-shadow: 0 2px 8px rgba(0, 210, 131, 0.1);
  color: #007a4d;
}

.payment-option .payment-label .material-symbols-outlined {
  font-size: 1.8rem; /* Increased icon size */
  margin-right: 0.75rem; /* More space between icon and text */
  vertical-align: middle; /* Ensure alignment */
}

.order-summary-flex {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 0.75rem;
}
.order-summary-img-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
}
.order-summary-img-wrap img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
}
.order-summary-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>