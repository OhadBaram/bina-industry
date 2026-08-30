import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { openrouterChatDevPlugin } from './vite-plugins/openrouterChatDev';
import { leadDevPlugin } from './vite-plugins/leadDev';

// Fix: __dirname is not available in ES modules. Using fileURLToPath and import.meta.url to define the '@' alias path.
export default defineConfig({
  plugins: [react(), openrouterChatDevPlugin(), leadDevPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
