<template>
  <div class="not-found-page">
    <h1>Página não encontrada</h1>
    <p>A página que você tentou acessar não existe ou não está disponível.</p>
    <p class="info-text">Verifique o endereço digitado ou entre em contato com o suporte se necessário.</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found-page {
  max-width: 500px;
  margin: 5rem auto;
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
}
.not-found-page h1 {
  font-size: 2rem;
  color: #335;
  margin-bottom: 1rem;
}
.not-found-page p {
  color: #666;
  margin-bottom: 1rem;
}
.not-found-page .info-text {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}
</style>
