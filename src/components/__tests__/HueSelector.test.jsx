import { afterEach, expect, test, vi } from 'vitest'
import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import HueSelector from '../HueSelector'

const defaultHue = 60

afterEach(cleanup)

test('displays the range value', () => {
  const onChangeHandler = vi.fn()
  const { container, getByLabelText } = render(
    <HueSelector hue={defaultHue} onChange={onChangeHandler} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  expect(rangeInputNode.value).toEqual(String(defaultHue))
  expect(container.textContent).toMatch(`${defaultHue}°`)
})

test.skip('moving the range updates the value', () => {
  const onChangeHandler = vi.fn()
  const { getByLabelText } = render(
    <HueSelector hue={defaultHue} onChange={onChangeHandler} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  fireEvent.keyDown(rangeInputNode, { keyCode: 39, which: 39 })

  expect(onChangeHandler).toHaveBeenCalledTimes(1)
  expect(onChangeHandler).toHaveBeenCalledWith(65)
})
