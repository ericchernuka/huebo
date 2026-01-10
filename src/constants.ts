export const DEFAULT_HUE = 60;

export const INCREMENTS = {
  brightness: [0, 12, 25, 37, 50, 62, 75, 87, 100] as const,
  hue: [
    0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240,
    255, 270, 285, 300, 315, 330, 345,
  ] as const,
  saturation: [0, 12, 25, 37, 50, 62, 75, 87, 100] as const,
} as const;

/**
 * Hue range input step size
 */
export const HUE_STEP = 5;

/**
 * Minimum hue allowed by range input
 */
export const MIN_HUE = 0;

/**
 * Maximum hue allowed by range input
 */
export const MAX_HUE = 355;
