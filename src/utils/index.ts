import { INCREMENTS, MAX_HUE, MIN_HUE } from '../constants';
import { hsb2Hex } from './color_utils';

export interface HSBColor {
  brightness: number;
  hex: string;
  hue: number;
  saturation: number;
}

/**
 * Builds HSB increments based off a single hue value.
 * @param hue Hue value between 0 and 355
 */
export const buildHueIncrements = (hue = 60): HSBColor[] => {
  if (hue < MIN_HUE || hue > MAX_HUE) {
    throw new Error('Hue value must be between 0 and 355');
  }

  return INCREMENTS.brightness.reduce((acc: HSBColor[], brightness) => {
    INCREMENTS.saturation.forEach((saturation) => {
      acc.push({
        brightness,
        hex: hsb2Hex(hue, saturation, brightness),
        hue,
        saturation,
      });
    });

    return acc;
  }, []);
};

/**
 * Extracts values if present from the url params
 * @param params.hue Hue from url
 * @param params.saturation Saturation from url
 * @param params.brightness Brightness from url
 */
export const extractHSBValuesFromParams = (
  params: Record<string, string | undefined>,
): Record<string, number | null> =>
  Object.keys(params).reduce(
    (acc, key) => {
      const value = params[key];
      const parsedNum = value !== undefined ? Number(value) : Number.NaN;
      acc[key] = parsedNum >= 0 ? parsedNum : null;
      return acc;
    },
    {} as Record<string, number | null>,
  );
