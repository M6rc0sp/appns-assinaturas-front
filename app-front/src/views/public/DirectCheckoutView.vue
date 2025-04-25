<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { fetchProductById } from '@/services/products';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import CheckoutDisclaimer from '@/components/ui/CheckoutDisclaimer.vue';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

const loading = ref(true);
const error = ref<string | null>(null);
const productId = ref<number | null>(null);

// Configurar o carrinho com o produto específico
const setupCart = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Obter o ID do produto da URL
    productId.value = parseInt(route.params.productId as string);
    
    if (!productId.value || isNaN(productId.value)) {
      error.value = 'ID de produto inválido';
      loading.value = false;
      return;
    }
    
    // Buscar informações do produto na API
    const product = await fetchProductById(productId.value);
    
    if (!product) {
      error.value = 'Produto não encontrado';
      loading.value = false;
      return;
    }
    
    // Limpar o carrinho e adicionar apenas este produto
    cartStore.clearCart();
    cartStore.addToCart(product, 1);
    
    // Redirecionar para a página de checkout
    router.replace('/checkout');
  } catch (err) {
    console.error('Erro ao processar checkout direto:', err);
    error.value = 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  setupCart();
});
</script>

<template>
  <div class="app-area">
    <div class="container p-4 text-center">
      <div v-if="loading" class="my-5">
        <LoadingSpinner />
        <p class="mt-3">Preparando seu pedido...</p>
      </div>
      
      <div v-else-if="error" class="error-container my-5">
        <div class="error-icon">
          <span class="material-symbols-outlined">error</span>
        </div>
        <h3 class="error-title">Ops! Produto não encontrado</h3>
        <p class="error-message">{{ error }}</p>
        <p class="error-instruction">O produto que você está procurando não está disponível ou não existe.</p>
        <div class="mt-4">
          <router-link to="/catalog" class="btn btn-primary btn-lg">
            Ver outros produtos disponíveis
          </router-link>
        </div>
      </div>
      
      <CheckoutDisclaimer />
    </div>
  </div>
</template>

<style scoped>
.app-area {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.error-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 3rem 2rem;
  max-width: 600px;
  margin: 2rem auto;
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.error-icon .material-symbols-outlined {
  font-size: 4rem;
  color: #dc3545;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 1rem;
}

.error-message {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.error-instruction {
  color: #6c757d;
  margin-bottom: 1.5rem;
}
</style>