<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchShoppers, type Shopper } from '@/services/shoppers';
import { RouterLink } from 'vue-router';

const shoppers = ref<Shopper[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref('');

const filteredShoppers = computed(() => {
  if (!searchTerm.value) return shoppers.value;
  
  const term = searchTerm.value.toLowerCase();
  return shoppers.value.filter(shopper => 
    shopper.name.toLowerCase().includes(term) || 
    shopper.email.toLowerCase().includes(term) ||
    shopper.cpfCnpj.includes(term)
  );
});

async function loadShoppers() {
  loading.value = true;
  error.value = null;
  
  try {
    shoppers.value = await fetchShoppers();
    if (shoppers.value.length === 0) {
      console.log('Nenhum cliente encontrado');
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
  <div class="shopper-list">
    <div class="page-header">
      <h1>Clientes</h1>
      <RouterLink to="/management/shoppers/new" class="btn-add">Adicionar Cliente</RouterLink>
    </div>
    
    <div class="filters">
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar cliente..." 
          class="search-input"
        />
      </div>
      <button @click="loadShoppers" class="btn-refresh">Atualizar</button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando clientes...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadShoppers" class="btn-retry">Tentar novamente</button>
    </div>
    
    <div v-else-if="shoppers.length === 0" class="empty-container">
      <p>Nenhum cliente cadastrado.</p>
      <RouterLink to="/management/shoppers/new" class="btn-add">Adicionar Cliente</RouterLink>
    </div>
    
    <div v-else>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>CPF/CNPJ</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shopper in filteredShoppers" :key="shopper.id">
            <td>{{ shopper.id }}</td>
            <td>{{ shopper.name }}</td>
            <td>{{ shopper.email }}</td>
            <td>{{ shopper.cpfCnpj }}</td>
            <td>{{ shopper.mobilePhone }}</td>
            <td class="actions">
              <RouterLink :to="`/management/shoppers/${shopper.id}`" class="btn-view">
                Ver
              </RouterLink>
              <RouterLink :to="`/management/shoppers/${shopper.id}/edit`" class="btn-edit">
                Editar
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.shopper-list {
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

.btn-view, .btn-edit {
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
