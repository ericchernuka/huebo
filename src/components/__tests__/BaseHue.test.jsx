import React from 'react'
import { render } from 'react-testing-library'
import BaseHue from '../BaseHue'

test('renders hue degree', () => {
  const hue = 60
  const { container } = render(<BaseHue hue={hue} />)
  expect(container).toMatchSnapshot()
})
