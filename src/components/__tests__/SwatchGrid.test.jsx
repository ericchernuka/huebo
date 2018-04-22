import React from 'react'
import {
  render,
  renderIntoDocument,
  fireEvent,
  cleanup,
} from 'react-testing-library'
import SwatchGrid from '../SwatchGrid'

afterEach(cleanup)

test('renders a grid of 64 swatches', () => {
  const { container } = render(<SwatchGrid hue={60} onSelect={jest.fn()} />)
  const swatches = container.querySelectorAll('button')
  expect(swatches).toHaveLength(64)
})

test('clicking a swatch passes the swatch', () => {
  const onSelect = jest.fn()
  const { container } = renderIntoDocument(
    <SwatchGrid hue={60} onSelect={onSelect} />,
  )

  const swatches = container.querySelectorAll('button')
  fireEvent.click(swatches[0])
  expect(onSelect).toHaveBeenLastCalledWith({
    hue: 60,
    saturation: 12,
    brightness: 12,
    hex: '#1F1F1B',
  })
})
