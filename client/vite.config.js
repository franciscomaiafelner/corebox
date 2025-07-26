import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Pedidos que comecem por /api serão redirecionados
      '/api': {
        target: 'http://localhost:5001', // O nosso servidor backend
        changeOrigin: true,
      }
    }
  }
})