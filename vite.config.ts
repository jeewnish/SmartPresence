import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_URL = 'http://localhost:8080'
const KEYCLOAK_URL = 'http://localhost:8180'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/v1': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/auth': {
        target: KEYCLOAK_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
    },
  },
})
