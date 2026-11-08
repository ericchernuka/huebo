import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({ filename: 'service-worker.js', injectRegister: false, manifest: false })],
  test: { environment: 'jsdom', include: ['src/**/*.test.{js,jsx}', 'src/**/__tests__/index.js'] },
})
