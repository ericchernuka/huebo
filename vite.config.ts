import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: false,
      generatedRouteTree: './src/router/routeTree.gen.ts',
      quoteStyle: 'single',
      routesDirectory: './src/router/routes',
      semicolons: true,
    }),
    tailwindcss(),
    react({
      babel: {
        plugins: [reactCompiler],
      },
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
  },
});
