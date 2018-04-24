import React from 'react'
import {
  fireEvent,
  render,
  renderIntoDocument,
  cleanup,
} from 'react-testing-library'
import HueSelector from '../HueSelector'

const defaultHue = 60

afterEach(cleanup)

test('displays the range value', () => {
  const onChangeHandler = jest.fn()
  const { container, getByLabelText } = render(
    <HueSelector onChange={onChangeHandler} hue={defaultHue} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  expect(rangeInputNode.value).toEqual(String(defaultHue))
  expect(container.textContent).toMatch(`${defaultHue}°`)
})

test.skip('moving the range updates the value', () => {
  const onChangeHandler = jest.fn()
  const { getByLabelText } = renderIntoDocument(
    <HueSelector onChange={onChangeHandler} hue={defaultHue} />,
  )

  const rangeInputNode = getByLabelText('Hue')
  fireEvent.keyDown(rangeInputNode, { keyCode: 39, which: 39 })

  expect(onChangeHandler).toHaveBeenCalledTimes(1)
  expect(onChangeHandler).toHaveBeenCalledWith(65)
})
