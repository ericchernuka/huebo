import React from 'react'
import HsbSwatch from '../HsbSwatch'
import { renderWithRouter } from '../../../test/client-test-utils'

test('without saturation or brightness the link is to a full HSB', () => {
  const { getByText } = renderWithRouter(
    <HsbSwatch
      hex="#FFFF00"
      matchRoute="/60"
      to="/60/12/12"
      title="60,12,12"
    />,
    { route: '/60' },
  )

  const swatchNode = getByText('60,12,12').parentNode
  expect(swatchNode).toBeTruthy()
  expect(swatchNode.getAttribute('aria-pressed')).toEqual('false')
  expect(swatchNode.getAttribute('href')).toEqual('/60/12/12')
})

test('with saturation or brightness the link clears the saturation and brightness', () => {
  const { getByText } = renderWithRouter(
    <HsbSwatch
      hex="#FFFF00"
      matchRoute="/60"
      to="/60/12/12"
      title="60,12,12"
    />,
    { route: '/60/12/12' },
  )

  const swatchNode = getByText('60,12,12').parentNode
  expect(swatchNode).toBeTruthy()
  expect(swatchNode.getAttribute('aria-pressed')).toEqual('true')
  expect(swatchNode.getAttribute('href')).toEqual('/60')
})
