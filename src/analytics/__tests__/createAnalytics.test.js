import { afterEach, expect, test } from 'vitest'
import { createAnalytics } from '../createAnalytics'

afterEach(() => {
  document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach(script => script.remove())
  delete window.dataLayer
  delete window.gtag
})

const calls = () => window.dataLayer.map(entry => Array.from(entry))

test('loads the Google tag and configures the GA4 measurement ID', () => {
  createAnalytics('G-TEST123')

  const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
  expect(script.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
  expect(calls()).toContainEqual(['config', 'G-TEST123', { send_page_view: false }])
})

test('sends the page template with params as a page view', () => {
  createAnalytics('G-TEST123').trackPageView({ page: '/:hue', params: { hue: '60' } })

  expect(calls()).toContainEqual(['event', 'page_view', { hue: '60', page_path: '/:hue' }])
})

test.each([undefined, '', 'UA-12345-1'])('does nothing for %j, without callers checking', id => {
  const analytics = createAnalytics(id)

  expect(() => analytics.trackPageView({ page: '/:hue', params: {} })).not.toThrow()
  expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).toBeNull()
  expect(window.dataLayer).toBeUndefined()
})
