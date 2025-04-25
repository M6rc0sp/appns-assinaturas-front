<script setup lang="ts">
// Componente para exibir o disclaimer do checkout em várias páginas
</script>

<template>
  <div class="app-disclaimer mt-4">
    <p>Ao prosseguir, você concorda com os <a href="#">Termos de uso</a> e a <a href="#">Política de privacidade</a>.</p>
    <p>Checkout Seguro processado por APPNS e Asaas.</p>
    <p>Problemas com o checkout? <a href="#">Entre em contato</a>.</p>
    <img src="https://www.topinvest.com.br/cursos/_assets/images/checkout-seguro.png" class="opacity-50" alt="">
  </div>
</template>

<style scoped>
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