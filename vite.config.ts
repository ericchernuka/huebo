import stylex from '@stylexjs/unplugin/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { runnerImport, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { commands } from './src/__tests__/commands'

/**
 * Writes an `index.html` for every colour link, carrying that colour's title
 * and description. Link previews don't run JavaScript, so without these every
 * shared colour would unfurl as the home page.
 */
function colourLinkPages(): Plugin {
  return {
    apply: 'build',
    name: 'huebo:colour-link-pages',
    // Written to disk rather than emitted, so the build log doesn't list 4,681 files.
    async writeBundle({ dir = 'dist' }) {
      const html = await this.fs.readFile(`${dir}/index.html`, {
        encoding: 'utf8',
      })

      // Loaded through Vite rather than imported, because the config loader
      // can't follow the app's extensionless imports.
      const { module: head } = await runnerImport<
        typeof import('./src/picker/page-head')
      >('/src/picker/page-head.ts')

      // `/200/62/75` is served from `200/62/75.html`: by Vite's preview, and
      // by Vercel through `cleanUrls`.
      const pages = head.everyColor().map(async color => {
        const page = head.pageHead(color)
        const file = `${dir}${page.path}.html`

        await this.fs.mkdir(file.slice(0, file.lastIndexOf('/')), {
          recursive: true,
        })
        await this.fs.writeFile(file, head.withHead(html, page))
      })

      await Promise.all([
        ...pages,
        this.fs.writeFile(`${dir}/sitemap.xml`, head.sitemap()),
      ])
    },
  }
}

export default defineConfig({
  plugins: [
    stylex({
      unstable_moduleResolution: { type: 'commonJS' },
    }),
    react({ compiler: true }),
    colourLinkPages(),
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
          name: 'verify',
          environment: 'node',
          // The exhaustive search keeps every state it has seen, about 4 million.
          execArgv: ['--max-old-space-size=6144'],
          include: ['src/**/*.verify.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/__tests__/setup.ts'],
          browser: {
            commands,
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
