import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import App from './components/App';
import Huebo from './components/Huebo';
import { DEFAULT_HUE, INCREMENTS, MAX_HUE, MIN_HUE } from './constants';

// Root route with App as layout
export const rootRoute = createRootRoute({
  component: App,
});

// Validation schemas for path params
const hueSchema = z.coerce
  .number()
  .min(MIN_HUE)
  .max(MAX_HUE)
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(DEFAULT_HUE);
const incrementSchema = z.coerce
  .number()
  .refine((v) => INCREMENTS.includes(v as (typeof INCREMENTS)[number]), {
    message: 'Invalid increment value',
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(INCREMENTS[0]);

// Index route - redirects to default hue
export const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ params: { hue: DEFAULT_HUE }, to: '/$hue' });
  },
  getParentRoute: () => rootRoute,
  path: '/',
});

// Route with hue only
export const hueOnlyRoute = createRoute({
  component: Huebo,
  getParentRoute: () => rootRoute,
  params: {
    parse: (params) => ({
      hue: hueSchema.parse(params.hue),
    }),
    stringify: (params) => ({
      hue: String(params.hue),
    }),
  },
  path: '/$hue',
});

// Route with hue, saturation, and brightness
export const fullRoute = createRoute({
  component: Huebo,
  getParentRoute: () => rootRoute,
  params: {
    parse: (params) => ({
      brightness: incrementSchema.parse(params.brightness),
      hue: hueSchema.parse(params.hue),
      saturation: incrementSchema.parse(params.saturation),
    }),
    stringify: (params) => ({
      brightness: String(params.brightness),
      hue: String(params.hue),
      saturation: String(params.saturation),
    }),
  },
  path: '/$hue/$saturation/$brightness',
});

// Build route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  hueOnlyRoute,
  fullRoute,
]);
