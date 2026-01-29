import { describe, expect, test } from 'vitest';
import { DEFAULT_HUE, INCREMENTS, MAX_HUE, MIN_HUE } from '../../constants';
import {
  hueSchema,
  incrementSchema,
  optionalIncrementSchema,
  searchParamsSchema,
} from '../search-params';

describe('hueSchema', () => {
  test('accepts valid hue values', () => {
    expect(hueSchema.parse(0)).toBe(MIN_HUE);
    expect(hueSchema.parse(60)).toBe(60);
    expect(hueSchema.parse(180)).toBe(180);
    expect(hueSchema.parse(355)).toBe(MAX_HUE);
  });

  test('coerces string values to numbers', () => {
    expect(hueSchema.parse('123')).toBe(123);
    expect(hueSchema.parse('0')).toBe(0);
    expect(hueSchema.parse('355')).toBe(355);
  });

  test('falls back to DEFAULT_HUE for invalid values', () => {
    expect(hueSchema.parse(-1)).toBe(DEFAULT_HUE);
    expect(hueSchema.parse(356)).toBe(DEFAULT_HUE);
    expect(hueSchema.parse(999)).toBe(DEFAULT_HUE);
    expect(hueSchema.parse('invalid')).toBe(DEFAULT_HUE);
  });
});

describe('incrementSchema', () => {
  test('accepts valid INCREMENT values', () => {
    INCREMENTS.forEach((inc) => {
      expect(incrementSchema.parse(inc)).toBe(inc);
    });
  });

  test('coerces string values to numbers', () => {
    expect(incrementSchema.parse('50')).toBe(50);
    expect(incrementSchema.parse('100')).toBe(100);
  });

  test('falls back to first increment for invalid values', () => {
    expect(incrementSchema.parse(13)).toBe(INCREMENTS[0]); // 13 not in INCREMENTS
    expect(incrementSchema.parse(99)).toBe(INCREMENTS[0]); // 99 not in INCREMENTS
    expect(incrementSchema.parse(0)).toBe(INCREMENTS[0]);
    expect(incrementSchema.parse('invalid')).toBe(INCREMENTS[0]);
  });
});

describe('optionalIncrementSchema', () => {
  test('allows undefined', () => {
    expect(optionalIncrementSchema.parse(undefined)).toBeUndefined();
  });

  test('accepts valid INCREMENT values', () => {
    expect(optionalIncrementSchema.parse(12)).toBe(12);
    expect(optionalIncrementSchema.parse(50)).toBe(50);
    expect(optionalIncrementSchema.parse(100)).toBe(100);
  });

  test('falls back to first increment for invalid values', () => {
    expect(optionalIncrementSchema.parse(13)).toBe(INCREMENTS[0]);
    expect(optionalIncrementSchema.parse('invalid')).toBe(INCREMENTS[0]);
  });

  test('handles omitted values', () => {
    const result = optionalIncrementSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});

describe('searchParamsSchema', () => {
  test('parses minimal valid params with only hue', () => {
    const result = searchParamsSchema.parse({ h: 60 });
    expect(result).toEqual({
      h: 60,
      s: undefined,
      b: undefined,
    });
  });

  test('parses full valid params', () => {
    const result = searchParamsSchema.parse({
      h: 180,
      s: 50,
      b: 75,
    });
    expect(result).toEqual({
      h: 180,
      s: 50,
      b: 75,
    });
  });

  test('applies defaults for all invalid values', () => {
    const result = searchParamsSchema.parse({
      h: -1, // Invalid hue → DEFAULT_HUE
      s: 13, // Invalid increment → INCREMENTS[0]
      b: 99, // Invalid increment → INCREMENTS[0]
    });
    expect(result).toEqual({
      h: DEFAULT_HUE,
      s: INCREMENTS[0],
      b: INCREMENTS[0],
    });
  });

  test('handles missing optional params', () => {
    const result = searchParamsSchema.parse({ h: 120 });
    expect(result.h).toBe(120);
    expect(result.s).toBeUndefined();
    expect(result.b).toBeUndefined();
  });

  test('coerces string params to numbers', () => {
    const result = searchParamsSchema.parse({
      h: '240',
      s: '62',
      b: '88',
    });
    expect(result).toEqual({
      h: 240,
      s: 62,
      b: 88,
    });
  });
});
