import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Ensure PostCSS config is used
  },
});
