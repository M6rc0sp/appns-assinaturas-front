<script setup lang="ts">
// Sem props ou lógica específica
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ new Date().getFullYear() }} App de Assinaturas - Todos os direitos reservados</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #335;
  color: white;
  padding: 1rem 0;
  width: 100%;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1rem;
}

.app-footer p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
