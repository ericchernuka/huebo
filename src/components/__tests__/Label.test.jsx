import React from 'react'
import { cleanup, render } from 'react-testing-library'
import Label from '../Label'

afterEach(cleanup)
test('renders text into an h2', () => {
  const { getByText } = render(<Label>RGB</Label>)
  const labelNode = getByText('RGB')
  expect(labelNode).toBeTruthy()
  expect(labelNode.tagName).toBe('H2')
})
