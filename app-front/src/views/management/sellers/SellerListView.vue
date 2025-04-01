<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchSellers, type Seller } from '@/services/sellers';
import { RouterLink } from 'vue-router';

const sellers = ref<Seller[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref('');

const filteredSellers = computed(() => {
  if (!searchTerm.value) return sellers.value;
  
  const term = searchTerm.value.toLowerCase();
  return sellers.value.filter(seller => 
    seller.name?.toLowerCase().includes(term) || 
    seller.nuvemshop_id?.toString().includes(term) ||
    seller.asaas_customer_id?.toLowerCase().includes(term)
  );
});

async function loadSellers() {
  loading.value = true;
  error.value = null;
  
  try {
    sellers.value = await fetchSellers();
    if (sellers.value.length === 0) {
      console.log('Nenhum vendedor encontrado');
    }
  } catch (err) {
    error.value = 'Erro ao carregar vendedores. Por favor, tente novamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function deleteSeller(id: number) {
  if (!confirm('Tem certeza que deseja excluir este vendedor?')) return;
  
  try {
    // Implementar a função deleteSeller no service
    // await deleteSeller(id);
    await loadSellers();
  } catch (err) {
    alert('Erro ao excluir vendedor');
    console.error(err);
  }
}

onMounted(() => {
  loadSellers();
});
</script>

<template>
  <div class="seller-list">
    <div class="page-header">
      <h1>Vendedores</h1>
      <RouterLink to="/management/sellers/new" class="btn-add">Adicionar Vendedor</RouterLink>
    </div>
    
    <div class="filters">
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar vendedor..." 
          class="search-input"
        />
      </div>
      <button @click="loadSellers" class="btn-refresh">Atualizar</button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando vendedores...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadSellers" class="btn-retry">Tentar novamente</button>
    </div>
    
    <div v-else-if="sellers.length === 0" class="empty-container">
      <p>Nenhum vendedor cadastrado.</p>
      <RouterLink to="/management/sellers/new" class="btn-add">Adicionar Vendedor</RouterLink>
    </div>
    
    <div v-else>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>ID Nuvemshop</th>
            <th>ID Asaas</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="seller in filteredSellers" :key="seller.id">
            <td>{{ seller.id }}</td>
            <td>{{ seller.name || 'N/A' }}</td>
            <td>{{ seller.nuvemshop_id || 'N/A' }}</td>
            <td>{{ seller.asaas_customer_id || 'Não sincronizado' }}</td>
            <td>{{ seller.app_status || 'N/A' }}</td>
            <td class="actions">
              <RouterLink :to="`/management/sellers/${seller.id}`" class="btn-view">
                Ver
              </RouterLink>
              <RouterLink :to="`/management/sellers/${seller.id}/edit`" class="btn-edit">
                Editar
              </RouterLink>
              <button @click="deleteSeller(seller.id)" class="btn-delete">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.seller-list {
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

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.search-container {
  flex: 1;
  margin-right: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-edit, .btn-delete {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}

.btn-view {
  background-color: #335;
  color: white;
  border: none;
}

.btn-edit {
  background-color: #ff9800;
  color: white;
  border: none;
}

.btn-delete {
  background-color: #f44336;
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
  .filters {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-container {
    margin-right: 0;
  }

  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
