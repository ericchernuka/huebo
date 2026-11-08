import { ReactGAImplementation } from 'react-ga4'

const noopAnalytics = Object.freeze({ trackPageView() {} })

/**
 * Creates the analytics module for an app instance.
 *
 * A missing or non-GA4 measurement ID yields an adapter that does nothing, so
 * callers never need to check whether analytics is enabled.
 *
 * `page` should be a route template (e.g. `/:hue/:saturation?`) rather than a
 * concrete URL, so reports don't fan out into one row per color. The concrete
 * values go in `params`, which GA4 exposes as custom dimensions once registered.
 */
export function createAnalytics(measurementId) {
  if (!measurementId?.startsWith('G-')) {
    return noopAnalytics
  }

  const ga = new ReactGAImplementation()
  ga.initialize(measurementId, { gtagOptions: { send_page_view: false } })

  return {
    trackPageView: ({ page, params }) =>
      ga.send({ hitType: 'pageview', page, ...params }),
  }
}

export { noopAnalytics }
