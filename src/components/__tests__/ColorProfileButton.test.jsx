import { afterEach, describe, expect, test, vi } from "vitest";
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import ColorProfileButton from '../ColorProfileButton'

afterEach(cleanup)

describe('when a value is present', () => {
  const value = '255,255,255'
  const onClickHandler = vi.fn()

  test('it renders the value', () => {
    const { getByText } = render(
      <ColorProfileButton onClick={onClickHandler} value={value} />,
    )

    const buttonNode = getByText(value)
    expect(buttonNode).toBeTruthy()
    expect(buttonNode.textContent).toEqual(value)
  })

  test('clicking returns the value', () => {
    const { getByText } = render(
      <ColorProfileButton onClick={onClickHandler} value={value} />,
    )

    const buttonNode = getByText(value)
    buttonNode.click()

    expect(onClickHandler).toHaveBeenCalledTimes(1)
    expect(onClickHandler).toHaveBeenCalledWith(value)
  })
})

describe('when no value', () => {
  test('renders placeholder text when present', () => {
    const placeholderText = 'Select a color'
    const { container } = render(
      <ColorProfileButton onClick={vi.fn()} placeholder={placeholderText} />,
    )

    expect(container.textContent).toMatch(placeholderText)
  })

  test('renders a default placeholder and disables the button', () => {
    const { getByText } = render(<ColorProfileButton onClick={vi.fn()} />)

    const buttonNode = getByText('–')
    expect(buttonNode.disabled).toEqual(true)
    expect(buttonNode.disabled).toEqual(true)
  })
})
