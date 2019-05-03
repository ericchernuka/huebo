import copyMock from 'copy-to-clipboard'
import React from 'react'
import { Route } from 'react-router-dom'
import { cleanup, fireEvent, wait } from 'react-testing-library'
import { renderWithRouter } from '../../../test/client-test-utils'
import Huebo from '../Huebo'

afterEach(cleanup)

test('defaults to 60 when first loaded', () => {
  const { getByLabelText } = renderWithRouter(
    <Route path="/:hue/:saturation?/:brightness?" component={Huebo} />,
    { route: '/60' },
  )
  const rangeNode = getByLabelText('Hue')
  expect(rangeNode.value).toEqual(String(60))
})

test('selecting a swatch and pressing a format copies it to the clipboard', async () => {
  const { container, getByTestId, getByLabelText, history } = renderWithRouter(
    <Route path="/:hue/:saturation?/:brightness?" component={Huebo} />,
    { route: '/60' },
  )
  const rangeNode = getByLabelText('Hue')

  // keyboard navigation changes selected range slider
  fireEvent.keyDown(rangeNode, { charCode: 39 })
  fireEvent.change(rangeNode, { target: { value: 61 } })
  fireEvent.keyUp(rangeNode, { charCode: 39 })
  await wait(() => expect(history.location.pathname).toEqual('/61'))

  const firstSwatch = container.querySelectorAll('.hue-swatch')[0]
  fireEvent.click(firstSwatch)

  const hsbFormatNode = getByTestId('color-format-hsb')

  expect(hsbFormatNode.textContent).toMatch('61,12,12')
  fireEvent.click(hsbFormatNode.querySelector('button'))

  expect(copyMock).toHaveBeenCalledTimes(1)
  expect(copyMock).toHaveBeenLastCalledWith('61,12,12')

  expect(hsbFormatNode.textContent).toMatch('copied to clipboard')
  await wait(
    () => expect(hsbFormatNode.textContent).not.toMatch('copied to clipboard'),
    { timeout: 3000 },
  )

  // Changing the hue to 255 keeps the saturation and brightness
  fireEvent.mouseDown(rangeNode, { button: 2 })
  fireEvent.change(rangeNode, { target: { value: 255 } })
  fireEvent.mouseUp(rangeNode, { button: 2 })
  expect(rangeNode.value).toEqual(String(255))
  await wait(() => expect(history.location.pathname).toEqual('/255/12/12'))
})
