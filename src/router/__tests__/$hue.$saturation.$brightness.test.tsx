import { describe, expect, test } from 'vitest';
import { DEFAULT_HUE, INCREMENTS } from '../../constants';
import { Route } from '../routes/$hue.$saturation.$brightness';

describe('/$hue/$saturation/$brightness route redirect', () => {
  test('redirects /180/50/75 to /?h=180&s=50&b=75', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          brightness: '75',
          hue: '180',
          saturation: '50',
        },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { b: 75, h: 180, s: 50 },
        to: '/',
      });
    }
  });

  test('redirects /60/12/88 to /?h=60&s=12&b=88', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          brightness: '88',
          hue: '60',
          saturation: '12',
        },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { b: 88, h: 60, s: 12 },
        to: '/',
      });
    }
  });

  test('redirects with invalid increments /60/13/99 to /?h=60&s=12&b=12', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          brightness: '99', // Invalid increment
          hue: '60',
          saturation: '13', // Invalid increment
        },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: {
          b: INCREMENTS[0], // Falls back to first increment
          h: 60,
          s: INCREMENTS[0], // Falls back to first increment
        },
        to: '/',
      });
    }
  });

  test('redirects with invalid hue /999/50/75 to /?h=60&s=50&b=75', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          brightness: '75',
          hue: '999', // Invalid hue
          saturation: '50',
        },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: {
          b: 75,
          h: DEFAULT_HUE, // Falls back to default hue
          s: 50,
        },
        to: '/',
      });
    }
  });

  test('handles all invalid params', () => {
    try {
      Route.options.beforeLoad?.({
        params: {
          brightness: 'invalid',
          hue: 'invalid',
          saturation: 'invalid',
        },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: {
          b: INCREMENTS[0],
          h: DEFAULT_HUE,
          s: INCREMENTS[0],
        },
        to: '/',
      });
    }
  });
});
