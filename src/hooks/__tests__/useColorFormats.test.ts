import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useColorFormats } from '../useColorFormats';

describe('useColorFormats()', () => {
  test('returns color values when s and b are defined', () => {
    const { result } = renderHook(() => useColorFormats(60, 50, 75));

    expect(result.current).toEqual([
      {
        label: 'HSB',
        placeholder: 'Select a color',
        testId: 'color-format-hsb',
        value: '60,50,75',
      },
      {
        label: 'RGB',
        testId: 'color-format-rgb',
        value: '191,191,96',
      },
      {
        label: 'Hex',
        testId: 'color-format-hex',
        value: '#BFBF60',
      },
    ]);
  });

  test('returns null values when s is undefined', () => {
    const { result } = renderHook(() => useColorFormats(60, undefined, 75));

    expect(result.current).toEqual([
      {
        label: 'HSB',
        placeholder: 'Select a color',
        testId: 'color-format-hsb',
        value: null,
      },
      {
        label: 'RGB',
        testId: 'color-format-rgb',
        value: null,
      },
      {
        label: 'Hex',
        testId: 'color-format-hex',
        value: null,
      },
    ]);
  });

  test('returns null values when b is undefined', () => {
    const { result } = renderHook(() => useColorFormats(60, 50, undefined));

    expect(result.current).toEqual([
      {
        label: 'HSB',
        placeholder: 'Select a color',
        testId: 'color-format-hsb',
        value: null,
      },
      {
        label: 'RGB',
        testId: 'color-format-rgb',
        value: null,
      },
      {
        label: 'Hex',
        testId: 'color-format-hex',
        value: null,
      },
    ]);
  });

  test('returns null values when both s and b are undefined', () => {
    const { result } = renderHook(() =>
      useColorFormats(60, undefined, undefined),
    );

    expect(result.current).toEqual([
      {
        label: 'HSB',
        placeholder: 'Select a color',
        testId: 'color-format-hsb',
        value: null,
      },
      {
        label: 'RGB',
        testId: 'color-format-rgb',
        value: null,
      },
      {
        label: 'Hex',
        testId: 'color-format-hex',
        value: null,
      },
    ]);
  });

  test('memoizes correctly with same inputs', () => {
    const { result, rerender } = renderHook(
      ({ h, s, b }) => useColorFormats(h, s, b),
      {
        initialProps: { h: 180, s: 50, b: 75 },
      },
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({ h: 180, s: 50, b: 75 });

    // Should be the same reference
    expect(result.current).toBe(firstResult);
  });

  test('recalculates when inputs change', () => {
    const { result, rerender } = renderHook(
      ({ h, s, b }) => useColorFormats(h, s, b),
      {
        initialProps: { h: 180, s: 50, b: 75 },
      },
    );

    const firstResult = result.current;

    // Change hue
    rerender({ h: 240, s: 50, b: 75 });

    // Should be a different reference
    expect(result.current).not.toBe(firstResult);
    expect(result.current[0].value).toBe('240,50,75');
  });
});
