import stylex from '@stylexjs/unplugin/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    stylex({
      unstable_moduleResolution: { type: 'commonJS' },
    }),
    react({ compiler: true }),
    VitePWA({
      filename: 'service-worker.js',
      injectRegister: 'script-defer',
      manifest: false,
    }),
  ],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: {
                permissions: ['clipboard-read', 'clipboard-write'],
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
