import React from 'react'
import { cleanup } from 'react-testing-library'
import { renderWithRouter } from '../../../test/client-test-utils'
import { INCREMENTS } from '../../constants'
import App from '../App'

afterEach(cleanup)

jest.mock('react-ga', () => ({
  initialize: jest.fn(),
  pageview: jest.fn(),
}))

test('defaults to 60 when first loaded', () => {
  const { getByLabelText } = renderWithRouter(<App />)
  const rangeNode = getByLabelText('Hue')
  expect(rangeNode.value).toEqual(String(60))
})

describe('when HSB selected', () => {
  test('renders any hue between 0-355', () => {
    const hues = [0, 99, 199, 200, 299, 349, 355]

    hues.forEach(hue => {
      const { history } = renderWithRouter(<App />, { route: `/${hue}` })
      expect(history.location.pathname).toEqual(`/${hue}`)
    })
  })

  test('redirects to the default if number is not between 0-355', () => {
    const hues = [-1, 356]

    hues.forEach(hue => {
      const { history } = renderWithRouter(<App />, { route: `/${hue}` })
      expect(history.location.pathname).toEqual(`/60`)
    })
  })

  test('saturation has to have accompanying brightness', () => {
    const { history } = renderWithRouter(<App />, { route: `/60/12` })
    expect(history.location.pathname).toEqual(`/60`)
  })

  test(`saturation route param can only be ${INCREMENTS}`, () => {
    INCREMENTS.forEach(increment => {
      let utils = renderWithRouter(<App />, {
        route: `/60/${increment}/${increment}`,
      })
      expect(utils.history.location.pathname).toEqual(
        `/60/${increment}/${increment}`,
      )

      const invalidIncrement = increment + 1
      utils = renderWithRouter(<App />, {
        route: `/60/${invalidIncrement}/${invalidIncrement}`,
      })
      expect(utils.history.location.pathname).toEqual(`/60`)
    })
  })
})
