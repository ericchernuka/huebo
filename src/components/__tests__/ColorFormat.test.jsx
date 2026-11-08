import { afterEach, describe, expect, test } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import ColorFormat from '../ColorFormat'

afterEach(cleanup)

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
      <ColorFormat copied label="RGB">
        {children}
      </ColorFormat>,
    )

    expect(container.textContent).toMatch('copied to clipboard')
    expect(container).toMatchSnapshot()
  })
})
