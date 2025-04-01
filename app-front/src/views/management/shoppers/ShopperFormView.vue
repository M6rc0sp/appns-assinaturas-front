<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchShopperById, createShopper, updateShopper, type Shopper } from '@/services/shoppers';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => route.name === 'shopper-edit');
const shopperId = computed(() => isEdit.value ? Number(route.params.id) : null);

const formData = ref<Partial<Shopper>>({
  name: '',
  email: '',
  cpfCnpj: '',
  mobilePhone: '',
  address: '',
  addressNumber: '',
  province: '',
  postalCode: '',
  birthDate: ''
});

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

async function loadShopper() {
  if (!isEdit.value || !shopperId.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const shopper = await fetchShopperById(shopperId.value);
    if (shopper) {
      // Formatar a data de nascimento para o formato HTML date input (YYYY-MM-DD)
      if (shopper.birthDate) {
        const date = new Date(shopper.birthDate);
        shopper.birthDate = date.toISOString().split('T')[0];
      }
      
      // Preencher o formulário com os dados do cliente
      formData.value = { ...shopper };
    } else {
      error.value = 'Cliente não encontrado';
    }
  } catch (err) {
    error.value = 'Erro ao carregar detalhes do cliente';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  saving.value = true;
  error.value = null;
  
  try {
    if (isEdit.value && shopperId.value) {
      // Atualizar cliente existente
      await updateShopper(shopperId.value, formData.value);
      alert('Cliente atualizado com sucesso!');
    } else {
      // Criar novo cliente
      await createShopper(formData.value as Shopper);
      alert('Cliente criado com sucesso!');
    }
    
    // Redirecionar de volta para a lista de clientes
    router.push('/management/shoppers');
  } catch (err: any) {
    error.value = err.message || 'Erro ao salvar cliente';
    console.error(err);
  } finally {
    saving.value = false;
  }
}

// Função para validar CPF/CNPJ
function validateCpfCnpj() {
  const cpfCnpj = formData.value.cpfCnpj;
  if (!cpfCnpj) return true; // Campo vazio passa na validação
  
  // Verifica se é um CPF (11 dígitos) ou CNPJ (14 dígitos)
  const cleaned = cpfCnpj.replace(/\D/g, '');
  return cleaned.length === 11 || cleaned.length === 14;
}

// Verifica se o formulário é válido
const isFormValid = computed(() => {
  return (
    !!formData.value.name &&
    !!formData.value.email &&
    !!formData.value.cpfCnpj &&
    validateCpfCnpj() &&
    !!formData.value.mobilePhone
  );
});

onMounted(() => {
  loadShopper();
});
</script>

<template>
  <div class="shopper-form">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>{{ isEdit ? 'Editar' : 'Adicionar' }} Cliente</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando dados...</p>
    </div>
    
    <div v-else-if="error && !formData" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadShopper" class="btn-retry">Tentar novamente</button>
      <button @click="router.push('/management/shoppers')" class="btn-return">Voltar à lista</button>
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="form-card">
      <div class="form-error" v-if="error">{{ error }}</div>
      
      <div class="form-section">
        <h3>Informações Pessoais</h3>
        
        <div class="form-group">
          <label for="name">Nome <span class="required">*</span></label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">E-mail <span class="required">*</span></label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="cpfCnpj">CPF/CNPJ <span class="required">*</span></label>
          <input 
            type="text" 
            id="cpfCnpj" 
            v-model="formData.cpfCnpj" 
            class="form-control"
            :class="{ 'is-invalid': formData.cpfCnpj && !validateCpfCnpj() }"
            required
          />
          <small class="form-help" :class="{ 'text-danger': formData.cpfCnpj && !validateCpfCnpj() }">
            {{ formData.cpfCnpj && !validateCpfCnpj() ? 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' : 'Digite apenas números' }}
          </small>
        </div>
        
        <div class="form-group">
          <label for="mobilePhone">Telefone <span class="required">*</span></label>
          <input 
            type="tel" 
            id="mobilePhone" 
            v-model="formData.mobilePhone" 
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="birthDate">Data de Nascimento</label>
          <input 
            type="date" 
            id="birthDate" 
            v-model="formData.birthDate" 
            class="form-control"
          />
        </div>
      </div>
      
      <div class="form-section">
        <h3>Endereço</h3>
        
        <div class="form-group">
          <label for="address">Logradouro</label>
          <input 
            type="text" 
            id="address" 
            v-model="formData.address" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="addressNumber">Número</label>
          <input 
            type="text" 
            id="addressNumber" 
            v-model="formData.addressNumber" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="province">Bairro</label>
          <input 
            type="text" 
            id="province" 
            v-model="formData.province" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="postalCode">CEP</label>
          <input 
            type="text" 
            id="postalCode" 
            v-model="formData.postalCode" 
            class="form-control"
          />
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="router.back()">Cancelar</button>
        <button 
          type="submit" 
          class="btn-save" 
          :disabled="saving || !isFormValid"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.shopper-form {
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

.form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #335;
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
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
}

.form-control.is-invalid {
  border-color: #c62828;
  background-color: #ffebee;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  color: #757575;
  font-size: 0.85rem;
}

.text-danger {
  color: #c62828 !important;
}

.required {
  color: #c62828;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover:not(:disabled) {
  background-color: #43a047;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
