import React from 'react'
import { Router } from 'react-router-dom'
import { renderIntoDocument } from 'react-testing-library'
import { createMemoryHistory } from 'history'

export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  const history = createMemoryHistory({ initialEntries: [route] })
  const utils = renderIntoDocument(
    <Router history={history}>{ui}</Router>,
    renderOptions,
  )
  return {
    ...utils,
    history,
  }
}
