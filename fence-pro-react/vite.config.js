import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/docs': 'http://127.0.0.1:3000'
    }
  }
})
