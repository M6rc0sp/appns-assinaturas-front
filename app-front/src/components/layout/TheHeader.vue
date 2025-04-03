<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <RouterLink to="/" class="logo-container" @click="closeMenu">
        <img alt="Logo Assinaturas" class="logo" src="@/assets/logo.svg" width="40" height="40" />
        <h1>Assinaturas App</h1>
      </RouterLink>
      
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-icon"></span>
      </button>
      
      <nav class="main-nav" :class="{ 'is-open': isMenuOpen }">
        <ul>
          <li><RouterLink to="/" @click="closeMenu" :class="{ active: route.path === '/' }">Home</RouterLink></li>
          <li><RouterLink to="/subscriptions" @click="closeMenu" :class="{ active: route.path.startsWith('/subscriptions') }">Assinaturas</RouterLink></li>
          <li><RouterLink to="/simulate" @click="closeMenu" :class="{ active: route.path.startsWith('/simulate') }">Simular</RouterLink></li>
          <li><RouterLink to="/management" @click="closeMenu" :class="{ active: route.path.startsWith('/management') }">Gerenciamento</RouterLink></li>
          <li><RouterLink to="/about" @click="closeMenu" :class="{ active: route.path.startsWith('/about') }">Sobre</RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: white;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none; /* Remover sublinhado do link */
}

.logo-container h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #335;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin-left: 1.5rem;
}

.main-nav a {
  color: #335;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.main-nav a:hover,
.main-nav a.router-link-active,
.main-nav a.active {
  background-color: rgba(51, 51, 85, 0.1);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #335;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-icon {
  display: block;
  width: 25px;
  height: 3px;
  background-color: #335;
  position: relative;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #335;
  transition: transform 0.2s;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  
  .main-nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: white;
    height: 0;
    overflow: hidden;
    transition: height 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .main-nav.is-open {
    height: auto;
    padding: 1rem 0;
  }
  
  .main-nav ul {
    flex-direction: column;
    padding: 0 1rem;
  }
  
  .main-nav li {
    margin: 0.5rem 0;
    margin-left: 0;
  }
}
</style>
