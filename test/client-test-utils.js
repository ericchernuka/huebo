import React from 'react'
import { Router } from 'react-router-dom'
import { render } from 'react-testing-library'
import { createMemoryHistory } from 'history'

export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  const history = createMemoryHistory({ initialEntries: [route] })
  const utils = render(
    <Router history={history}>{ui}</Router>,
    renderOptions,
  )
  return {
    ...utils,
    history,
  }
}
