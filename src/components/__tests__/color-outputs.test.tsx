import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ColorOutputs } from '../color-outputs';

vi.mock('copy-to-clipboard');

describe('ColorOutputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('renders all color formats with values', () => {
    const { container } = render(
      <ColorOutputs brightness={75} hue={60} saturation={50} />,
    );

    expect(screen.getByTestId('color-format-hsb')).toBeInTheDocument();
    expect(screen.getByTestId('color-format-rgb')).toBeInTheDocument();
    expect(screen.getByTestId('color-format-hex')).toBeInTheDocument();

    expect(container).toHaveTextContent('60,50,75');
    expect(container).toHaveTextContent('191,191,96');
    expect(container).toHaveTextContent('#BFBF60');
  });

  test('shows placeholders when no full color', () => {
    const { container } = render(
      <ColorOutputs brightness={undefined} hue={60} saturation={undefined} />,
    );

    // HSB has a custom placeholder
    expect(container).toHaveTextContent('Select a color');

    // All buttons should show placeholder or be disabled
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  test('disables buttons when no full color', () => {
    render(<ColorOutputs brightness={75} hue={60} saturation={undefined} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test('enables copy buttons when color is selected', () => {
    render(<ColorOutputs brightness={75} hue={60} saturation={50} />);

    const formatContainers = [
      screen.getByTestId('color-format-hsb'),
      screen.getByTestId('color-format-rgb'),
      screen.getByTestId('color-format-hex'),
    ];

    formatContainers.forEach((container) => {
      const button = container.querySelector('button');
      expect(button).not.toBeDisabled();
    });
  });
});
