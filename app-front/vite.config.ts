import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/shop/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Tratamento para o comportamento entre iframes
          isCustomElement: (tag) => tag === 'custom-iframe-element'
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Desabilitar o cache do módulo para evitar problemas com importações
  optimizeDeps: {
    force: true
  },
  server: {
    port: 5174,
    hmr: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'https://assinaturas.appns.com.br',
        changeOrigin: true,
        // Não reescreva o caminho, mantenha o /api
        // rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        timeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
