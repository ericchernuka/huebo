import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SwatchGrid } from '../swatch-grid';

afterEach(() => {
  cleanup();
});

describe('SwatchGrid', () => {
  test('renders 64 swatches (8x8 grid)', () => {
    const mockOnSwatchClick = vi.fn();
    render(
      <SwatchGrid
        hue={60}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    const swatches = screen.getAllByRole('button');
    expect(swatches).toHaveLength(64);
  });

  test('calls buildHueIncrements with correct hue', () => {
    const mockOnSwatchClick = vi.fn();
    render(
      <SwatchGrid
        hue={180}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    // Verify swatches have correct title format (hue,sat,bri)
    expect(screen.getByText('180,12,12')).toBeInTheDocument();
    expect(screen.getByText('180,50,50')).toBeInTheDocument();
    expect(screen.getByText('180,100,100')).toBeInTheDocument();
  });

  test('calls onSwatchClick with correct s and b values', async () => {
    const mockOnSwatchClick = vi.fn();
    render(
      <SwatchGrid
        hue={60}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    const swatches = screen.getAllByText('60,50,75');
    const swatch = swatches[0].closest('button')!;
    await userEvent.click(swatch);

    expect(mockOnSwatchClick).toHaveBeenCalledWith(50, 75);
  });

  test('highlights selected swatch by hex', () => {
    const mockOnSwatchClick = vi.fn();
    // #BFBF60 is hsb2Hex(60, 50, 75)
    render(
      <SwatchGrid
        hue={60}
        onSwatchClick={mockOnSwatchClick}
        selectedHex="#BFBF60"
      />,
    );

    const swatches = screen.getAllByText('60,50,75');
    const selectedSwatch = swatches[0].closest('button')!;
    expect(selectedSwatch).toHaveAttribute('aria-pressed', 'true');
  });

  test('no swatch is highlighted when selectedHex is null', () => {
    const mockOnSwatchClick = vi.fn();
    render(
      <SwatchGrid
        hue={60}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    const swatches = screen
      .getAllByRole('button')
      .filter((btn) => btn.classList.contains('hue-swatch'));
    swatches.forEach((swatch) => {
      expect(swatch).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test('updates swatches when hue changes', () => {
    const mockOnSwatchClick = vi.fn();
    const { rerender } = render(
      <SwatchGrid
        hue={60}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    expect(screen.getAllByText('60,50,75').length).toBeGreaterThan(0);

    rerender(
      <SwatchGrid
        hue={240}
        onSwatchClick={mockOnSwatchClick}
        selectedHex={null}
      />,
    );

    expect(screen.queryAllByText('60,50,75')).toHaveLength(0);
    expect(screen.getAllByText('240,50,75').length).toBeGreaterThan(0);
  });
});
