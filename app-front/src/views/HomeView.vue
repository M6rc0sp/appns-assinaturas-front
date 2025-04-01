<script setup lang="ts">
import { RouterLink } from 'vue-router';
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

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>
