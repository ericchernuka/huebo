import { hsb2Hex, hsb2Rgb } from '../utils/color_utils';

export interface ColorFormat {
  label: string;
  placeholder?: string;
  testId: string;
  value: string | null;
}

export function useColorFormats(
  hue: number,
  saturation: number | undefined,
  brightness: number | undefined,
): ColorFormat[] {
  const hasFullColor = saturation !== undefined && brightness !== undefined;

  const hsbValue = hasFullColor ? `${hue},${saturation},${brightness}` : null;
  const rgb = hasFullColor ? hsb2Rgb(hue, saturation, brightness) : null;
  const rgbValue = rgb ? `${rgb.r},${rgb.g},${rgb.b}` : null;
  const hexValue = hasFullColor ? hsb2Hex(hue, saturation, brightness) : null;

  return [
    {
      label: 'HSB',
      placeholder: 'Select a color',
      testId: 'color-format-hsb',
      value: hsbValue,
    },
    {
      label: 'RGB',
      testId: 'color-format-rgb',
      value: rgbValue,
    },
    {
      label: 'Hex',
      testId: 'color-format-hex',
      value: hexValue,
    },
  ];
}
