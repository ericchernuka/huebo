import { hsb2Hex, hsb2Rgb } from '../utils/color_utils';

export interface ColorFormat {
  label: string;
  value: string | null;
  testId: string;
  placeholder?: string;
}

export function useColorFormats(
  hue: number,
  saturation: number | undefined,
  brightness: number | undefined,
): ColorFormat[] {
  const hsbValue =
    brightness !== undefined && saturation !== undefined
      ? `${hue},${saturation},${brightness}`
      : null;

  let rgbValue = null;
  let hexValue = null;

  if (brightness !== undefined && saturation !== undefined) {
    const { b, g, r } = hsb2Rgb(hue, saturation, brightness);
    rgbValue = `${r},${g},${b}`;
    hexValue = hsb2Hex(hue, saturation, brightness);
  }

  return [
    {
      label: 'HSB',
      value: hsbValue,
      testId: 'color-format-hsb',
      placeholder: 'Select a color',
    },
    {
      label: 'RGB',
      value: rgbValue,
      testId: 'color-format-rgb',
    },
    {
      label: 'Hex',
      value: hexValue,
      testId: 'color-format-hex',
    },
  ];
}
