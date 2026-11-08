import { act, cleanup } from '@testing-library/react'
import React from 'react'
import { afterEach, expect, test } from 'vitest'
import { renderWithRouter } from '../../../test/client-test-utils'
import { AnalyticsContext } from '../AnalyticsContext'
import GoogleAnalytics from '../GoogleAnalytics'

afterEach(cleanup)

const renderTracked = route => {
  const pageViews = []
  const analytics = { trackPageView: pageView => pageViews.push(pageView) }
  const utils = renderWithRouter(
    <AnalyticsContext value={analytics}>
      <GoogleAnalytics />
    </AnalyticsContext>,
    { route },
  )
  return { ...utils, pageViews }
}

test('reports the route template with the color values as params', () => {
  const { pageViews } = renderTracked('/120/50/88?utm_source=x')

  expect(pageViews).toEqual([
    {
      page: '/:hue/:saturation/:brightness',
      params: { brightness: '88', hue: '120', saturation: '50' },
    },
  ])
})

test('tracks again when the color changes', () => {
  const { history, pageViews } = renderTracked('/60')
  act(() => history.push('/65'))

  expect(pageViews.map(view => view.params.hue)).toEqual(['60', '65'])
})

test('ignores query-only changes and unmatched routes', () => {
  const { history, pageViews } = renderTracked('/60')
  act(() => history.push('/60?foo=1'))
  act(() => history.push('/not-a-route'))

  expect(pageViews).toHaveLength(1)
})

test('does nothing without a provider', () => {
  expect(() => renderWithRouter(<GoogleAnalytics />, { route: '/60' })).not.toThrow()
})
