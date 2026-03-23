import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
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
      define: {
        'process.env.API_KEY': (JSON as { str: string }).stringify(env.GEMINI_API_KEY ?? ''),
        'process.env.GEMINI_API_KEY': (JSON as { str: string }).stringify(env.GEMINI_API_KEY ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});