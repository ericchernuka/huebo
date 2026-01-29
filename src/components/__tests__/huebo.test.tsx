import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
// Import after mocking
import { Huebo } from '../huebo';

// Mock modules
const mockNavigate = vi.fn();
const mockUseSearch = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockUseSearch(),
}));

vi.mock('@tanstack/react-pacer', () => ({
  useDebouncedCallback: (fn: (value: number) => void) => fn,
}));

describe('Huebo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearch.mockReturnValue({ b: undefined, h: 60, s: undefined });
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with hue from URL params', () => {
    mockUseSearch.mockReturnValue({ b: undefined, h: 180, s: undefined });
    render(<Huebo />);

    expect(screen.getByTestId('base-hue')).toHaveTextContent('180°');
  });

  test('renders with full color from URL params', () => {
    mockUseSearch.mockReturnValue({ b: 75, h: 120, s: 50 });
    render(<Huebo />);

    expect(screen.getByTestId('base-hue')).toHaveTextContent('120°');
    expect(screen.getAllByText('120,50,75').length).toBeGreaterThan(0);
  });

  test('renders core components', () => {
    render(<Huebo />);

    // Should render HueSelector (base hue display)
    expect(screen.getByTestId('base-hue')).toBeInTheDocument();

    // Should render ColorOutputs (format labels)
    expect(screen.getByTestId('color-format-hsb')).toBeInTheDocument();
    expect(screen.getByTestId('color-format-rgb')).toBeInTheDocument();
    expect(screen.getByTestId('color-format-hex')).toBeInTheDocument();
  });
});
