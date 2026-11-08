import { afterEach, expect, test } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import BaseHue from '../BaseHue'

afterEach(cleanup)

test('renders hue degree', () => {
  const hue = 60
  const { container } = render(<BaseHue hue={hue} />)
  expect(container).toMatchSnapshot()
})
