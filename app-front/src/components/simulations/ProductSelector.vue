<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { fetchProducts, type Product } from '@/services/orders';

const props = defineProps<{
  selectedProducts: number[]
}>();

const emit = defineEmits(['update:selectedProducts', 'updateTotalValue']);

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const selectedProductIds = computed({
  get: () => props.selectedProducts,
  set: (value) => {
    emit('update:selectedProducts', value);
    // Chamar calculateTotal quando os produtos selecionados mudam
    calculateTotal();
  }
});

const selectedProductDetails = computed(() => {
  return products.value.filter(product => 
    selectedProductIds.value.includes(product.id)
  );
});

function calculateTotal() {
  const total = selectedProductDetails.value.reduce(
    (sum, product) => sum + product.price, 
    0
  );
  console.log('Calculando total:', total);
  emit('updateTotalValue', total);
}

// Observar mudanças nos produtos carregados ou selecionados para recalcular o total
watch([products, selectedProductIds], () => {
  calculateTotal();
}, { deep: true });

async function loadProducts() {
  loading.value = true;
  error.value = null;
  
  try {
    products.value = await fetchProducts();
    if (products.value.length === 0) {
      error.value = 'Nenhum produto encontrado';
    } else {
      // Calcular o total inicial se já houver produtos selecionados
      calculateTotal();
    }
  } catch (err) {
    error.value = 'Erro ao carregar produtos. Por favor, tente novamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProducts();
});
</script>

<template>
  <div class="product-selector">
    <h3>Selecionar Produtos</h3>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando produtos...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadProducts" class="btn-retry">Tentar novamente</button>
    </div>
    
    <div v-else-if="products.length === 0" class="empty">
      <p>Nenhum produto disponível para seleção.</p>
    </div>
    
    <div v-else class="product-list">
      <div v-for="product in products" :key="product.id" class="product-item">
        <label class="checkbox-container">
          <input 
            type="checkbox" 
            :value="product.id" 
            v-model="selectedProductIds"
          />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) }}</div>
            <div class="product-description">{{ product.description }}</div>
          </div>
        </label>
      </div>
    </div>
    
    <div v-if="selectedProductDetails.length > 0" class="selected-products">
      <h4>Produtos selecionados</h4>
      <ul>
        <li v-for="product in selectedProductDetails" :key="product.id">
          {{ product.name }} - {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) }}
        </li>
      </ul>
      <div class="total">
        <span>Total:</span>
        <span>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProductDetails.reduce((sum, p) => sum + p.price, 0)) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-selector {
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

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.product-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.checkbox-container {
  display: flex;
  padding: 1rem;
  cursor: pointer;
}

input[type="checkbox"] {
  margin-right: 1rem;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.product-price {
  color: #335;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
}

.selected-products {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.selected-products h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #335;
}

.selected-products ul {
  list-style-type: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.selected-products li {
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
}

.total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  padding-top: 0.5rem;
  border-top: 2px solid #ddd;
}
</style>
