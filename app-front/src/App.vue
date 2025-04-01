<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="topbar">
      <div class="container">
        <div class="logo-container">
          <img alt="Logo Assinaturas" class="logo" src="@/assets/logo.svg" width="40" height="40" />
          <h1>Assinaturas App</h1>
        </div>

        <nav class="main-nav">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/subscriptions">Assinaturas</RouterLink>
          <RouterLink to="/simulate">Simular</RouterLink>
          <RouterLink to="/management">Gerenciar</RouterLink>
          <RouterLink to="/about">Sobre</RouterLink>
        </nav>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} App de Assinaturas</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Reset e estilos globais */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  color: #333;
  line-height: 1.6;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Container centralizado (estilo Bootstrap) */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Topbar e navegação */
.topbar {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  margin: 0;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #335;
  font-weight: 600;
}

.main-nav {
  display: flex;
  gap: 1rem;
}

.main-nav a {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: #335;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.main-nav a:hover {
  background-color: #f0f0f0;
}

.main-nav a.router-link-active {
  background-color: #335;
  color: white;
}

/* Conteúdo principal */
.content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Rodapé */
.footer {
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 1rem 0;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
}

/* Estilos responsivos */
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
