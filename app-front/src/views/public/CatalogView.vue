<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { fetchProducts, type Product } from '@/services/products';
import { formatCurrency } from '@/utils/formatters';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import CheckoutDisclaimer from '@/components/ui/CheckoutDisclaimer.vue';

const cartStore = useCartStore();
const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    products.value = await fetchProducts();
  } catch (err) {
    error.value = 'Erro ao carregar produtos. Tente novamente mais tarde.';
    console.error('Erro ao buscar produtos:', err);
  } finally {
    loading.value = false;
  }
});

function addProductToCart(product: Product) {
  cartStore.addToCart(product, 1);
  console.log('Produto adicionado ao carrinho:', product);
  console.log('Total de itens no carrinho:', cartStore.totalItems);
}

function isProductInCart(productId: number): boolean {
  return cartStore.items.some(item => item.product.id === productId);
}

function removeProductFromCart(productId: number) {
  cartStore.removeFromCart(productId);
}
</script>

<template>
  <div class="app-area">
    <div class="container p-4">
      <div v-if="loading" class="text-center py-5">
        <LoadingSpinner />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="app-content box mb-0">
          <div class="product-item">
            <img 
              :src="product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/60x60?text=Sem+Imagem'" 
              :alt="product.name" 
            >
            <div style="flex:1;">
              <div class="product-name">{{ product.name }}</div>
              <div v-if="product.description" class="product-description">
                {{ product.description }}
              </div>
              <div class="product-price">
                <div v-if="product.price > (product.sale_price || 0)" class="product-price-compare">
                  R$ {{ formatCurrency(product.price) }}
                </div>
                <div class="product-price-signature">
                  R$ {{ formatCurrency(product.sale_price || product.price) }}/mês
                </div>
              </div>
            </div>
            <div class="product-actions d-flex align-items-center">
              <button
                v-if="!isProductInCart(product.id)"
                class="btn btn-sm btn-primary"
                @click="addProductToCart(product)"
              >
                Adicionar
              </button>
              <button
                v-else
                class="btn btn-sm btn-danger"
                @click="removeProductFromCart(product.id)"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="cartStore.totalItems > 0" class="footer-info mb-3 box">
        <div class="mb-2" v-for="item in cartStore.items" :key="item.product.id">
          <!-- Apenas valores, sem listagem detalhada ou botão de remover -->
        </div>
        <hr>
        <div class="footer-subtotal">
          <span>Subtotal</span>
          <span>R$ {{ formatCurrency(cartStore.subtotal) }}</span>
        </div>
        <div v-if="cartStore.discount > 0" class="footer-discount">
          <span>Desconto</span>
          <span>- R$ {{ formatCurrency(cartStore.discount) }}</span>
        </div>
        <div class="footer-shipping">
          <span>Frete</span>
          <span>R$ {{ formatCurrency(cartStore.shipping) }}</span>
        </div>
        <div class="footer-total">
          <span>Total</span>
          <span>R$ {{ formatCurrency(cartStore.finalPrice) }}</span>
        </div>
      </div>
      
      <div class="app-action d-flex justify-content-center w-100" v-if="cartStore.totalItems > 0">
        <router-link to="/checkout" class="btn btn-primary d-block w-100">
          PROSSEGUIR
        </router-link>
      </div>
      
      <CheckoutDisclaimer />
    </div>
  </div>
</template>

<style scoped>
.app-area {
  background: #f7f9fb;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.app-logo {
  text-align: center;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-content.box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  display: flex;
  align-items: center;
  transition: box-shadow 0.2s;
}
.app-content.box:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.product-item {
  display: flex;
  align-items: center;
  width: 100%;
}
.product-item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
  margin-right: 1.5rem;
}
.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.product-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.product-price {
  margin-bottom: 0.25rem;
}
.product-price-compare {
  color: #bbb;
  text-decoration: line-through;
  font-size: 0.95rem;
}
.product-price-signature {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: bold;
}
.product-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.product-actions .btn {
  min-width: auto; /* Adjust min-width for smaller buttons */
  padding: 0.25rem 0.5rem; /* Adjust padding for btn-sm */
  font-size: 0.875rem; /* Standard btn-sm font size */
}

.product-actions .btn-danger {
  /* Optional: Add specific styles for the remove button if needed */
}

.footer-info.box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  margin-top: 2rem;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
}
.footer-subtotal, .footer-discount, .footer-shipping, .footer-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.footer-total {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e1e1;
  color: #2c3e50;
}

.app-action {
  max-width: 420px;
  margin: 2rem auto 0 auto;
}

.app-disclaimer {
  text-align: center;
  color: #888;
  font-size: 0.95rem;
  margin-top: 2.5rem;
}
.app-disclaimer img {
  margin-top: 1rem;
  max-width: 180px;
}
</style>