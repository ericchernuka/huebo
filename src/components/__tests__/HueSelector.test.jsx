import { afterEach, expect, test, vi } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
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
