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

  return INCREMENTS.reduce((acc, brightness) => {
    INCREMENTS.forEach((saturation) => {
      acc.push({
        brightness,
        hex: hsb2Hex(hue, saturation, brightness),
        hue,
        saturation,
      });
    });

    return acc;
  }, [] as HSBColor[]);
};
