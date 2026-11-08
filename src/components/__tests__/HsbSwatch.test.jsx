import { afterEach, expect, test } from 'vitest'
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithRouter } from '../../../test/client-test-utils'
import HsbSwatch from '../HsbSwatch'

afterEach(cleanup)

test('without saturation or brightness the link is to a full HSB', () => {
  const { getByText } = renderWithRouter(
    <HsbSwatch
      hex="#FFFF00"
      matchRoute="/60"
      title="60,12,12"
      to="/60/12/12"
    />,
    { route: '/60' },
  )

  const swatchNode = getByText('60,12,12').parentNode
  expect(swatchNode).toBeTruthy()
  expect(swatchNode.getAttribute('aria-current')).toBeNull()
  expect(swatchNode.getAttribute('href')).toEqual('/60/12/12')
})

test('with saturation or brightness the link clears the saturation and brightness', () => {
  const { getByText } = renderWithRouter(
    <HsbSwatch
      hex="#FFFF00"
      matchRoute="/60"
      title="60,12,12"
      to="/60/12/12"
    />,
    { route: '/60/12/12' },
  )

  const swatchNode = getByText('60,12,12').parentNode
  expect(swatchNode).toBeTruthy()
  expect(swatchNode.getAttribute('aria-current')).toEqual('true')
  expect(swatchNode.getAttribute('href')).toEqual('/60')
})
