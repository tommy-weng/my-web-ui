import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: '../public',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
