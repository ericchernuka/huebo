import { describe, expect, test } from 'vitest';
import { DEFAULT_HUE, INCREMENTS } from '../../constants';
import { Route } from '../routes/$hue.$saturation.$brightness';

describe('/$hue/$saturation/$brightness route redirect', () => {
  test('redirects /180/50/75 to /?h=180&s=50&b=75', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          hue: '180',
          saturation: '50',
          brightness: '75',
        },
      } as never);
    } catch (error: any) {
      expect(error.status).toBe(307);
      expect(error.options).toMatchObject({
        to: '/',
        search: { h: 180, s: 50, b: 75 },
      });
    }
  });

  test('redirects /60/12/88 to /?h=60&s=12&b=88', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          hue: '60',
          saturation: '12',
          brightness: '88',
        },
      } as never);
    } catch (error: any) {
      expect(error.status).toBe(307);
      expect(error.options).toMatchObject({
        to: '/',
        search: { h: 60, s: 12, b: 88 },
      });
    }
  });

  test('redirects with invalid increments /60/13/99 to /?h=60&s=12&b=12', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          hue: '60',
          saturation: '13', // Invalid increment
          brightness: '99', // Invalid increment
        },
      } as never);
    } catch (error: any) {
      expect(error.status).toBe(307);
      expect(error.options).toMatchObject({
        to: '/',
        search: {
          h: 60,
          s: INCREMENTS[0], // Falls back to first increment
          b: INCREMENTS[0], // Falls back to first increment
        },
      });
    }
  });

  test('redirects with invalid hue /999/50/75 to /?h=60&s=50&b=75', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          hue: '999', // Invalid hue
          saturation: '50',
          brightness: '75',
        },
      } as never);
    } catch (error: any) {
      expect(error.status).toBe(307);
      expect(error.options).toMatchObject({
        to: '/',
        search: {
          h: DEFAULT_HUE, // Falls back to default hue
          s: 50,
          b: 75,
        },
      });
    }
  });

  test('handles all invalid params', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          hue: 'invalid',
          saturation: 'invalid',
          brightness: 'invalid',
        },
      } as never);
    } catch (error: any) {
      expect(error.status).toBe(307);
      expect(error.options).toMatchObject({
        to: '/',
        search: {
          h: DEFAULT_HUE,
          s: INCREMENTS[0],
          b: INCREMENTS[0],
        },
      });
    }
  });
});
