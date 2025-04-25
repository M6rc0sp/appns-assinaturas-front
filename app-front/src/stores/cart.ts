import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '@/services/products';

interface CartItem {
  product: Product;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  
  const totalItems = computed(() => {
    return items.value.reduce((acc, item) => acc + item.quantity, 0);
  });
  
  const subtotal = computed(() => {
    return items.value.reduce((acc, item) => {
      const price = item.product.sale_price || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  });
  
  const discount = computed(() => {
    return items.value.reduce((acc, item) => {
      if (item.product.sale_price && item.product.price > item.product.sale_price) {
        const savings = (item.product.price - item.product.sale_price) * item.quantity;
        return acc + savings;
      }
      return acc;
    }, 0);
  });
  
  const shipping = ref(0);
  
  const finalPrice = computed(() => {
    return subtotal.value + shipping.value;
  });
  
  function addToCart(product: Product, quantity: number) {
    const existingItem = items.value.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({ product, quantity });
    }
  }
  
  function removeFromCart(productId: number) {
    const index = items.value.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }
  
  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
    }
  }
  
  function clearCart() {
    items.value = [];
  }
  
  function setShipping(value: number) {
    shipping.value = value;
  }
  
  return {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    finalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setShipping
  };
});