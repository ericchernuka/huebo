import { afterEach, expect, test, vi } from 'vitest'
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithRouter } from '../../../test/client-test-utils'
import SwatchGrid from '../SwatchGrid'

afterEach(cleanup)

test('renders a grid of 64 swatches', () => {
  const { container } = renderWithRouter(
    <SwatchGrid hue={60} onSelect={vi.fn()} />,
  )

  const swatches = container.querySelectorAll('a.hue-swatch')
  expect(swatches).toHaveLength(64)
})
