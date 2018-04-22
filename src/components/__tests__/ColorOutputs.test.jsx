import React from 'react'
import { render } from 'react-testing-library'
import ColorOutputs from '../ColorOutputs'

const mockedOnCopy = jest.fn()

describe('when hue selected', () => {
  test('renders HSB, RGB, and Hex values', () => {
    const { getByTestId } = render(
      <ColorOutputs
        hue={60}
        saturation={100}
        brightness={100}
        hex="#FFFF00"
        onCopy={mockedOnCopy}
      />,
    )

    const hsbNode = getByTestId('color-format-hsb')
    expect(hsbNode.textContent).toMatch('60,100,100')
    const rgbNode = getByTestId('color-format-rgb')
    expect(rgbNode.textContent).toMatch('255,255,0')
    const hexNode = getByTestId('color-format-hex')
    expect(hexNode.textContent).toMatch('#FFFF00')
  })

  describe('when format matches displayed color format', () => {
    const { getByTestId } = render(
      <ColorOutputs
        copiedColorFormat="60,100,100"
        hue={60}
        saturation={100}
        brightness={100}
        hex="#FFFF00"
        onCopy={mockedOnCopy}
      />,
    )

    expect(getByTestId('color-format-hsb').textContent).toMatch(
      'copied to clipboard',
    )
    expect(getByTestId('color-format-rgb').textContent).not.toMatch(
      'copied to clipboard',
    )
    expect(getByTestId('color-format-hex').textContent).not.toMatch(
      'copied to clipboard',
    )
  })
})

describe('when hue not selected', () => {
  test('renders placeholders', () => {
    const { getByTestId } = render(<ColorOutputs onCopy={mockedOnCopy} />)

    expect(getByTestId('color-format-hsb').textContent).toMatch(
      'Select a color',
    )
    expect(getByTestId('color-format-rgb').textContent).toMatch('–')
    expect(getByTestId('color-format-hex').textContent).toMatch('–')
  })
})
