import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Huebo from '../../components/Huebo';
import { INCREMENTS } from '../../constants';

const incrementSchema = z.coerce
  .number()
  .refine((v) => INCREMENTS.includes(v as (typeof INCREMENTS)[number]), {
    message: 'Invalid increment value',
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(INCREMENTS[0]);

export const Route = createFileRoute('/$hue/$saturation/$brightness')({
  component: Huebo,
  params: {
    parse: (params) => ({
      brightness: incrementSchema.parse(params.brightness),
      saturation: incrementSchema.parse(params.saturation),
    }),
    stringify: (params) => ({
      brightness: String(params.brightness),
      saturation: String(params.saturation),
    }),
  },
});
