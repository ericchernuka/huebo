import React from 'react'
import copyMock from 'copy-to-clipboard'
import { Route } from 'react-router-dom'
import { renderIntoDocument, fireEvent, wait } from 'react-testing-library'
import { renderWithRouter } from '../../../test/client-test-utils'
import Huebo from '../Huebo'

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

  // Changes base hue to 120
  rangeNode.value = 120
  fireEvent.change(rangeNode)
  expect(rangeNode.value).toEqual(String(120))
  await wait(() => expect(history.location.pathname).toEqual('/120'))

  const firstSwatch = container.querySelectorAll('.hue-swatch')[0]
  fireEvent.click(firstSwatch)

  const hsbFormatNode = getByTestId('color-format-hsb')

  expect(hsbFormatNode.textContent).toMatch('120,12,12')
  fireEvent.click(hsbFormatNode.querySelector('button'))

  expect(copyMock).toHaveBeenCalledTimes(1)
  expect(copyMock).toHaveBeenLastCalledWith('120,12,12')

  expect(hsbFormatNode.textContent).toMatch('copied to clipboard')
  await wait(
    () => expect(hsbFormatNode.textContent).not.toMatch('copied to clipboard'),
    {
      timeout: 3000,
    },
  )

  // Changing the hue to 255 keeps the saturation and brightness
  rangeNode.value = 255
  fireEvent.change(rangeNode)
  expect(rangeNode.value).toEqual(String(255))
  await wait(() => expect(history.location.pathname).toEqual('/255/12/12'))
})
