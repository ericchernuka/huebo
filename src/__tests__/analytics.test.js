import { afterEach, expect, test } from 'vitest'
import { initializeAnalytics } from '../analytics'

afterEach(() => {
  document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach(script => script.remove())
  delete window.dataLayer
})

test('loads the Google tag and configures the GA4 measurement ID', () => {
  initializeAnalytics('G-TEST123')

  const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
  expect(script.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
  expect(script.async).toBe(true)
  expect(Array.from(window.dataLayer[0])[0]).toBe('js')
  expect(Array.from(window.dataLayer[1])).toEqual(['config', 'G-TEST123'])
})

test('does not load analytics without a GA4 measurement ID', () => {
  initializeAnalytics(undefined)
  initializeAnalytics('UA-12345-1')

  expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).toBeNull()
  expect(window.dataLayer).toBeUndefined()
})
