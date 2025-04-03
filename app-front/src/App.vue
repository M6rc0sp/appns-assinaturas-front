<script setup lang="ts">
import { RouterView } from 'vue-router';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';

// Observa mudanças de rota para garantir que a página role para o topo
const route = useRoute();
watch(() => route.path, () => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="app-container">
    <TheHeader />
    
    <main class="content">
      <RouterView />
    </main>
    
    <TheFooter />
  </div>
</template>

<style>
/* Reset e estilos globais */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f9f9f9;
  color: #333;
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Container centralizado (estilo Bootstrap) */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Conteúdo principal */
.content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Estilos responsivos */
@media (max-width: 1240px) {
  .content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .topbar .container {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .main-nav {
    width: 100%;
    justify-content: center;
  }
  
  .content {
    padding: 1rem;
  }
}

/* Estilos responsivos para telas grandes */
@media (min-width: 1600px) {
  .container {
    max-width: 1400px;
  }
}

@media (min-width: 2500px) {
  .container {
    max-width: 1600px;
  }
}
</style>
