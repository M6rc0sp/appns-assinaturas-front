<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import logoImg from '@/assets/logo.png';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function logout() {
  authStore.logout();
  router.push('/');
  closeMenu();
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <RouterLink to="/" class="logo-container" @click="closeMenu">
        <img alt="Logo Assinaturas" class="logo" :src="logoImg" width="40" height="40" />
        <h1>Assinaturas App</h1>
      </RouterLink>
      
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-icon"></span>
      </button>
      
      <nav class="main-nav" :class="{ 'is-open': isMenuOpen }">
        <ul>
          <!-- Links visíveis apenas para usuários logados -->
          <template v-if="isAuthenticated">
            <li><RouterLink to="/" @click="closeMenu" :class="{ active: route.path === '/' }">Home</RouterLink></li>
            <li><RouterLink to="/subscriptions" @click="closeMenu" :class="{ active: route.path.startsWith('/subscriptions') }">Assinaturas</RouterLink></li>
            
            <li><RouterLink to="/management" @click="closeMenu" :class="{ active: route.path.startsWith('/management') }">Gerenciamento</RouterLink></li>
            <li><RouterLink to="/about" @click="closeMenu" :class="{ active: route.path.startsWith('/about') }">Sobre</RouterLink></li>
          </template>
          
          <!-- Link de catálogo removido -->
          <!-- <li><RouterLink to="/catalog" @click="closeMenu" :class="{ active: route.path.startsWith('/catalog') }">Catálogo</RouterLink></li> -->
        </ul>
        
        <!-- Área de autenticação -->
        <div class="auth-area">
          <template v-if="isAuthenticated">
            <div class="user-info">
              <span class="username">Olá, {{ currentUser?.name }}</span>
              <button @click="logout" class="logout-button">Sair</button>
            </div>
          </template>
          <template v-else>
            <!-- <RouterLink to="/auth/login" @click="closeMenu" class="auth-button login">Login</RouterLink> -->
            <!-- <RouterLink to="/auth/register" @click="closeMenu" class="auth-button register">Cadastre-se</RouterLink> -->
          </template>
        </div>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #335;
}

.logo-container h1 {
  font-size: 1.3rem;
  font-weight: 600;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  position: relative;
}

.menu-icon {
  position: relative;
  display: block;
  width: 20px;
  height: 2px;
  background-color: #333;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  bottom: -6px;
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 2rem;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 1rem;
}

.main-nav a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;
}

.main-nav a:hover,
.main-nav a.active {
  color: #335;
  background-color: rgba(51, 51, 85, 0.1);
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.auth-button.login {
  color: #335;
  background-color: transparent;
  border: 1px solid #335;
}

.auth-button.login:hover {
  background-color: rgba(51, 51, 85, 0.1);
}

.auth-button.register {
  color: white;
  background-color: #335;
  border: 1px solid #335;
}

.auth-button.register:hover {
  background-color: #224;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  font-weight: 500;
  color: #335;
}

.logout-button {
  background-color: transparent;
  border: 1px solid #cc3333;
  color: #cc3333;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-button:hover {
  background-color: #cc3333;
  color: white;
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
    flex-direction: column;
  }
  
  .main-nav.is-open {
    height: auto;
    padding: 1rem 0;
  }
  
  .main-nav ul {
    flex-direction: column;
    padding: 0 1rem;
    width: 100%;
  }
  
  .main-nav li {
    margin: 0.5rem 0;
    margin-left: 0;
  }
  
  .auth-area {
    padding: 1rem;
    flex-direction: column;
    width: 100%;
    border-top: 1px solid #eee;
    margin-top: 1rem;
  }
  
  .user-info {
    flex-direction: column;
  }
  
  .auth-button {
    width: 100%;
    text-align: center;
    margin: 0.25rem 0;
  }
}
</style>
