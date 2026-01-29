import { describe, expect, test } from 'vitest';
import { hsb2Hex, hsb2Rgb } from '../color_utils';

describe('hsb2Rgb()', () => {
  test('converts all 6 hue segments correctly', () => {
    // Segment 0 (0-59): red dominant
    expect(hsb2Rgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });

    // Segment 1 (60-119): green rising
    expect(hsb2Rgb(60, 100, 100)).toEqual({ r: 255, g: 255, b: 0 });

    // Segment 2 (120-179): green dominant
    expect(hsb2Rgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });

    // Segment 3 (180-239): blue rising
    expect(hsb2Rgb(180, 100, 100)).toEqual({ r: 0, g: 255, b: 255 });

    // Segment 4 (240-299): blue dominant
    expect(hsb2Rgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });

    // Segment 5 (300-359): red rising
    expect(hsb2Rgb(300, 100, 100)).toEqual({ r: 255, g: 0, b: 255 });
  });

  test('handles boundary hue values', () => {
    // Min hue
    expect(hsb2Rgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });

    // Max hue (355 should be close to red)
    const result355 = hsb2Rgb(355, 100, 100);
    expect(result355.r).toBe(255);
    expect(result355.g).toBe(0);
    expect(result355.b).toBeGreaterThan(0); // Slight blue component
  });

  test('handles boundary saturation and brightness', () => {
    // Zero saturation = grayscale
    expect(hsb2Rgb(60, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    expect(hsb2Rgb(180, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });

    // Zero brightness = black
    expect(hsb2Rgb(60, 100, 0)).toEqual({ r: 0, g: 0, b: 0 });
    expect(hsb2Rgb(180, 100, 0)).toEqual({ r: 0, g: 0, b: 0 });

    // Max saturation and brightness
    expect(hsb2Rgb(60, 100, 100)).toEqual({ r: 255, g: 255, b: 0 });
  });

  test('converts known colors correctly', () => {
    // Pure red
    expect(hsb2Rgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });

    // Pure green
    expect(hsb2Rgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });

    // Pure blue
    expect(hsb2Rgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });

    // White
    expect(hsb2Rgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });

    // Black
    expect(hsb2Rgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
  });

  test('handles rounding edge cases', () => {
    // Test that values round correctly (127.5 should round to 128)
    const result = hsb2Rgb(60, 50, 50);
    expect(result.r).toBe(128);
    expect(result.g).toBe(128);
    expect(result.b).toBe(64);
  });
});

describe('hsb2Hex()', () => {
  test('formats hex values correctly', () => {
    // Should always return 7 characters with #
    expect(hsb2Hex(0, 100, 100)).toBe('#FF0000');
    expect(hsb2Hex(120, 100, 100)).toBe('#00FF00');
    expect(hsb2Hex(240, 100, 100)).toBe('#0000FF');
  });

  test('handles black and white', () => {
    expect(hsb2Hex(0, 0, 0)).toBe('#000000');
    expect(hsb2Hex(0, 0, 100)).toBe('#FFFFFF');
  });

  test('pads values correctly', () => {
    // rgb(5,5,5) should become #050505, not #555
    expect(hsb2Hex(0, 0, 2)).toBe('#050505');

    // Test another low value
    const lowValue = hsb2Hex(0, 0, 1);
    expect(lowValue).toHaveLength(7);
    expect(lowValue).toMatch(/^#[0-9A-F]{6}$/);
  });

  test('produces uppercase hex values', () => {
    const result = hsb2Hex(180, 50, 75);
    expect(result).toBe(result.toUpperCase());
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });
});
