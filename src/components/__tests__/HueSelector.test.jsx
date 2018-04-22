import React from 'react'
import {
  fireEvent,
  render,
  renderIntoDocument,
  cleanup,
} from 'react-testing-library'
import HueSelector from '../HueSelector'

const defaultHue = 60
const onChangeHandler = jest.fn()

afterEach(cleanup)

test('displays the range value', () => {
  const { container, getByLabelText } = render(
    <HueSelector onChange={onChangeHandler} hue={defaultHue} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  expect(rangeInputNode.value).toEqual(String(defaultHue))
  expect(container.textContent).toMatch(`${defaultHue}°`)
})

test.skip('moving the range updates the value', () => {
  const { getByLabelText } = renderIntoDocument(
    <HueSelector onChange={onChangeHandler} hue={defaultHue} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  const keyboardEvent = new KeyboardEvent('keypress', { keyCode: 39 }) // right arrow
  fireEvent(rangeInputNode, keyboardEvent)

  expect(onChangeHandler).toHaveBeenCalledTimes(1)
  expect(onChangeHandler).toHaveBeenCalledWith(65)
})
