import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [reactCompiler],
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
});
