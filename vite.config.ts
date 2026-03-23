import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    // We don't need to loadEnv and inject GEMINI_API_KEY anymore
    // It should only be accessed securely on the backend server
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: false,
          clientPort: 443,
          protocol: 'wss',
          timeout: 5000,
        }
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});