<script setup lang="ts">
defineProps<{
  size?: 'small' | 'medium' | 'large';
  text?: string;
}>();
</script>

<template>
  <div class="loading-container">
    <div :class="[
      'loading-spinner', 
      `spinner-${size || 'medium'}`
    ]"></div>
    <p v-if="text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #335;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-medium {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style>
