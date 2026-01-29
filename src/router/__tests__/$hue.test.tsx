import { describe, expect, test } from 'vitest';
import { DEFAULT_HUE } from '../../constants';
import { Route } from '../routes/$hue';

describe('/$hue route redirect', () => {
  test('redirects /60 to /?h=60', () => {
    expect(() => {
      Route.options.beforeLoad?.({
        params: { hue: '60' },
      } as never);
    }).toThrow();

    try {
      Route.options.beforeLoad?.({
        params: { hue: '60' },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { h: 60 },
        to: '/',
      });
    }
  });

  test('redirects /180 to /?h=180', () => {
    try {
      Route.options.beforeLoad?.({
        params: { hue: '180' },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { h: 180 },
        to: '/',
      });
    }
  });

  test('redirects /999 to /?h=60 (fallback to default)', () => {
    try {
      Route.options.beforeLoad?.({
        params: { hue: '999' },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { h: DEFAULT_HUE },
        to: '/',
      });
    }
  });

  test('redirects /-1 to /?h=60 (fallback to default)', () => {
    try {
      Route.options.beforeLoad?.({
        params: { hue: '-1' },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { h: DEFAULT_HUE },
        to: '/',
      });
    }
  });

  test('handles string hue values', () => {
    try {
      Route.options.beforeLoad?.({
        params: { hue: 'invalid' },
      } as never);
    } catch (error: unknown) {
      expect((error as { status: number }).status).toBe(307);
      expect(
        (error as { options: { search: unknown; to: string } }).options,
      ).toMatchObject({
        search: { h: DEFAULT_HUE },
        to: '/',
      });
    }
  });
});
