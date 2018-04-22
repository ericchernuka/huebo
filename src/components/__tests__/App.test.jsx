import React from 'react'
import copyMock from 'copy-to-clipboard'
import {
  renderIntoDocument,
  fireEvent,
  cleanup,
  wait,
} from 'react-testing-library'
import App from '../App'

afterEach(cleanup)

test('defaults to 60 when first loaded', () => {
  const { getByLabelText } = renderIntoDocument(<App />)
  const rangeNode = getByLabelText('Hue')
  expect(rangeNode.value).toEqual(String(60))
})

test('selecting a swatch and pressing a format copies it to the clipboard', async () => {
  const { container, getByTestId, getByLabelText } = renderIntoDocument(<App />)
  const rangeNode = getByLabelText('Hue')

  // Changes base hue to 120
  rangeNode.value = 120
  fireEvent.change(rangeNode)
  expect(rangeNode.value).toEqual(String(120))

  const firstSwatch = container.querySelectorAll('button')[0]
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
})
