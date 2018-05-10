import React from 'react'
import { cleanup } from 'react-testing-library'
import { renderWithRouter } from '../../../test/client-test-utils'
import SwatchGrid from '../SwatchGrid'

afterEach(cleanup)

test('renders a grid of 64 swatches', () => {
  const { container } = renderWithRouter(
    <SwatchGrid hue={60} onSelect={jest.fn()} />,
  )
  const swatches = container.querySelectorAll('a.hue-swatch')
  expect(swatches).toHaveLength(64)
})
