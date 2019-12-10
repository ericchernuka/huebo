import { INCREMENTS, MAX_HUE, MIN_HUE } from '../constants';
import { hsb2Hex } from './color_utils';

/**
 * Builds HSB increments based off a single hue value.
 * @param {Number} hue Hue value between 0 and 355
 */
export const buildHueIncrements = (hue = 60) => {
  if (hue < MIN_HUE || hue > MAX_HUE) {
    throw new Error('Hue value must be between 0 and 355');
  }

  return INCREMENTS.reduce((acc, brightness) => {
    INCREMENTS.forEach(saturation => {
      acc.push({
        hue,
        saturation,
        brightness,
        hex: hsb2Hex(hue, saturation, brightness),
      });
    });

    return acc;
  }, []);
};
