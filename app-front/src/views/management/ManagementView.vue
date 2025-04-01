<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="management-view">
    <div class="management-sidebar">
      <h2>Gerenciamento</h2>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3>Vendedores</h3>
          <ul>
            <li><RouterLink to="/management/sellers">Listar Vendedores</RouterLink></li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3>Clientes</h3>
          <ul>
            <li><RouterLink to="/management/shoppers">Listar Clientes</RouterLink></li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3>Pedidos</h3>
          <ul>
            <li><RouterLink to="/management/orders">Listar Pedidos</RouterLink></li>
          </ul>
        </div>
      </nav>
    </div>
    
    <div class="management-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.management-view {
  display: flex;
  min-height: calc(100vh - 180px);
}

.management-sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
}

.management-sidebar h2 {
  color: #335;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-section h3 {
  color: #666;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.nav-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-section li {
  margin-bottom: 0.5rem;
}

.nav-section a {
  display: block;
  padding: 0.5rem;
  color: #335;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-section a:hover {
  background-color: #e6e6e6;
}

.nav-section a.router-link-active {
  background-color: #335;
  color: white;
}

.management-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .management-view {
    flex-direction: column;
  }
  
  .management-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
  
  .sidebar-nav {
    flex-direction: row;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .nav-section {
    min-width: 200px;
  }
}
</style>
