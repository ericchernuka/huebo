import { z } from 'zod';
import { DEFAULT_HUE, INCREMENTS, MAX_HUE, MIN_HUE } from '../constants';

/**
 * Zod schema for validating the hue parameter (0-355).
 * Falls back to DEFAULT_HUE if invalid.
 */
export const hueSchema = z.coerce
  .number()
  .min(MIN_HUE)
  .max(MAX_HUE)
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(DEFAULT_HUE);

/**
 * Zod schema for validating saturation/brightness increment values.
 * Must be one of the allowed INCREMENTS values.
 * Falls back to the first increment if invalid.
 */
export const incrementSchema = z.coerce
  .number()
  .refine((v) => INCREMENTS.includes(v as (typeof INCREMENTS)[number]), {
    message: 'Invalid increment value',
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(INCREMENTS[0]);

/**
 * Zod schema for optional saturation/brightness values in search params.
 * Handles undefined gracefully when params are not provided.
 */
export const optionalIncrementSchema = z
  .union([
    z.undefined(),
    z.coerce
      .number()
      .refine((v) => INCREMENTS.includes(v as (typeof INCREMENTS)[number]), {
        message: 'Invalid increment value',
      })
      // eslint-disable-next-line unicorn/prefer-top-level-await
      .catch(INCREMENTS[0]),
  ])
  .optional();

/**
 * Complete search params schema for the main route.
 * - h: hue (required, falls back to DEFAULT_HUE)
 * - s: saturation (optional)
 * - b: brightness (optional)
 */
export const searchParamsSchema = z.object({
  b: optionalIncrementSchema,
  h: hueSchema,
  s: optionalIncrementSchema,
});
