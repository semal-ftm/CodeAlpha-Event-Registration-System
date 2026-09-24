import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Django API runs on :8000. Proxying /api keeps requests same-origin,
// so the backend needs no CORS configuration during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
