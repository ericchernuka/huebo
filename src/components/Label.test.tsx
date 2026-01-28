import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  test('renders text into an h2', () => {
    const { getByText } = render(<Label>RGB</Label>);
    const labelNode = getByText('RGB');
    expect(labelNode).toBeTruthy();
    expect(labelNode.tagName).toBe('H2');
  });
});
