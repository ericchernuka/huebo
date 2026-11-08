import { afterEach, expect, test } from "vitest";
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import Label from '../Label'

afterEach(cleanup)
test('renders text into an h2', () => {
  const { getByText } = render(<Label>RGB</Label>)
  const labelNode = getByText('RGB')
  expect(labelNode).toBeTruthy()
  expect(labelNode.tagName).toBe('H2')
})
