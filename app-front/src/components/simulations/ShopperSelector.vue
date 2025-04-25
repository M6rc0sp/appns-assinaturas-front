<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchShoppers, type Shopper } from '@/services/shoppers';

const props = defineProps<{
  selectedShopperId: number | null
}>();

const emit = defineEmits(['update:selectedShopperId']);

const shoppers = ref<Shopper[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref('');

const selectedId = computed({
  get: () => props.selectedShopperId,
  set: (value) => emit('update:selectedShopperId', value)
});

const filteredShoppers = computed(() => {
  if (!searchTerm.value) return shoppers.value;
  
  const term = searchTerm.value.toLowerCase();
  return shoppers.value.filter(shopper => 
    shopper.name.toLowerCase().includes(term) || 
    shopper.email.toLowerCase().includes(term) ||
    shopper.cpfCnpj.includes(term)
  );
});

const selectedShopper = computed(() => {
  if (!selectedId.value) return null;
  return shoppers.value.find(s => s.id === selectedId.value) || null;
});

async function loadShoppers() {
  loading.value = true;
  error.value = null;
  
  try {
    shoppers.value = await fetchShoppers();
    if (shoppers.value.length === 0) {
      error.value = 'Nenhum cliente encontrado';
    }
  } catch (err) {
    error.value = 'Erro ao carregar clientes. Por favor, tente novamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadShoppers();
});
</script>

<template>
  <div class="shopper-selector">
    <h3>Selecionar Cliente</h3>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando clientes...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadShoppers" class="btn-retry">Tentar novamente</button>
    </div>
    
    <template v-else>
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar cliente..." 
          class="search-input"
        />
      </div>
      
      <div v-if="filteredShoppers.length === 0" class="empty">
        <p>Nenhum cliente encontrado com os critérios de busca.</p>
      </div>
      
      <div v-else class="shopper-list">
        <div 
          v-for="shopper in filteredShoppers" 
          :key="shopper.id" 
          class="shopper-item"
          :class="{ 'selected': selectedId === shopper.id }"
          @click="selectedId = shopper.id"
        >
          <div class="shopper-info">
            <div class="shopper-name">{{ shopper.name }}</div>
            <div class="shopper-email">{{ shopper.email }}</div>
            <div class="shopper-detail">CPF/CNPJ: {{ shopper.cpfCnpj }}</div>
            <div class="shopper-detail">Telefone: {{ shopper.mobilePhone }}</div>
          </div>
          <div class="selection-indicator">
            <input 
              type="radio" 
              :value="shopper.id" 
              v-model="selectedId"
              :id="`shopper-${shopper.id}`"
            />
          </div>
        </div>
      </div>
    </template>
    
    <div v-if="selectedShopper" class="selected-shopper">
      <h4>Cliente selecionado</h4>
      <div class="shopper-card">
        <div class="shopper-name">{{ selectedShopper.name }}</div>
        <div class="shopper-email">{{ selectedShopper.email }}</div>
        <div class="shopper-detail">CPF/CNPJ: {{ selectedShopper.cpfCnpj }}</div>
        <div class="shopper-detail">Telefone: {{ selectedShopper.mobilePhone }}</div>
        <!-- Removida referência à propriedade que não existe no tipo Shopper -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.shopper-selector {
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: #335;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.shopper-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

.shopper-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shopper-item:last-child {
  border-bottom: none;
}

.shopper-item:hover {
  background-color: #f5f5f5;
}

.shopper-item.selected {
  background-color: #e6f7e6;
}

.shopper-info {
  flex: 1;
}

.shopper-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.shopper-email {
  color: #335;
  margin-bottom: 0.5rem;
}

.shopper-detail {
  font-size: 0.9rem;
  color: #666;
}

.selected-shopper {
  margin-top: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
}

.selected-shopper h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #335;
}

.shopper-card {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
