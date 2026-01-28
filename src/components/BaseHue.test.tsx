import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { BaseHue } from './BaseHue';

describe('BaseHue', () => {
  test('renders hue degree', () => {
    const hue = 60;
    const { getByTestId } = render(<BaseHue hue={hue} />);
    const baseHueElement = getByTestId('base-hue');
    expect(baseHueElement).toHaveTextContent('60°');
  });
});
