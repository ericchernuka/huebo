import { afterEach, expect, test, vi } from 'vitest'
import register from '../registerServiceWorker'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  delete navigator.serviceWorker
})

test('registers the service worker when the local script is available', async () => {
  const registerWorker = vi.fn().mockResolvedValue({})
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { register: registerWorker },
  })
  vi.stubEnv('PROD', true)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      headers: { get: () => 'application/javascript' },
      status: 200,
    }),
  )

  register()
  window.dispatchEvent(new Event('load'))

  await vi.waitFor(() =>
    expect(registerWorker).toHaveBeenCalledWith('/service-worker.js'),
  )
})
