import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: { outDir: 'build' },
  envPrefix: ['VITE_', 'REACT_APP_'],
  plugins: [react(), VitePWA({ filename: 'service-worker.js', injectRegister: false, manifest: false })],
  test: { environment: 'jsdom', include: ['src/**/*.test.{js,jsx}', 'src/**/__tests__/index.js'] },
})
