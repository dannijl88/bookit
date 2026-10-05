import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// El backend (CorsConfig) solo permite el origen http://localhost:5173,
// por eso fijamos el puerto con strictPort: si el 5173 estuviera ocupado,
// Vite elegiría otro puerto y TODAS las llamadas fallarían por CORS.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
