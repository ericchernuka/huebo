import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Huebo from '../../components/Huebo';
import { DEFAULT_HUE, MAX_HUE, MIN_HUE } from '../../constants';

const hueSchema = z.coerce
  .number()
  .min(MIN_HUE)
  .max(MAX_HUE)
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(DEFAULT_HUE);

export const Route = createFileRoute('/$hue')({
  component: Huebo,
  params: {
    parse: (params) => ({
      hue: hueSchema.parse(params.hue),
    }),
    stringify: (params) => ({
      hue: String(params.hue),
    }),
  },
});
