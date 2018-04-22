import React from 'react'
import { render } from 'react-testing-library'
import ColorFormat from '../ColorFormat'

describe('when not copied', () => {
  test('renders without "copied to clipboard" text', () => {
    const children = '255, 255, 255'
    const { container } = render(
      <ColorFormat label="RGB">{children}</ColorFormat>,
    )

    expect(container.textContent).not.toMatch('copied to clipboard')
    expect(container).toMatchSnapshot()
  })
})

describe('when copied', () => {
  test('renders with "copied to clipboard" text', () => {
    const children = '255, 255, 255'
    const { container } = render(
      <ColorFormat label="RGB" copied>
        {children}
      </ColorFormat>,
    )

    expect(container.textContent).toMatch('copied to clipboard')
    expect(container).toMatchSnapshot()
  })
})
