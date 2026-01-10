import { describe, expect, it, test } from 'vitest';
import { buildHueIncrements, extractHSBValuesFromParams } from './index';

describe('buildHueIncrements()', () => {
  test('defaults to a hue of 60', () => {
    const result = buildHueIncrements();
    result.forEach((hsb) => {
      expect(hsb.hue).toEqual(60);
    });
  });

  test('builds hue increments based on a passed in hue', () => {
    const hue = 14;
    const result = buildHueIncrements(hue);
    result.forEach((hsb) => {
      expect(hsb.hue).toEqual(hue);
    });
  });

  test('throws an error if the value is not within 0-355', () => {
    expect(() => buildHueIncrements(-1)).toThrowError(/between 0 and 355/);
    expect(() => buildHueIncrements(356)).toThrowError(/between 0 and 355/);
  });
});

describe('extractHSBValuesFromParams()', () => {
  it('converts all url params to numbers', () => {
    const params = { brightness: '10', hue: '60', saturation: '10' };
    expect(extractHSBValuesFromParams(params)).toEqual({
      brightness: 10,
      hue: 60,
      saturation: 10,
    });
  });

  it('returns null if a value cant be coerced to a number', () => {
    const params = {
      brightness: '10',
      foo: 'bar',
      hue: '60',
      saturation: '10',
    };
    expect(extractHSBValuesFromParams(params)).toEqual({
      brightness: 10,
      foo: null,
      hue: 60,
      saturation: 10,
    });
  });
});
