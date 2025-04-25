<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div class="home">
    <div class="hero-section">
      <h1>Gerencie suas assinaturas com facilidade</h1>
      <p class="subtitle">Uma plataforma completa para gerenciar assinaturas, pagamentos e clientes em um só lugar.</p>
      <div class="cta-buttons">
        <RouterLink to="/subscriptions" class="cta-button">Ver assinaturas</RouterLink>
        <RouterLink to="/simulate" class="cta-button secondary">Simular assinatura</RouterLink>
      </div>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="icon">📊</div>
        <h2>Assinaturas</h2>
        <p>Gerencie todas as assinaturas de seus clientes em um só lugar. Acompanhe status, vencimentos e renovações.</p>
        <RouterLink to="/subscriptions" class="btn-primary">Ver assinaturas</RouterLink>
      </div>
      
      <div class="feature-card">
        <div class="icon">🔄</div>
        <h2>Simulação</h2>
        <p>Simule o processo de assinatura do início ao fim. Crie pedidos e assinaturas para testar o fluxo completo.</p>
        <RouterLink to="/simulate" class="btn-primary">Simular agora</RouterLink>
      </div>
      
      <div class="feature-card">
        <div class="icon">💰</div>
        <h2>Pagamentos</h2>
        <p>Acompanhe todos os pagamentos recebidos e pendentes. Gerencie cobranças e notificações.</p>
        <button class="btn-primary" disabled>Em breve</button>
      </div>
    </div>

    <div class="home-container">
      <h1>Bem-vindo ao Assinaturas App</h1>
      <p>Plataforma de gerenciamento de assinaturas para seus negócios</p>

      <div class="feature-cards">
        <div class="feature-card">
          <h3>Gerenciar Assinaturas</h3>
          <p>Visualize e administre as assinaturas dos seus clientes de forma simples e eficiente.</p>
          <router-link to="/subscriptions" class="btn btn-primary">Ver Assinaturas</router-link>
        </div>

        <div class="feature-card">
          <h3>Simular Assinatura</h3>
          <p>Simule novos planos de assinatura e veja como eles funcionariam antes de implementá-los.</p>
          <router-link to="/simulate" class="btn btn-outline-primary">Simular</router-link>
        </div>

        <div class="feature-card">
          <h3>Área do Cliente</h3>
          <p>Acesse o catálogo de produtos disponíveis para assinatura e gerencie suas assinaturas.</p>
          <router-link to="/public/catalog" class="btn btn-success">Acessar Catálogo</router-link>
        </div>
      </div>

      <div class="management-section" v-if="isAuthenticated">
        <h2>Área de Gerenciamento</h2>
        <div class="management-cards">
          <div class="management-card">
            <h3>Vendedores</h3>
            <p>Gerenciar vendedores e suas configurações.</p>
            <router-link to="/management/sellers" class="btn btn-sm btn-outline-secondary">Gerenciar</router-link>
          </div>

          <div class="management-card">
            <h3>Clientes</h3>
            <p>Visualizar e administrar clientes cadastrados.</p>
            <router-link to="/management/shoppers" class="btn btn-sm btn-outline-secondary">Gerenciar</router-link>
          </div>

          <div class="management-card">
            <h3>Pedidos</h3>
            <p>Ver todos os pedidos realizados no sistema.</p>
            <router-link to="/management/orders" class="btn btn-sm btn-outline-secondary">Gerenciar</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 100%;
}

.hero-section {
  background-color: #335;
  color: white;
  padding: 3rem 1rem;
  border-radius: 8px;
  margin-bottom: 3rem;
  width: 100%;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.subtitle {
  font-size: 1.2rem;
  max-width: 800px;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cta-button {
  background-color: white;
  color: #335;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.1rem;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
}

.feature-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h2 {
  color: #335;
  margin-top: 0;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: inline-block;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #223;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2.5rem;
  color: #335;
  margin-bottom: 0.5rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: #335;
  margin-bottom: 0.75rem;
}

.feature-card p {
  margin-bottom: 1.5rem;
  color: #666;
}

.management-section {
  margin-top: 3rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.management-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.management-card {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1.25rem;
  border: 1px solid #eee;
}

.management-card h3 {
  font-size: 1.25rem;
  color: #335;
  margin-bottom: 0.5rem;
}

.management-card p {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #666;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }

  .feature-cards, .management-cards {
    grid-template-columns: 1fr;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
