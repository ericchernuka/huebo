import { ReactGAImplementation } from 'react-ga4'

/**
 * `page` is a route template such as `/:hue`, so reports don't fan out into
 * one row per colour. The concrete values go in `params`, which GA4 exposes
 * as custom dimensions once they're registered.
 */
export type PageView = {
  readonly page: string
  readonly params: Readonly<Record<string, string | undefined>>
}

export type Analytics = { readonly trackPageView: (view: PageView) => void }

const noopAnalytics: Analytics = { trackPageView: () => undefined }

/**
 * A missing or non-GA4 measurement ID gives an adapter that does nothing, so
 * callers never check whether analytics is on.
 */
export function createAnalytics(measurementId: string | undefined): Analytics {
  if (measurementId?.startsWith('G-') !== true) {
    return noopAnalytics
  }

  const ga = new ReactGAImplementation()

  ga.initialize(measurementId, { gtagOptions: { send_page_view: false } })

  return {
    trackPageView: ({ page, params }) =>
      ga.send({ hitType: 'pageview', page, ...params }),
  }
}
