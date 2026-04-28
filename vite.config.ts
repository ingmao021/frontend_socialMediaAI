import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = 'https://backend-socialmedia-ixsm.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige /api/* desde el dev server de Vite al backend en Render.
      // Al ser server-to-server no hay restricción de CORS para el navegador.
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
      // El callback de Google OAuth redirige al backend, no pasa por aquí,
      // pero si hay algún flujo interno que use /oauth2 lo cubrimos.
      '/oauth2': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
